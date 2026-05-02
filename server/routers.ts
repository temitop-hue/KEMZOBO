import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "./_core/trpc";
import { COOKIE_NAME, getBulkPrice } from "@shared/const";
import * as db from "./db";
import { createPaymentIntent, refundPaymentIntent } from "./stripe";
import { sendEmail } from "./_core/email";
import { ENV } from "./_core/env";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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

  // ─── Reviews (public) ───────────────────────────────────
  reviews: router({
    byProduct: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        const list = await db.getApprovedReviewsByProduct(input.productId);
        const summary = await db.getReviewSummaryByProduct(input.productId);
        return {
          summary,
          reviews: list.map((r) => ({
            id: r.id,
            customerName: r.customerName,
            rating: r.rating,
            title: r.title,
            body: r.body,
            verified: r.orderId != null, // verified-purchase badge
            createdAt: r.createdAt,
          })),
        };
      }),

    submit: publicProcedure
      .input(
        z.object({
          productId: z.number(),
          orderNumber: z.string().optional(), // optional — without it review is unverified
          customerEmail: z.string().email(),
          customerName: z.string().min(1).max(120),
          rating: z.number().int().min(1).max(5),
          title: z.string().max(200).optional(),
          body: z.string().min(10).max(2000),
        })
      )
      .mutation(async ({ input }) => {
        // Verified-purchase check — match order by number + email + delivered status
        let orderId: number | null = null;
        if (input.orderNumber) {
          const order = await db.getOrderByNumber(input.orderNumber);
          if (
            order &&
            order.customerEmail.toLowerCase() === input.customerEmail.toLowerCase() &&
            order.status === "delivered"
          ) {
            // Confirm the product is in this order
            const items = await db.getOrderItemsByOrderId(order.id);
            if (items.some((it) => it.productId === input.productId)) {
              orderId = order.id;
            }
          }
        }

        const id = await db.createReview({
          productId: input.productId,
          orderId,
          customerEmail: input.customerEmail,
          customerName: input.customerName,
          rating: input.rating,
          title: input.title ?? null,
          body: input.body,
          status: "approved", // auto-approve; admin can hide later
        });
        return { id, verified: orderId != null };
      }),
  }),

  // ─── Discounts (public — validate at checkout) ─────────
  discounts: router({
    validate: publicProcedure
      .input(z.object({ code: z.string().min(1), subtotal: z.number().int().min(0) }))
      .mutation(async ({ input }) => {
        const found = await db.getDiscountByCode(input.code);
        if (!found) return { ok: false as const, reason: "Code not found" };
        return db.evaluateDiscount(found, input.subtotal);
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
          discountCode: z.string().optional(),
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

          // Apply bulk pricing per line: 24+=5%, 100+=9%, 500+=14% off the unit price
          const discountedUnit = getBulkPrice(variant.price, item.quantity);

          resolvedItems.push({
            productId: product.id,
            variantId: variant.id,
            productName: product.name,
            variantName: variant.name,
            quantity: item.quantity,
            unitPrice: discountedUnit,
          });

          subtotal += discountedUnit * item.quantity;
        }

        // Apply discount code if provided + valid. Server is the source of truth —
        // re-validate even if the client already showed the discount in the cart.
        let discountAmount = 0;
        let appliedDiscountCode: { id: number; code: string } | null = null;
        if (input.discountCode) {
          const code = await db.getDiscountByCode(input.discountCode);
          if (code) {
            const result = db.evaluateDiscount(code, subtotal);
            if (result.ok) {
              discountAmount = result.discountCents;
              appliedDiscountCode = { id: code.id, code: code.code };
            }
            // If invalid, silently drop — order still goes through at full price
          }
        }

        const subtotalAfterDiscount = subtotal - discountAmount;
        const deliveryFee = subtotalAfterDiscount >= 25000 ? 0 : 599; // Free over $250
        const tax = Math.round(subtotalAfterDiscount * 0.06); // 6% tax estimate
        const total = subtotalAfterDiscount + deliveryFee + tax;

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
          discountCode: appliedDiscountCode?.code ?? null,
          discountAmount,
          shippingAddress: input.shippingAddress,
          customerEmail: input.customerEmail,
          stripePaymentIntentId,
        });

        // Bump usage counter on the discount code (best-effort)
        if (appliedDiscountCode) {
          db.incrementDiscountUsage(appliedDiscountCode.id).catch((err) =>
            console.error("[Discount] usage increment failed:", err)
          );
        }

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

        // Notify the owner — fire-and-forget, never block form submission
        if (ENV.ownerEmail) {
          const html = `
            <h2 style="font-family:Georgia,serif;color:#CC2936">New wholesale inquiry</h2>
            <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
              <tr><td><strong>Business:</strong></td><td>${escapeHtml(input.businessName)}</td></tr>
              <tr><td><strong>Contact:</strong></td><td>${escapeHtml(input.contactName)}</td></tr>
              <tr><td><strong>Email:</strong></td><td><a href="mailto:${escapeHtml(input.email)}">${escapeHtml(input.email)}</a></td></tr>
              ${input.phone ? `<tr><td><strong>Phone:</strong></td><td>${escapeHtml(input.phone)}</td></tr>` : ""}
              ${input.businessType ? `<tr><td><strong>Type:</strong></td><td>${escapeHtml(input.businessType)}</td></tr>` : ""}
              ${input.estimatedVolume ? `<tr><td><strong>Volume:</strong></td><td>${escapeHtml(input.estimatedVolume)}</td></tr>` : ""}
            </table>
            ${input.message ? `<p style="font-family:sans-serif;font-size:14px;margin-top:16px"><strong>Message:</strong><br>${escapeHtml(input.message).replace(/\n/g, "<br>")}</p>` : ""}
            <p style="font-family:sans-serif;font-size:12px;color:#888;margin-top:24px">Reply to this email to respond directly. Full record in admin: https://kemzobo.com/admin/wholesale</p>
          `;
          sendEmail({
            to: ENV.ownerEmail,
            subject: `Wholesale inquiry — ${input.businessName}`,
            content: `New wholesale inquiry from ${input.businessName} (${input.contactName} <${input.email}>)`,
            html,
            replyTo: { email: input.email, name: input.contactName },
          }).catch((err) => console.error("[Wholesale notify] failed:", err));
        }

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

        // Notify owner — fire-and-forget so a Brevo blip never breaks the form
        if (ENV.ownerEmail) {
          const html = `
            <h2 style="font-family:Georgia,serif;color:#CC2936">New contact message</h2>
            <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
              <tr><td><strong>From:</strong></td><td>${escapeHtml(input.name)}</td></tr>
              <tr><td><strong>Email:</strong></td><td><a href="mailto:${escapeHtml(input.email)}">${escapeHtml(input.email)}</a></td></tr>
              ${input.phone ? `<tr><td><strong>Phone:</strong></td><td>${escapeHtml(input.phone)}</td></tr>` : ""}
              ${input.subject ? `<tr><td><strong>Subject:</strong></td><td>${escapeHtml(input.subject)}</td></tr>` : ""}
            </table>
            <p style="font-family:sans-serif;font-size:14px;margin-top:16px"><strong>Message:</strong><br>${escapeHtml(input.message).replace(/\n/g, "<br>")}</p>
            <p style="font-family:sans-serif;font-size:12px;color:#888;margin-top:24px">Reply to this email to respond directly. Full record in admin: https://kemzobo.com/admin/messages</p>
          `;
          sendEmail({
            to: ENV.ownerEmail,
            subject: input.subject ? `Contact: ${input.subject}` : `Contact from ${input.name}`,
            content: `New message from ${input.name} <${input.email}>:\n\n${input.message}`,
            html,
            replyTo: { email: input.email, name: input.name },
          }).catch((err) => console.error("[Contact notify] failed:", err));
        }

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

          // Notify the customer + BCC owner so there's a paper trail
          const totalDollars = (order.total / 100).toFixed(2);
          const refundHtml = `
            <h2 style="font-family:Georgia,serif;color:#CC2936">Refund issued</h2>
            <p style="font-family:sans-serif;font-size:14px">
              Your order <strong>${order.orderNumber}</strong> has been refunded for <strong>$${totalDollars}</strong>.
            </p>
            <p style="font-family:sans-serif;font-size:14px">
              ${order.stripePaymentIntentId
                ? "The refund was issued to your card and should appear on your statement within 5-10 business days."
                : "We will reverse the Zelle/Venmo payment manually within 24 hours."}
            </p>
            <p style="font-family:sans-serif;font-size:14px;margin-top:24px">
              Thank you for trying KEMZOBO. If you have any questions, just reply to this email.
            </p>
          `;
          sendEmail({
            to: order.customerEmail,
            bcc: ENV.ownerEmail || undefined,
            subject: `Refund issued — ${order.orderNumber}`,
            content: `Your order ${order.orderNumber} has been refunded for $${totalDollars}.`,
            html: refundHtml,
          }).catch((err) => console.error("[Refund email] failed:", err));

          return {
            success: true,
            method: order.stripePaymentIntentId ? "stripe" : "manual",
          };
        }),
    }),

    // Admin Reviews — moderation
    reviews: router({
      list: adminProcedure.query(async () => {
        const all = await db.getAllReviews();
        return Promise.all(
          all.map(async (r) => {
            const product = await db.getProductById(r.productId);
            return { ...r, productName: product?.name ?? "Unknown" };
          })
        );
      }),
      setStatus: adminProcedure
        .input(z.object({ id: z.number(), status: z.enum(["approved", "rejected", "pending"]) }))
        .mutation(async ({ input }) => {
          await db.updateReviewStatus(input.id, input.status);
          return { success: true };
        }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteReview(input.id);
          return { success: true };
        }),
    }),

    // Admin Discount codes
    discounts: router({
      list: adminProcedure.query(async () => {
        return db.getAllDiscountCodes();
      }),
      create: adminProcedure
        .input(
          z.object({
            code: z.string().min(2).max(50),
            description: z.string().max(200).optional(),
            type: z.enum(["percent", "fixed_amount"]),
            value: z.number().int().positive(),
            minOrderTotal: z.number().int().min(0).default(0),
            usageLimit: z.number().int().positive().optional(),
            validFrom: z.string().optional(), // ISO
            validUntil: z.string().optional(), // ISO
          })
        )
        .mutation(async ({ input, ctx }) => {
          if (input.type === "percent" && input.value > 100) {
            throw new Error("Percent discount cannot exceed 100");
          }
          const id = await db.createDiscountCode({
            code: input.code,
            description: input.description ?? null,
            type: input.type,
            value: input.value,
            minOrderTotal: input.minOrderTotal,
            usageLimit: input.usageLimit ?? null,
            validFrom: input.validFrom ? new Date(input.validFrom) : new Date(),
            validUntil: input.validUntil ? new Date(input.validUntil) : null,
            isActive: 1,
            createdByUserId: ctx.user?.id ?? null,
          });
          return { id };
        }),
      update: adminProcedure
        .input(
          z.object({
            id: z.number(),
            data: z.object({
              description: z.string().max(200).optional(),
              minOrderTotal: z.number().int().min(0).optional(),
              usageLimit: z.number().int().positive().nullable().optional(),
              validUntil: z.string().nullable().optional(),
              isActive: z.number().optional(),
            }),
          })
        )
        .mutation(async ({ input }) => {
          const patch: any = { ...input.data };
          if (patch.validUntil !== undefined) {
            patch.validUntil = patch.validUntil ? new Date(patch.validUntil) : null;
          }
          await db.updateDiscountCode(input.id, patch);
          return { success: true };
        }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteDiscountCode(input.id);
          return { success: true };
        }),
    }),

    // Admin Finance — revenue, expenses, profit
    finance: router({
      summary: adminProcedure
        .input(
          z.object({
            from: z.string(), // ISO date
            to: z.string(),
          })
        )
        .query(async ({ input }) => {
          const from = new Date(input.from);
          const to = new Date(input.to);
          const revenueCents = await db.getRevenueBetween(from, to);
          const expenseRows = await db.listExpenses(from, to);
          const expensesCents = expenseRows.reduce((sum, e) => sum + e.amount, 0);
          const profitCents = revenueCents - expensesCents;
          const margin = revenueCents > 0 ? profitCents / revenueCents : 0;

          // Group expenses by category for the breakdown card
          const byCategory: Record<string, number> = {};
          for (const e of expenseRows) {
            byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
          }

          return {
            from: input.from,
            to: input.to,
            revenueCents,
            expensesCents,
            profitCents,
            margin,
            expenseCount: expenseRows.length,
            byCategory,
          };
        }),

      expenses: router({
        list: adminProcedure
          .input(z.object({ from: z.string(), to: z.string() }))
          .query(async ({ input }) => {
            return db.listExpenses(new Date(input.from), new Date(input.to));
          }),
        create: adminProcedure
          .input(
            z.object({
              amount: z.number().int().positive(), // cents
              category: z.enum([
                "ingredients",
                "packaging",
                "shipping",
                "marketing",
                "equipment",
                "fees",
                "other",
              ]),
              description: z.string().min(1).max(500),
              occurredAt: z.string(), // ISO date
            })
          )
          .mutation(async ({ input, ctx }) => {
            const id = await db.createExpense({
              amount: input.amount,
              category: input.category,
              description: input.description,
              occurredAt: new Date(input.occurredAt),
              createdByUserId: ctx.user?.id ?? null,
            });
            return { id };
          }),
        delete: adminProcedure
          .input(z.object({ id: z.number() }))
          .mutation(async ({ input }) => {
            await db.deleteExpense(input.id);
            return { success: true };
          }),
      }),
    }),

    // Admin B2B Invoicing
    invoices: router({
      list: adminProcedure.query(async () => {
        return db.getAllInvoices();
      }),

      getById: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          const invoice = await db.getInvoiceById(input.id);
          if (!invoice) return null;
          const items = await db.getInvoiceItems(invoice.id);
          return { ...invoice, items };
        }),

      create: adminProcedure
        .input(
          z.object({
            clientName: z.string().min(1),
            clientEmail: z.string().email().optional(),
            clientPhone: z.string().optional(),
            clientAddress: z.string().optional(),
            dueAt: z.string(), // ISO date
            tax: z.number().int().min(0).default(0),
            notes: z.string().optional(),
            wholesaleRequestId: z.number().optional(),
            items: z
              .array(
                z.object({
                  description: z.string().min(1).max(500),
                  quantity: z.number().int().positive(),
                  unitPrice: z.number().int().positive(), // cents
                })
              )
              .min(1, "At least one line item required"),
          })
        )
        .mutation(async ({ input, ctx }) => {
          // Compute totals from items so the client can't drift them
          const subtotal = input.items.reduce(
            (sum, it) => sum + it.unitPrice * it.quantity,
            0
          );
          const total = subtotal + (input.tax ?? 0);

          const invoiceNumber = await db.nextInvoiceNumber();
          const id = await db.createInvoice({
            invoiceNumber,
            status: "draft",
            clientName: input.clientName,
            clientEmail: input.clientEmail ?? null,
            clientPhone: input.clientPhone ?? null,
            clientAddress: input.clientAddress ?? null,
            subtotal,
            tax: input.tax ?? 0,
            total,
            notes: input.notes ?? null,
            dueAt: new Date(input.dueAt),
            wholesaleRequestId: input.wholesaleRequestId ?? null,
            createdByUserId: ctx.user?.id ?? null,
          });

          for (const it of input.items) {
            await db.createInvoiceItem({
              invoiceId: id,
              description: it.description,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              lineTotal: it.unitPrice * it.quantity,
            });
          }

          return { id, invoiceNumber };
        }),

      markSent: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.updateInvoice(input.id, {
            status: "sent",
            sentAt: new Date(),
          } as any);
          return { success: true };
        }),

      markPaid: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.updateInvoice(input.id, {
            status: "paid",
            paidAt: new Date(),
          } as any);
          return { success: true };
        }),

      cancel: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.updateInvoice(input.id, { status: "cancelled" });
          return { success: true };
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteInvoice(input.id);
          return { success: true };
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
