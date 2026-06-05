import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import { Trash2, TriangleAlert, RefreshCw, ShoppingCart } from "lucide-react";
import { getCart, clearCart, updateCartItem, removeCartItem } from "../../../services/orders.jsx";

interface CartItem {
  id: number;
  productId: number;
  name?: string;
  price?: number;
  quantity: number;
  imageUrl?: string;
}

interface Cart {
  items: CartItem[];
  total?: number;
  itemCount?: number;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);

  const fetchCart = () => {
    setLoading(true);
    setError(null);
    getCart()
      .then((data) => {
        // Normalise — API may return { items: [...] } or the cart object directly
        const c = data?.items ? data : { items: Array.isArray(data) ? data : [] };
        setCart(c);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (item: CartItem, newQty: number) => {
    if (newQty < 1) return;
    setUpdatingId(item.id);
    try {
      await updateCartItem(item.id, newQty);
      setCart((prev) =>
        prev
          ? { ...prev, items: prev.items.map((i) => i.id === item.id ? { ...i, quantity: newQty } : i) }
          : prev
      );
    } catch {
      alert("Failed to update quantity.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm("Remove this item from the cart?")) return;
    setRemovingId(id);
    try {
      await removeCartItem(id);
      setCart((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => i.id !== id) } : prev
      );
    } catch {
      alert("Failed to remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Clear the entire cart?")) return;
    setClearing(true);
    try {
      await clearCart();
      setCart({ items: [] });
    } catch {
      alert("Failed to clear cart.");
    } finally {
      setClearing(false);
    }
  };

  const items = cart?.items ?? [];

  const headers = ["Product", "Price", "Quantity", "Subtotal", "Actions"];

  const data = items.map((item) => [
    <div key={`name-${item.id}`} className="flex items-center gap-3">
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded object-cover" />
      )}
      <div>
        <p className="text-sm font-medium text-gray-900">{item.name ?? `Product #${item.productId}`}</p>
        <p className="text-xs text-gray-400">ID: {item.productId}</p>
      </div>
    </div>,
    item.price !== undefined ? `₦${Number(item.price).toLocaleString()}` : "—",
    <div key={`qty-${item.id}`} className="flex items-center gap-2">
      <button
        onClick={() => handleQuantityChange(item, item.quantity - 1)}
        disabled={updatingId === item.id || item.quantity <= 1}
        className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-xs"
      >
        −
      </button>
      <span className="text-sm w-6 text-center">
        {updatingId === item.id ? "…" : item.quantity}
      </span>
      <button
        onClick={() => handleQuantityChange(item, item.quantity + 1)}
        disabled={updatingId === item.id}
        className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-xs"
      >
        +
      </button>
    </div>,
    item.price !== undefined
      ? `₦${(Number(item.price) * item.quantity).toLocaleString()}`
      : "—",
    <button
      key={`del-${item.id}`}
      className="p-1 border border-red-100 rounded text-red-500 hover:bg-red-50 disabled:opacity-40"
      onClick={() => handleRemove(item.id)}
      disabled={removingId === item.id}
    >
      <Trash2 size={15} />
    </button>,
  ]);

  const total = cart?.total
    ?? items.reduce((sum, i) => sum + (Number(i.price ?? 0) * i.quantity), 0);

  return (
    <Layout
      pageTitle="Active Cart"
      pageSubtitle="View and manage the current session cart."
      action={
        <div className="flex gap-2">
          <button
            onClick={fetchCart}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              disabled={clearing}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md hover:bg-red-100 disabled:opacity-40"
            >
              <Trash2 size={14} /> {clearing ? "Clearing..." : "Clear Cart"}
            </button>
          )}
        </div>
      }
    >
      {/* Skeleton */}
      {loading && (
        <Card>
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4" />)}
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, j) => <Skeleton key={j} className="h-10" />)}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load cart</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && items.length === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Cart is empty</p>
            <p className="text-sm text-gray-400 mt-1">No active session cart found.</p>
          </div>
        </Card>
      )}

      {/* Cart Table */}
      {!loading && !error && items.length > 0 && (
        <>
          <Card className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Cart Items ({items.length})
            </h3>
            <Table headers={headers} data={data} />
          </Card>

          {/* Summary */}
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""}</p>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-0.5">Cart Total</p>
                <p className="text-xl font-bold text-gray-900">
                  ₦{Number(total).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </Layout>
  );
};

export default CartPage;