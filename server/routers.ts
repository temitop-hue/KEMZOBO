import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "./_core/trpc";
import { COOKIE_NAME } from "@shared/const";
import * as db from "./db";
import { createPaymentIntent } from "./stripe";

export const appRouter = router({
  // ─── Auth ────────────────────────────────────────────────
  auth: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      return ctx.user;
    }),
    logout: protectedProcedure.mutation(async ({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME);
      return { success: true };
    }),
  }),

  // ─── Products (public) ──────────────────────────────────
  products: router({
    list: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const allProducts = await db.getAllProducts(true);
        if (input?.category) {
          return allProducts.filter((p) => p.category === input.category);
        }
        return allProducts;
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const product = await db.getProductBySlug(input.slug);
        if (!product) return null;
        const variants = await db.getVariantsByProductId(product.id);
        return { ...product, variants };
      }),

    featured: publicProcedure.query(async () => {
      return db.getFeaturedProducts();
    }),

    getVariants: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return db.getVariantsByProductId(input.productId);
      }),
  }),

  // ─── Orders ─────────────────────────────────────────────
  orders: router({
    create: publicProcedure
      .input(
        z.object({
          customerEmail: z.string().email(),
          items: z.array(
            z.object({
              productId: z.number(),
              variantId: z.number(),
              quantity: z.number().min(1),
            })
          ),
          shippingAddress: z.object({
            name: z.string(),
            street: z.string(),
            city: z.string(),
            state: z.string(),
            zip: z.string(),
            phone: z.string(),
          }),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Calculate totals from variant prices
        let subtotal = 0;
        const resolvedItems: Array<{
          productId: number;
          variantId: number;
          productName: string;
          variantName: string;
          quantity: number;
          unitPrice: number;
        }> = [];

        for (const item of input.items) {
          const variant = await db.getVariantById(item.variantId);
          const product = await db.getProductById(item.productId);
          if (!variant || !product) continue;

          resolvedItems.push({
            productId: product.id,
            variantId: variant.id,
            productName: product.name,
            variantName: variant.name,
            quantity: item.quantity,
            unitPrice: variant.price,
          });

          subtotal += variant.price * item.quantity;
        }

        const deliveryFee = subtotal >= 5000 ? 0 : 599; // Free delivery over $50
        const tax = Math.round(subtotal * 0.06); // 6% tax estimate
        const total = subtotal + deliveryFee + tax;

        // Generate order number
        const orderCount = (await db.getAllOrders()).length;
        const orderNumber = `KZ-${10000 + orderCount + 1}`;

        // Create Stripe payment intent
        const paymentIntent = await createPaymentIntent(total, {
          orderNumber,
          customerEmail: input.customerEmail,
        });

        // Create order
        const orderId = await db.createOrder({
          userId: ctx.user?.id ?? null,
          orderNumber,
          status: "pending",
          paymentStatus: "unpaid",
          subtotal,
          deliveryFee,
          tax,
          total,
          shippingAddress: input.shippingAddress,
          customerEmail: input.customerEmail,
          stripePaymentIntentId: paymentIntent.id,
        });

        // Create order items
        for (const item of resolvedItems) {
          await db.createOrderItem({
            orderId,
            ...item,
          });
        }

        return {
          orderId,
          orderNumber,
          clientSecret: paymentIntent.client_secret,
          total,
        };
      }),

    confirmPayment: publicProcedure
      .input(z.object({ orderNumber: z.string() }))
      .query(async ({ input }) => {
        const order = await db.getOrderByNumber(input.orderNumber);
        if (!order) return null;
        const items = await db.getOrderItemsByOrderId(order.id);
        return { ...order, items };
      }),

    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrdersByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order || (order.userId !== ctx.user.id && ctx.user.role !== "admin")) return null;
        const items = await db.getOrderItemsByOrderId(order.id);
        return { ...order, items };
      }),
  }),

  // ─── Wholesale ──────────────────────────────────────────
  wholesale: router({
    submit: publicProcedure
      .input(
        z.object({
          businessName: z.string().min(1),
          contactName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          businessType: z.enum(["store", "restaurant", "event", "distributor", "other"]).optional(),
          estimatedVolume: z.string().optional(),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createWholesaleRequest(input);
        return { success: true, id };
      }),
  }),

  // ─── Email Subscribe ─────────────────────────────────────
  subscribe: router({
    submit: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await db.subscribeEmail(input.email);
        return { success: true };
      }),
  }),

  // ─── Contact ────────────────────────────────────────────
  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          subject: z.string().optional(),
          message: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createContactMessage(input);
        return { success: true, id };
      }),
  }),

  // ─── Admin ──────────────────────────────────────────────
  admin: router({
    dashboard: adminProcedure.query(async () => {
      const allOrders = await db.getAllOrders();
      const lowStock = await db.getLowStockItems();
      const paidOrders = allOrders.filter((o) => o.paymentStatus === "paid");
      const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

      return {
        totalOrders: allOrders.length,
        pendingOrders: allOrders.filter((o) => o.status === "pending").length,
        revenue,
        lowStockCount: lowStock.length,
      };
    }),

    // Admin Products
    products: router({
      list: adminProcedure.query(async () => {
        return db.getAllProducts(false);
      }),
      create: adminProcedure
        .input(
          z.object({
            name: z.string(),
            slug: z.string(),
            description: z.string().optional(),
            imageUrl: z.string().optional(),
            images: z.array(z.string()).optional(),
            category: z.enum(["classic", "tropical", "spiced", "seasonal"]).optional(),
            isFeatured: z.number().optional(),
          })
        )
        .mutation(async ({ input }) => {
          const id = await db.createProduct(input);
          return { id };
        }),
      update: adminProcedure
        .input(
          z.object({
            id: z.number(),
            data: z.object({
              name: z.string().optional(),
              slug: z.string().optional(),
              description: z.string().optional(),
              imageUrl: z.string().optional(),
              images: z.array(z.string()).optional(),
              category: z.enum(["classic", "tropical", "spiced", "seasonal"]).optional(),
              isActive: z.number().optional(),
              isFeatured: z.number().optional(),
            }),
          })
        )
        .mutation(async ({ input }) => {
          await db.updateProduct(input.id, input.data);
          return { success: true };
        }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteProduct(input.id);
          return { success: true };
        }),
    }),

    // Admin Variants
    variants: router({
      create: adminProcedure
        .input(
          z.object({
            productId: z.number(),
            name: z.string(),
            price: z.number(),
            compareAtPrice: z.number().optional(),
            sku: z.string().optional(),
            weight: z.string().optional(),
          })
        )
        .mutation(async ({ input }) => {
          const id = await db.createVariant(input);
          return { id };
        }),
      update: adminProcedure
        .input(
          z.object({
            id: z.number(),
            data: z.object({
              name: z.string().optional(),
              price: z.number().optional(),
              compareAtPrice: z.number().optional(),
              sku: z.string().optional(),
              weight: z.string().optional(),
              isActive: z.number().optional(),
            }),
          })
        )
        .mutation(async ({ input }) => {
          await db.updateVariant(input.id, input.data);
          return { success: true };
        }),
    }),

    // Admin Orders
    orders: router({
      list: adminProcedure.query(async () => {
        return db.getAllOrders();
      }),
      getById: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          const order = await db.getOrderById(input.id);
          if (!order) return null;
          const items = await db.getOrderItemsByOrderId(order.id);
          return { ...order, items };
        }),
      updateStatus: adminProcedure
        .input(
          z.object({
            id: z.number(),
            status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
          })
        )
        .mutation(async ({ input }) => {
          await db.updateOrder(input.id, { status: input.status });
          return { success: true };
        }),
      updateTracking: adminProcedure
        .input(
          z.object({
            id: z.number(),
            trackingNumber: z.string(),
            trackingCarrier: z.string().optional(),
          })
        )
        .mutation(async ({ input }) => {
          await db.updateOrder(input.id, {
            trackingNumber: input.trackingNumber,
            trackingCarrier: input.trackingCarrier,
            status: "shipped",
          });
          return { success: true };
        }),
    }),

    // Admin Wholesale
    wholesale: router({
      list: adminProcedure.query(async () => {
        return db.getAllWholesaleRequests();
      }),
      updateStatus: adminProcedure
        .input(
          z.object({
            id: z.number(),
            status: z.enum(["new", "contacted", "negotiating", "approved", "declined"]),
            adminNotes: z.string().optional(),
          })
        )
        .mutation(async ({ input }) => {
          await db.updateWholesaleRequest(input.id, {
            status: input.status,
            adminNotes: input.adminNotes,
          });
          return { success: true };
        }),
    }),

    // Admin Customers
    customers: router({
      list: adminProcedure.query(async () => {
        return db.getAllUsers();
      }),
    }),

    // Admin Messages
    messages: router({
      list: adminProcedure.query(async () => {
        return db.getAllContactMessages();
      }),
      updateStatus: adminProcedure
        .input(
          z.object({
            id: z.number(),
            status: z.enum(["new", "read", "replied"]),
          })
        )
        .mutation(async ({ input }) => {
          await db.updateContactMessage(input.id, { status: input.status });
          return { success: true };
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
