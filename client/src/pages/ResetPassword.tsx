import { useState } from "react";
import { Link, useSearch } from "wouter";
import { toast } from "sonner";

export default function ResetPassword() {
  const search = useSearch();
  const token = new URLSearchParams(search).get("token");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Reset failed");
        return;
      }
      setDone(true);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Password Reset!</h1>
        <p className="text-muted-foreground mb-6">You can now sign in with your new password.</p>
        <Link href="/login" className="text-hibiscus hover:underline font-medium">
          Sign In
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Invalid reset link.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="font-display text-2xl font-bold text-center mb-6">Set New Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">New Password</label>
          <input type="password" required minLength={8} value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-hibiscus text-white py-2.5 font-semibold hover:bg-hibiscus-light transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
