import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "node:path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ENV } from "./env";
import { handleStripeWebhook } from "../stripe";
import { startCron } from "../cron";
import { exportOrders, exportRevenue, exportInventory } from "../exports";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const server = createServer(app);

  // Canonical redirect: www.kemzobo.com -> kemzobo.com (GET/HEAD only — never break webhooks)
  app.use((req, res, next) => {
    if (
      (req.method === "GET" || req.method === "HEAD") &&
      req.hostname === "www.kemzobo.com"
    ) {
      return res.redirect(301, `https://kemzobo.com${req.originalUrl}`);
    }
    next();
  });

  // Stripe webhook MUST use raw body — register BEFORE json parser
  app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
  );

  // Body parsers
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Auth routes
  registerOAuthRoutes(app);

  // Serve uploaded files
  const uploadDir = path.resolve(ENV.uploadDir || "uploads");
  app.use("/uploads", express.static(uploadDir));

  // Admin CSV exports — plain HTTP so the browser triggers a file download
  app.get("/api/admin/exports/orders.csv", exportOrders);
  app.get("/api/admin/exports/revenue.csv", exportRevenue);
  app.get("/api/admin/exports/inventory.csv", exportInventory);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Vite dev or static prod
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    startCron();
  });
}

startServer().catch(console.error);
