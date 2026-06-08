import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { TriangleAlert, ArrowLeft, RefreshCw } from "lucide-react";
import { getOrder, updateOrderStatus } from "../../../services/orders.jsx";

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

const OrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getOrder(id)
      .then(setOrder)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Layout
      pageTitle="Order Details"
      pageSubtitle="View order information and manage status."
      action={
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <ArrowLeft size={14} /> Back to Orders
        </button>
      }
    >
      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          <Card>
            <Skeleton className="h-5 w-40 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load order</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={fetchOrder}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Detail View */}
      {!loading && !error && order && (
        <div className="space-y-4">
          {/* Order Meta */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-800">
                Order{" "}
                <span className="font-mono text-blue-600">{order.orderNumber}</span>
              </h3>
              <Badge color={STATUS_COLOR[order.status] ?? "gray"}>
                {order.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <p className="text-xs uppercase font-medium text-gray-400 mb-1">Customer</p>
                <p className="text-sm font-medium text-gray-900">{order.user?.name ?? "—"}</p>
                {order.user?.email && (
                  <p className="text-xs text-gray-500 mt-0.5">{order.user.email}</p>
                )}
              </div>

              <div>
                <p className="text-xs uppercase font-medium text-gray-400 mb-1">Payment Method</p>
                <p className="text-sm text-gray-900 capitalize">{order.paymentMethod ?? "—"}</p>
              </div>

              {order.createdAt && (
                <div>
                  <p className="text-xs uppercase font-medium text-gray-400 mb-1">Date Placed</p>
                  <p className="text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              )}

              {order.total !== undefined && (
                <div>
                  <p className="text-xs uppercase font-medium text-gray-400 mb-1">Order Total</p>
                  <p className="text-sm font-semibold text-gray-900">
                    ₦{Number(order.total).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && Object.keys(order.shippingAddress).length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Shipping Address
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">
                {Object.entries(order.shippingAddress).map(([k, v]) =>
                  v ? (
                    <p key={k}>
                      <span className="capitalize text-gray-400 mr-1">{k}:</span>
                      {v}
                    </p>
                  ) : null
                )}
              </div>
            </Card>
          )}

          {/* Items */}
          {order.items && order.items.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Items ({order.items.length})
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <span className="text-gray-800 font-medium">
                      {item.name ?? `Product #${item.productId}`}
                    </span>
                    <div className="flex gap-5 text-gray-500">
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

              {order.total !== undefined && (
                <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    Total: ₦{Number(order.total).toLocaleString()}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Notes */}
          {order.notes && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Notes
              </h3>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{order.notes}</p>
            </Card>
          )}

          {/* Update Status */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Update Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updating || order.status === s}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors disabled:opacity-50
                    ${
                      order.status === s
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default OrderDetailPage;