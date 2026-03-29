import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

export default function AdminCustomers() {
  const { data: customers, isLoading } = trpc.admin.customers.list.useQuery();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display text-2xl font-bold mb-6">Customers</h1>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white rounded-lg" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F7F7]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers?.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{c.name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                      c.role === "admin" ? "bg-hibiscus/10 text-hibiscus" : "bg-gray-100 text-gray-600"
                    }`}>{c.role}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.createdAt ? format(new Date(c.createdAt), "MMM d, yyyy") : ""}
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
