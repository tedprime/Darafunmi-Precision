import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
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
    if (!confirm(`Delete product "${name}"?`)) return;
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

  const headers = ["Name", "Category", "Price", "Stock", "Status", "Actions"];

  const data = products.map((product) => [
    product.name,
    typeof product.category === "object" && product.category !== null
      ? (product.category as { name: string }).name
      : ((product.category as string) ?? "—"),
    product.price !== undefined ? `$${Number(product.price).toFixed(2)}` : "—",
    product.stock ?? "—",
    <Badge
      key={`status-${product.id}`}
      color={STATUS_COLOR[product.status] ?? "gray"}
    >
      {product.status}
    </Badge>,
    <div key={`actions-${product.id}`} className="flex space-x-2">
      <button
        className="p-1 border border-blue-200 rounded text-blue-500 hover:bg-blue-50 disabled:opacity-40"
        onClick={() => navigate(`/products/edit/${product.id}`)}
        disabled={deletingId === product.id}
      >
        <Edit2 size={15} />
      </button>
      <button
        className="p-1 border border-red-100 rounded text-red-500 hover:bg-red-50 disabled:opacity-40"
        onClick={() => handleDelete(product.id, product.name)}
        disabled={deletingId === product.id}
      >
        <Trash2 size={15} />
      </button>
    </div>,
  ]);

  return (
    <Layout
      pageTitle="Products"
      pageSubtitle={`Manage all your products and their details here.${count ? ` (${count} total)` : ""}`}
      action={
        <Button
          className="flex items-center"
          onClick={() => navigate("/products/add")}
        >
          <Plus size={16} className="mr-2" /> Add Product
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search products..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="low-stock">Low Stock</option>
        </select>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <Card>
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-8" />
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-gray-700 font-medium">Failed to load products</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Products Table */}
      {!loading && !error && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            All Products
          </h3>
          {data.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No products found.
            </p>
          ) : (
            <Table headers={headers} data={data} />
          )}
        </Card>
      )}
    </Layout>
  );
};

export default ProductListPage;