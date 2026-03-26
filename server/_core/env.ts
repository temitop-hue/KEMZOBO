export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerEmail: process.env.OWNER_EMAIL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  brevoApiKey: process.env.BREVO_API_KEY ?? "",
  senderEmail: process.env.SENDER_EMAIL ?? "hello@kemzobo.com",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  baseUrl: process.env.BASE_URL ?? "http://localhost:3000",
};
