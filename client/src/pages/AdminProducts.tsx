import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";

export default function AdminProducts() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const { data: products, isLoading } = trpc.admin.products.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  if (user?.role !== "admin") return <div className="p-8 text-center text-muted-foreground">Access denied.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <button className="rounded-lg bg-hibiscus text-white px-4 py-2 text-sm font-semibold hover:bg-hibiscus-light transition-colors">
          Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded" />)}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Featured</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.isActive ? "bg-earth-green/10 text-earth-green" : "bg-muted text-muted-foreground"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.isFeatured ? "Yes" : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-hibiscus hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
