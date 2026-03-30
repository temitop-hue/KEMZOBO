import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { toast } from "sonner";
import { Plus, X, Pencil, Trash2 } from "lucide-react";

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  category: "classic" | "tropical" | "spiced" | "seasonal";
  isFeatured: number;
};

type VariantForm = {
  name: string;
  price: string;
  sku: string;
  weight: string;
};

const emptyProduct: ProductForm = {
  name: "", slug: "", description: "", imageUrl: "", category: "classic", isFeatured: 0,
};

const emptyVariant: VariantForm = {
  name: "", price: "", sku: "", weight: "",
};

export default function AdminProducts() {
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.admin.products.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyProduct);
  const [variants, setVariants] = useState<VariantForm[]>([{ ...emptyVariant }]);

  // Mutations
  const createProduct = trpc.admin.products.create.useMutation({
    onSuccess: async (data) => {
      // Create variants
      for (const v of variants) {
        if (v.name && v.price) {
          await createVariant.mutateAsync({
            productId: data.id,
            name: v.name,
            price: Math.round(parseFloat(v.price) * 100),
            sku: v.sku || undefined,
            weight: v.weight || undefined,
          });
        }
      }
      toast.success("Product created!");
      resetForm();
      utils.admin.products.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateProduct = trpc.admin.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated!");
      resetForm();
      utils.admin.products.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteProduct = trpc.admin.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted");
      utils.admin.products.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const createVariant = trpc.admin.variants.create.useMutation();

  function resetForm() {
    setForm(emptyProduct);
    setVariants([{ ...emptyVariant }]);
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(product: NonNullable<typeof products>[0]) {
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      category: (product.category as ProductForm["category"]) || "classic",
      isFeatured: product.isFeatured ?? 0,
    });
    setEditingId(product.id);
    setVariants([{ ...emptyVariant }]); // Can't load existing variants here without extra query
    setShowForm(true);
  }

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast.error("Name and slug are required");
      return;
    }

    if (editingId) {
      updateProduct.mutate({
        id: editingId,
        data: {
          name: form.name,
          slug: form.slug,
          description: form.description || undefined,
          imageUrl: form.imageUrl || undefined,
          category: form.category,
          isFeatured: form.isFeatured,
        },
      });
    } else {
      createProduct.mutate({
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        category: form.category,
        isFeatured: form.isFeatured,
      });
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary rounded-lg bg-hibiscus text-white px-4 py-2 text-sm font-semibold hover:bg-hibiscus-light transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* ─── Form Modal ─────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl mb-10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-display text-lg font-bold">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name + Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Product Name *</label>
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm({ ...form, name, slug: editingId ? form.slug : generateSlug(name) });
                    }}
                    className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-hibiscus"
                    placeholder="Classic Zobo"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">URL Slug *</label>
                  <input
                    type="text" required value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-hibiscus"
                    placeholder="classic-zobo"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Description</label>
                <textarea
                  rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-hibiscus"
                  placeholder="Bold, refreshing hibiscus drink..."
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Image URL</label>
                <input
                  type="text" value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-hibiscus"
                  placeholder="/images/hero-can.png"
                />
              </div>

              {/* Category + Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ProductForm["category"] })}
                    className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-hibiscus"
                  >
                    <option value="classic">Classic</option>
                    <option value="tropical">Tropical</option>
                    <option value="spiced">Spiced</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured === 1}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 rounded border-border text-hibiscus focus:ring-hibiscus"
                    />
                    <span className="text-sm font-medium">Featured on homepage</span>
                  </label>
                </div>
              </div>

              {/* Variants (new product only) */}
              {!editingId && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-foreground">Variants</label>
                    <button
                      type="button"
                      onClick={() => setVariants([...variants, { ...emptyVariant }])}
                      className="text-xs text-hibiscus font-semibold hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Variant
                    </button>
                  </div>

                  {variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Name (e.g. Single Can)"
                        value={v.name}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[i] = { ...v, name: e.target.value };
                          setVariants(updated);
                        }}
                        className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hibiscus"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price ($)"
                        value={v.price}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[i] = { ...v, price: e.target.value };
                          setVariants(updated);
                        }}
                        className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hibiscus"
                      />
                      <input
                        type="text"
                        placeholder="SKU"
                        value={v.sku}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[i] = { ...v, sku: e.target.value };
                          setVariants(updated);
                        }}
                        className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hibiscus"
                      />
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="Weight"
                          value={v.weight}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[i] = { ...v, weight: e.target.value };
                            setVariants(updated);
                          }}
                          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hibiscus"
                        />
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setVariants(variants.filter((_, j) => j !== i))}
                            className="text-muted-foreground hover:text-red-500 p-2"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-1">Price in dollars (e.g. 3.99). Will be stored in cents.</p>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                  className="btn-primary rounded-lg bg-hibiscus text-white px-6 py-2.5 font-semibold hover:bg-hibiscus-light transition-colors disabled:opacity-50"
                >
                  {createProduct.isPending || updateProduct.isPending ? "Saving..." : editingId ? "Update Product" : "Create Product"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Products Table ─────────────────────────────── */}
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white rounded-lg" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-hibiscus-bg">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Featured</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.isFeatured ? "Yes" : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(p)}
                        className="text-muted-foreground hover:text-hibiscus p-1 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${p.name}"?`)) {
                            deleteProduct.mutate({ id: p.id });
                          }
                        }}
                        className="text-muted-foreground hover:text-red-500 p-1 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
