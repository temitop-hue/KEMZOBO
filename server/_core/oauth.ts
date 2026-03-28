import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sendEmail } from "./email";
import { ENV } from "./env";
import { sdk } from "./sdk";

export function registerOAuthRoutes(app: Express) {
  // Register new account
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    try {
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: "An account with this email already exists" });
        return;
      }

      const { hashPassword } = await import("./password");
      const passwordHash = await hashPassword(password);

      const isAdmin = email === ENV.ownerEmail;
      const userId = await db.createUser({
        email,
        name: name || null,
        passwordHash,
        role: isAdmin ? "admin" : "user",
      });

      const sessionToken = await sdk.createSessionToken(userId, {
        email,
        name: name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, userId });
    } catch (error) {
      console.error("[Auth] Registration failed", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login with email/password
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    try {
      const user = await db.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const { verifyPassword } = await import("./password");
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      await db.updateLastSignedIn(user.id);

      const sessionToken = await sdk.createSessionToken(user.id, {
        email: user.email || "",
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Forgot password
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    try {
      const user = await db.getUserByEmail(email);
      if (!user) {
        res.json({ success: true });
        return;
      }

      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const resetToken = await new SignJWT({
        userId: user.id,
        email: user.email,
        purpose: "password-reset",
      })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setExpirationTime("1h")
        .sign(secret);

      const resetLink = `${ENV.baseUrl}/reset-password?token=${resetToken}`;

      await sendEmail({
        to: email,
        subject: "Reset Your Password - KEMZOBO",
        content: `You requested a password reset. Click this link to reset your password: ${resetLink}\n\nThis link expires in 1 hour.`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #7C2D12;">Reset Your Password</h2>
            <p>You requested a password reset for your KEMZOBO account.</p>
            <a href="${resetLink}" style="display: inline-block; background: #7C2D12; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">Reset Password</a>
            <p style="margin-top: 24px; color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Forgot password failed", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    try {
      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
      });

      const { userId, email, purpose } = payload as Record<string, unknown>;

      if (purpose !== "password-reset" || typeof userId !== "number" || typeof email !== "string") {
        res.status(400).json({ error: "Invalid reset token" });
        return;
      }

      const user = await db.getUserByEmail(email);
      if (!user || user.id !== userId) {
        res.status(400).json({ error: "Invalid reset token" });
        return;
      }

      const { hashPassword } = await import("./password");
      const passwordHash = await hashPassword(newPassword);
      await db.updatePasswordHash(userId, passwordHash);

      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Password reset failed", error);
      if (String(error).includes("expired")) {
        res.status(400).json({ error: "Reset link has expired. Please request a new one." });
      } else {
        res.status(400).json({ error: "Invalid or expired reset token" });
      }
    }
  });
}
