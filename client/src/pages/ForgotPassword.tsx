import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Check Your Email</h1>
        <p className="text-muted-foreground mb-6">
          If an account with that email exists, we've sent a password reset link.
        </p>
        <Link href="/login" className="text-sm text-hibiscus hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="font-display text-2xl font-bold text-center mb-6">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Email</label>
          <input type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-hibiscus text-white py-2.5 font-semibold hover:bg-hibiscus-light transition-colors disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-hibiscus">
          Back to login
        </Link>
      </div>
    </div>
  );
}
