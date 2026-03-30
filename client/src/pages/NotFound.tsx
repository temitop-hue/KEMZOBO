import PageMeta from "@/components/PageMeta";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <PageMeta title="Page Not Found" />
      <h1 className="font-display text-6xl font-bold text-hibiscus mb-4">404</h1>
      <p className="text-muted-foreground mb-6">Page not found.</p>
      <Link
        href="/"
        className="inline-block rounded-lg bg-hibiscus text-white px-6 py-2.5 font-semibold hover:bg-hibiscus-light transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
