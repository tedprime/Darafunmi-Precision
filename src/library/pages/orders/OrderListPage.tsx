import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import { Search, Trash2, TriangleAlert, Eye, X } from "lucide-react";
import { getOrders, getOrder, updateOrderStatus, deleteOrder } from "../../../services/orders.jsx";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  productId: number;
  name?: string;
  quantity: number;
  price?: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod?: string;
  notes?: string;
  shippingAddress?: Record<string, string>;
  items?: OrderItem[];
  total?: number;
  createdAt?: string;
  user?: { name?: string; email?: string };
}

interface Pagination {
  page: number;
  total: number;
  totalPages: number;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const STATUS_COLOR: Record<OrderStatus | string, "blue" | "gray" | "green" | "yellow" | "red"> = {
  pending: "yellow",
  processing: "blue",
  shipped: "blue",
  delivered: "green",
  cancelled: "red",
};

const ALL_STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

// ─── Sidebar width helper ─────────────────────────────────────────
// Reads the same localStorage key Layout uses so the modal can
// offset itself by the correct sidebar width.
const getSidebarWidth = (): number => {
  try {
    const saved = localStorage.getItem("sidebarOpen");
    const isOpen = saved ? JSON.parse(saved) : true;
    return isOpen ? 288 : 64; // w-72 = 288px, w-16 = 64px
  } catch {
    return 288;
  }
};

// ─── Order Detail Modal ───────────────────────────────────────────
const OrderDetailModal = ({
  orderNumber,
  onClose,
  onStatusChange,
}: {
  orderNumber: string;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const sidebarWidth = getSidebarWidth();

  useEffect(() => {
    getOrder(orderNumber)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [orderNumber]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      onStatusChange(order.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    // Overlay — covers full viewport but centres content within the
    // remaining space to the right of the sidebar
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 p-4"
      style={{ paddingLeft: sidebarWidth }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Order {orderNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : order ? (
          <div className="p-6 space-y-5">
            {/* Status + Customer */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase font-medium mb-1">Customer</p>
                <p className="font-medium text-gray-900">{order.user?.name ?? "—"}</p>
                <p className="text-gray-500 text-xs">{order.user?.email ?? ""}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-medium mb-1">Payment</p>
                <p className="text-gray-900 capitalize">{order.paymentMethod ?? "—"}</p>
              </div>
              {order.createdAt && (
                <div>
                  <p className="text-gray-500 text-xs uppercase font-medium mb-1">Date</p>
                  <p className="text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              )}
              {order.total !== undefined && (
                <div>
                  <p className="text-gray-500 text-xs uppercase font-medium mb-1">Total</p>
                  <p className="text-gray-900 font-semibold">
                    ₦{Number(order.total).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && Object.keys(order.shippingAddress).length > 0 && (
              <div>
                <p className="text-gray-500 text-xs uppercase font-medium mb-1">
                  Shipping Address
                </p>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                  {Object.entries(order.shippingAddress).map(([k, v]) => (
                    <p key={k}>
                      <span className="capitalize text-gray-400">{k}:</span> {v}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div>
                <p className="text-gray-500 text-xs uppercase font-medium mb-2">Items</p>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-2 text-sm"
                    >
                      <span className="text-gray-800">
                        {item.name ?? `Product #${item.productId}`}
                      </span>
                      <div className="flex gap-4 text-gray-500">
                        <span>×{item.quantity}</span>
                        {item.price !== undefined && (
                          <span className="text-gray-700 font-medium">
                            ₦{Number(item.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div>
                <p className="text-gray-500 text-xs uppercase font-medium mb-1">Notes</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                  {order.notes}
                </p>
              </div>
            )}

            {/* Status Update */}
            <div>
              <p className="text-gray-500 text-xs uppercase font-medium mb-2">
                Update Status
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    disabled={updating || order.status === s}
                    onClick={() => handleStatusChange(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors
                      ${order.status === s
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="p-6 text-sm text-gray-500">Could not load order.</p>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────
const OrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true); // true = show skeleton on first load
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewingOrderNumber, setViewingOrderNumber] = useState<string | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // On subsequent fetches (filter/page changes), show skeleton again.
    // We use a ref instead of setLoading(true) directly to avoid the
    // react-hooks/set-state-in-effect ESLint warning.
    if (!isFirstLoad.current) setLoading(true);
    isFirstLoad.current = false;

    getOrders({ page: pagination.page, status })
      .then(({ data, pagination: pg }) => {
        setOrders(data);
        setPagination((prev) => ({ ...prev, ...pg }));
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status, pagination.page]);

  const handleDelete = async (id: number, orderNumber: string) => {
    if (!confirm(`Delete order ${orderNumber}?`)) return;
    setDeletingId(id);
    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert("Failed to delete order.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: newStatus as OrderStatus } : o
      )
    );
  };

  const filtered = orders.filter(
    (o) =>
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const headers = ["Order #", "Customer", "Total", "Payment", "Status", "Date", "Actions"];

  const data = filtered.map((o) => [
    <button
      key={`num-${o.id}`}
      className="text-blue-600 hover:underline font-mono text-xs font-medium"
      onClick={() => setViewingOrderNumber(o.orderNumber)}
    >
      {o.orderNumber}
    </button>,
    <div key={`cust-${o.id}`}>
      <p className="text-sm font-medium text-gray-900">{o.user?.name ?? "—"}</p>
      <p className="text-xs text-gray-400">{o.user?.email ?? ""}</p>
    </div>,
    o.total !== undefined ? `₦${Number(o.total).toLocaleString()}` : "—",
    <span key={`pay-${o.id}`} className="capitalize text-sm">
      {o.paymentMethod ?? "—"}
    </span>,
    <Badge key={`status-${o.id}`} color={STATUS_COLOR[o.status] ?? "gray"}>
      {o.status}
    </Badge>,
    o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—",
    <div key={`actions-${o.id}`} className="flex space-x-2">
      <button
        className="p-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-50"
        onClick={() => setViewingOrderNumber(o.orderNumber)}
        title="View"
      >
        <Eye size={15} />
      </button>
      <button
        className="p-1 border border-red-100 rounded text-red-500 hover:bg-red-50 disabled:opacity-40"
        onClick={() => handleDelete(o.id, o.orderNumber)}
        disabled={deletingId === o.id}
        title="Delete"
      >
        <Trash2 size={15} />
      </button>
    </div>,
  ]);

  return (
    <>
      {viewingOrderNumber && (
        <OrderDetailModal
          orderNumber={viewingOrderNumber}
          onClose={() => setViewingOrderNumber(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      <Layout
        pageTitle="Orders"
        pageSubtitle={`Manage all customer orders.${pagination.total ? ` (${pagination.total} total)` : ""}`}
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
              placeholder="Search by order number or customer..."
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Skeleton */}
        {loading && (
          <Card>
            <Skeleton className="h-5 w-32 mb-6" />
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-4" />
                ))}
              </div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid grid-cols-7 gap-4">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <Skeleton key={j} className="h-8" />
                  ))}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
            <p className="text-gray-700 font-medium">Failed to load orders</p>
            <p className="text-sm text-gray-400 mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">All Orders</h3>
            {data.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No orders found.</p>
            ) : (
              <Table headers={headers} data={data} />
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() =>
                      setPagination((p) => ({ ...p, page: p.page - 1 }))
                    }
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() =>
                      setPagination((p) => ({ ...p, page: p.page + 1 }))
                    }
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}
      </Layout>
    </>
  );
};

export default OrderListPage;