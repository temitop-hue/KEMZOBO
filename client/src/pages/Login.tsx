import PageMeta from "@/components/PageMeta";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister ? form : { email: form.email, password: form.password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }
      toast.success(isRegister ? "Account created!" : "Welcome back!");
      setLocation("/");
      window.location.reload();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <PageMeta title="Sign In" path="/login" />
      <h1 className="font-display text-2xl font-bold text-foreground text-center mb-6">
        {isRegister ? "Create an Account" : "Welcome Back"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <input type="text" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
        <div>
          <label className="text-sm font-medium mb-1 block">Email *</label>
          <input type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Password *</label>
          <input type="password" required minLength={8} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-[#DC2626] hover:bg-[#EF4444] text-white py-2.5 font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : isRegister ? "Create Account" : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <button onClick={() => setIsRegister(!isRegister)} className="text-[#DC2626] font-semibold hover:underline">
          {isRegister ? "Already have an account? Sign in" : "Don't have an account? Create one"}
        </button>
      </div>

      {!isRegister && (
        <div className="mt-2 text-center">
          <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-hibiscus">
            Forgot password?
          </Link>
        </div>
      )}
    </div>
  );
}
