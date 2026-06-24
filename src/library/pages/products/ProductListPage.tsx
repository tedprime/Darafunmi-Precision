import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { confirmDialog } from "../../components/common/confirmDialog";
import { Plus, Edit2, Trash2, Search, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../../../services/product.jsx";

interface Product {
  id: number;
  name: string;
  category?: string;
  price: number;
  stock: number;
  status: "active" | "inactive" | "low-stock" | string;
  imageUrl?: string;
}

const STATUS_COLOR: Record<string, "green" | "gray" | "yellow"> = {
  active: "green",
  inactive: "gray",
  "low-stock": "yellow",
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [count, setCount] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    getProducts({ search, status })
      .then(({ data, count }) => {
        setProducts(data);
        setCount(count);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, status]);

  const handleDelete = async (id: number, name: string) => {
    if (!(await confirmDialog({
      title: "Delete product?",
      description: `Delete product "${name}"?`,
      confirmLabel: "Delete",
    }))) return;
    try {
      setDeletingId(id);
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryName = (category: Product["category"]) => {
    if (!category) return "—";
    if (typeof category === "object" && category !== null) {
      return (category as { name: string }).name;
    }
    return category as string;
  };

  return (
    <Layout
      pageTitle="Products"
      pageSubtitle={`Manage all your products and their details here.${count ? ` (${count} total)` : ""}`}
      action={
        <Button onClick={() => navigate("/products/add")}>
          <Plus size={16} /> Add Product
        </Button>
      }
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
            placeholder="Search products..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="low-stock">Low Stock</option>
        </select>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-8" />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load products</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Desktop Table */}
          <div className="max-md:hidden bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">All Products</h3>
            </div>
            {products.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No products found.</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    {["Name", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-900 whitespace-normal break-words">{product.name}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-normal break-words">{getCategoryName(product.category)}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">
                        {product.price !== undefined ? `₦${Number(product.price).toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">{product.stock ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        <Badge color={STATUS_COLOR[product.status] ?? "gray"}>{product.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            className="p-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 disabled:opacity-40 transition-colors"
                            onClick={() => navigate(`/products/edit/${product.id}`)}
                            disabled={deletingId === product.id}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="p-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deletingId === product.id}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {products.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No products found.</p>
            ) : products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 break-words">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{getCategoryName(product.category)}</p>
                  </div>
                  <Badge color={STATUS_COLOR[product.status] ?? "gray"}>{product.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="font-medium text-gray-800">
                    {product.price !== undefined ? `₦${Number(product.price).toFixed(2)}` : "—"}
                  </span>
                  <span>Stock: {product.stock ?? "—"}</span>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 text-xs font-medium disabled:opacity-40"
                    onClick={() => navigate(`/products/edit/${product.id}`)}
                    disabled={deletingId === product.id}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 text-xs font-medium disabled:opacity-40"
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={deletingId === product.id}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
};

export default ProductListPage;
