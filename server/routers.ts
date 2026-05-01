import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "./_core/trpc";
import { COOKIE_NAME } from "@shared/const";
import * as db from "./db";
import { createPaymentIntent, refundPaymentIntent } from "./stripe";

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
        const filtered = input?.category
          ? allProducts.filter((p) => p.category === input.category)
          : allProducts;
        return Promise.all(
          filtered.map(async (p) => ({
            ...p,
            variants: await db.getVariantsByProductId(p.id),
          }))
        );
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
      const featured = await db.getFeaturedProducts();
      return Promise.all(
        featured.map(async (p) => ({
          ...p,
          variants: await db.getVariantsByProductId(p.id),
        }))
      );
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

        const deliveryFee = subtotal >= 25000 ? 0 : 599; // Free delivery over $250
        const tax = Math.round(subtotal * 0.06); // 6% tax estimate
        const total = subtotal + deliveryFee + tax;

        // Generate order number
        const orderCount = (await db.getAllOrders()).length;
        const orderNumber = `KZ-${10000 + orderCount + 1}`;

        // Create Stripe payment intent (skip if no Stripe keys)
        let stripePaymentIntentId: string | null = null;
        let clientSecret: string | null = null;
        try {
          if (process.env.STRIPE_SECRET_KEY) {
            const paymentIntent = await createPaymentIntent(total, {
              orderNumber,
              customerEmail: input.customerEmail,
            });
            stripePaymentIntentId = paymentIntent.id;
            clientSecret = paymentIntent.client_secret;
          }
        } catch (err) {
          console.warn("[Stripe] Payment intent creation failed, Zelle available:", err);
        }

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
          stripePaymentIntentId,
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
          clientSecret,
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
        const all = await db.getAllProducts(false);
        return Promise.all(
          all.map(async (p) => ({
            ...p,
            variants: await db.getVariantsByProductId(p.id),
          }))
        );
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
            status: z.enum(["pending", "processing", "packed", "shipped", "delivered", "cancelled"]),
          })
        )
        .mutation(async ({ input }) => {
          // Stamp the corresponding timestamp when entering a fulfillment state
          const patch: Record<string, unknown> = { status: input.status };
          const now = new Date();
          if (input.status === "packed") patch.packedAt = now;
          if (input.status === "shipped") patch.shippedAt = now;
          if (input.status === "delivered") patch.deliveredAt = now;
          await db.updateOrder(input.id, patch as any);
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
            shippedAt: new Date(),
          } as any);
          return { success: true };
        }),
      refund: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const order = await db.getOrderById(input.id);
          if (!order) throw new Error("Order not found");
          if (order.paymentStatus !== "paid") {
            throw new Error("Only paid orders can be refunded");
          }

          // Stripe refund (only if payment was via card)
          if (order.stripePaymentIntentId) {
            await refundPaymentIntent(order.stripePaymentIntentId);
          }

          await db.updateOrder(input.id, {
            paymentStatus: "refunded",
            status: "cancelled",
          });

          return {
            success: true,
            method: order.stripePaymentIntentId ? "stripe" : "manual",
          };
        }),
    }),

    // Admin Inventory — stock levels + adjustment history
    inventory: router({
      list: adminProcedure.query(async () => {
        const inv = await db.getAllInventory();
        // Decorate each row with product/variant names so the UI is self-contained
        return Promise.all(
          inv.map(async (i) => {
            const product = await db.getProductById(i.productId);
            const variant = await db.getVariantById(i.variantId);
            return {
              ...i,
              productName: product?.name ?? "Unknown",
              productSlug: product?.slug ?? "",
              variantName: variant?.name ?? "Unknown",
              variantWeight: variant?.weight ?? null,
              isLow:
                (i.quantityAvailable ?? 0) <= (i.lowStockThreshold ?? 10),
            };
          })
        );
      }),

      movements: adminProcedure
        .input(
          z
            .object({
              variantId: z.number().optional(),
              limit: z.number().min(1).max(500).optional(),
            })
            .optional()
        )
        .query(async ({ input }) => {
          const movements = await db.getInventoryMovements({
            variantId: input?.variantId,
            limit: input?.limit ?? 100,
          });
          // Decorate with product/variant labels
          return Promise.all(
            movements.map(async (m) => {
              const product = await db.getProductById(m.productId);
              const variant = await db.getVariantById(m.variantId);
              return {
                ...m,
                productName: product?.name ?? "Unknown",
                variantName: variant?.name ?? "Unknown",
              };
            })
          );
        }),

      adjust: adminProcedure
        .input(
          z.object({
            variantId: z.number(),
            delta: z.number().int(),
            reason: z.enum([
              "restock",
              "manual_adjustment",
              "loss",
              "correction",
              "refund_restock",
            ]),
            note: z.string().max(500).optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          if (input.delta === 0) throw new Error("Delta cannot be zero");
          const variant = await db.getVariantById(input.variantId);
          if (!variant) throw new Error("Variant not found");
          const result = await db.adjustInventory({
            productId: variant.productId,
            variantId: input.variantId,
            delta: input.delta,
            reason: input.reason,
            note: input.note ?? null,
            createdByUserId: ctx.user?.id ?? null,
          });
          return { success: true, balanceAfter: result.balanceAfter };
        }),
    }),

    // Admin Fulfillment Queue — paid orders that aren't yet shipped/delivered
    fulfillment: router({
      queue: adminProcedure.query(async () => {
        const all = await db.getAllOrders();
        // Anything paid but not yet out the door
        const queue = all.filter(
          (o) =>
            o.paymentStatus === "paid" &&
            (o.status === "pending" ||
              o.status === "processing" ||
              o.status === "packed")
        );
        // Resolve items for each row so the UI can show what to pack
        return Promise.all(
          queue.map(async (o) => ({
            ...o,
            items: await db.getOrderItemsByOrderId(o.id),
          }))
        );
      }),

      markPacked: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const order = await db.getOrderById(input.id);
          if (!order) throw new Error("Order not found");
          if (order.paymentStatus !== "paid") {
            throw new Error("Only paid orders can be marked packed");
          }
          await db.updateOrder(input.id, {
            status: "packed",
            packedAt: new Date(),
          } as any);
          return { success: true };
        }),

      markShipped: adminProcedure
        .input(
          z.object({
            id: z.number(),
            trackingNumber: z.string().min(1),
            trackingCarrier: z.string().optional(),
          })
        )
        .mutation(async ({ input }) => {
          await db.updateOrder(input.id, {
            status: "shipped",
            shippedAt: new Date(),
            trackingNumber: input.trackingNumber,
            trackingCarrier: input.trackingCarrier,
          } as any);
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
