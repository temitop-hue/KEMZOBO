import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { Pencil, UserPlus, X } from "lucide-react";

type Customer = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  role: "user" | "admin" | null;
  hasPassword: boolean;
  createdAt: Date | string | null;
};

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]";

export default function AdminCustomers() {
  const utils = trpc.useUtils();
  const { user: me } = useAuth();
  const { data: customers, isLoading } = trpc.admin.customers.list.useQuery();
  const [editing, setEditing] = useState<Customer | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3"><div className="w-1 h-8 rounded-full bg-[#CC2936]" /><h1 className="font-display text-2xl font-bold">Customers</h1></div>
        <button
          onClick={() => setShowInvite(true)}
          className="rounded-lg bg-[#CC2936] text-white px-4 py-2 text-sm font-semibold hover:bg-[#E63946] transition-colors flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" /> Add user
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white rounded-lg" />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#CC2936]/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#CC2936]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-white">Name</th>
                <th className="text-left px-4 py-3 font-medium text-white">Email</th>
                <th className="text-left px-4 py-3 font-medium text-white">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-white">Role</th>
                <th className="text-left px-4 py-3 font-medium text-white">Joined</th>
                <th className="text-right px-4 py-3 font-medium text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers?.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{c.name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.email}
                    {!c.hasPassword && <span className="ml-2 text-xs text-amber-600">(invite pending)</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                      c.role === "admin" ? "bg-hibiscus/10 text-hibiscus" : "bg-gray-100 text-gray-600"
                    }`}>{c.role}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.createdAt ? format(new Date(c.createdAt), "MMM d, yyyy") : ""}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditing(c as Customer)}
                      className="text-muted-foreground hover:text-[#CC2936] p-1 transition-colors"
                      title="Edit user"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditModal
          customer={editing}
          isSelf={editing.id === me?.id}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            utils.admin.customers.list.invalidate();
          }}
        />
      )}

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSaved={() => {
            setShowInvite(false);
            utils.admin.customers.list.invalidate();
          }}
        />
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl mb-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EditModal({
  customer, isSelf, onClose, onSaved,
}: { customer: Customer; isSelf: boolean; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(customer.name ?? "");
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [role, setRole] = useState<"user" | "admin">(customer.role ?? "user");

  const update = trpc.admin.customers.update.useMutation({
    onSuccess: () => {
      toast.success("User updated");
      onSaved();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "admin" && customer.role !== "admin" && !confirm(`Give ${customer.email} full admin access?`)) return;
    update.mutate({ id: customer.id, name: name.trim() || null, phone: phone.trim() || null, role });
  };

  return (
    <Modal title="Edit user" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">Email</label>
          <input type="email" value={customer.email} disabled className={`${inputClass} bg-gray-50 text-muted-foreground`} />
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">Phone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "user" | "admin")}
            disabled={isSelf}
            className={inputClass}
          >
            <option value="user">Customer</option>
            <option value="admin">Admin — full dashboard access</option>
          </select>
          {isSelf && <p className="text-xs text-muted-foreground mt-1">You can't change your own role.</p>}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button
            type="submit" disabled={update.isPending}
            className="rounded-lg bg-[#CC2936] text-white px-4 py-2 text-sm font-semibold hover:bg-[#E63946] transition-colors disabled:opacity-60"
          >
            {update.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function InviteModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"user" | "admin">("admin");

  const invite = trpc.admin.customers.invite.useMutation({
    onSuccess: (res) => {
      if (!res.needsPassword) toast.success(`${email} already has an account — role updated, they can log in now`);
      else if (res.emailed) toast.success(`Invite sent to ${email}`);
      else toast.warning(`User saved, but the invite email failed. Ask them to use "Forgot password" on the login page.`);
      onSaved();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Email required");
    invite.mutate({ email: email.trim(), name: name.trim() || undefined, role });
  };

  return (
    <Modal title="Add user" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">Email *</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoFocus />
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as "user" | "admin")} className={inputClass}>
            <option value="admin">Admin — full dashboard access</option>
            <option value="user">Customer</option>
          </select>
        </div>
        <p className="text-xs text-muted-foreground">
          New users get an email with a link to set their password (valid 7 days).
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button
            type="submit" disabled={invite.isPending}
            className="rounded-lg bg-[#CC2936] text-white px-4 py-2 text-sm font-semibold hover:bg-[#E63946] transition-colors disabled:opacity-60"
          >
            {invite.isPending ? "Saving…" : "Add user"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
