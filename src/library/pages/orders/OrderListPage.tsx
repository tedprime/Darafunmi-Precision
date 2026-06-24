import Cookies from "js-cookie";
import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/common/Badge";
import { confirmDialog } from "../../components/common/confirmDialog";
import {
  Search, Trash2, TriangleAlert, Eye, FileText, X,
  ChevronLeft, ChevronRight, Send,
} from "lucide-react";
import {
  getOrders, deleteOrder, updateOrderStatus, getOrderById,
} from "../../../services/orders.jsx";
import { useToast } from "../../../services/useToast";

type OrderStatus =
  | "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  id: number;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  subtotal?: string | number;
  tax?: string | number;
  shipping?: string | number;
  total?: string | number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: { street?: string; city?: string; state?: string; country?: string };
  notes?: string;
  adminNotes?: string;
  createdAt?: string;
  items?: OrderItem[];
}

interface Pagination { page: number; total: number; totalPages: number; }

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const STATUS_COLOR: Record<string, "blue" | "gray" | "green" | "yellow" | "red"> = {
  pending:    "yellow",
  confirmed:  "blue",
  processing: "blue",
  shipped:    "blue",
  delivered:  "green",
  cancelled:  "red",
};

const ALL_STATUSES: OrderStatus[] = [
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled",
];

const fmtMoney = (v?: string | number) =>
  v !== undefined && v !== null
    ? `₦${Number(v).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
    : "—";

const OrderListPage: React.FC = () => {
  const { toast } = useToast() as any;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState<Pagination>({ page: 1, total: 0, totalPages: 1 });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const isFirstLoad = useRef(true);

  // View modal
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Status update modal
  const [updateTarget, setUpdateTarget] = useState<Order | null>(null);
  const [updateStatus, setUpdateStatus] = useState<OrderStatus>("pending");
  const [updateNotes, setUpdateNotes] = useState("");
  const [updateSubmitting, setUpdateSubmitting] = useState(false);

  // Invoice modal
  const [invoiceTarget, setInvoiceTarget] = useState<Order | null>(null);
  const [lpoNumber, setLpoNumber] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [sendToCustomer, setSendToCustomer] = useState(false);
  const [invoicing, setInvoicing] = useState(false);

  useEffect(() => {
    if (!isFirstLoad.current) setLoading(true);
    isFirstLoad.current = false;

    getOrders({ page: pagination.page, status })
      .then(({ data, pagination: pg }: any) => {
        setOrders(data);
        setPagination((prev) => ({ ...prev, ...pg }));
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status, pagination.page]);

  const openUpdateModal = (order: Order) => {
    setUpdateTarget(order);
    setUpdateStatus(order.status);
    setUpdateNotes(order.adminNotes ?? "");
  };

  const handleStatusUpdate = async () => {
    if (!updateTarget) return;
    setUpdateSubmitting(true);
    setUpdatingId(updateTarget.id);
    try {
      await updateOrderStatus(updateTarget.id, updateStatus, updateNotes);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === updateTarget.id
            ? { ...o, status: updateStatus, adminNotes: updateNotes }
            : o
        )
      );
      toast?.success?.("Order status updated.");
      setUpdateTarget(null);
    } catch {
      toast?.error?.("Failed to update order status.");
    } finally {
      setUpdateSubmitting(false);
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number, orderNumber: string) => {
    if (!(await confirmDialog({
      title: "Delete order?",
      description: `Delete order ${orderNumber}? Product stock will be restored.`,
      confirmLabel: "Delete",
    }))) return;
    setDeletingId(id);
    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch {
      toast?.error?.("Failed to delete order.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = async (id: number) => {
    setViewLoading(true);
    setViewOrder(null);
    try {
      const data = await getOrderById(id);
      setViewOrder(data);
    } catch {
      toast?.error?.("Failed to load order details.");
    } finally {
      setViewLoading(false);
    }
  };

  const openInvoiceModal = (order: Order) => {
    setInvoiceTarget(order);
    setLpoNumber("");
    setTinNumber("");
    setSendToCustomer(false);
  };

  const handleInvoiceGenerate = async () => {
    if (!invoiceTarget) return;
    setInvoicing(true);
    try {
      const apiBase = (import.meta as any).env?.VITE_API_URL ?? "";
      const token = Cookies.get("token") ?? "";
      const res = await fetch(`${apiBase}/api/orders/${invoiceTarget.id}/invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ lpoNumber, tinNumber, send: sendToCustomer }),
      });
      if (!res.ok) throw new Error("Invoice generation failed.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      if (sendToCustomer && invoiceTarget.status === "pending") {
        setOrders((prev) =>
          prev.map((o) => (o.id === invoiceTarget.id ? { ...o, status: "confirmed" as OrderStatus } : o))
        );
      }
      setInvoiceTarget(null);
      toast?.success?.("Invoice generated" + (sendToCustomer ? " and sent to customer." : "."));
    } catch {
      toast?.error?.("Failed to generate invoice.");
    } finally {
      setInvoicing(false);
    }
  };

  const filtered = orders.filter(
    (o) =>
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout
      pageTitle="Orders"
      pageSubtitle={`Manage all orders.${pagination.total ? ` (${pagination.total} total)` : ""}`}
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
            placeholder="Search by order number, name or email..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, j) => <Skeleton key={j} className="h-8" />)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load orders</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Desktop Table */}
      {!loading && !error && (
        <>
          <div className="max-md:hidden bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No orders found.</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    {["Order #", "Customer", "Total", "Status", "Date", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-medium text-gray-800">{o.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-gray-900 whitespace-normal break-words">{o.customerName ?? "—"}</p>
                        <p className="text-xs text-gray-400 whitespace-normal break-words">{o.customerEmail ?? ""}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">{fmtMoney(o.total)}</td>
                      <td className="px-4 py-3.5">
                        <Badge color={STATUS_COLOR[o.status] ?? "gray"}>{o.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            className="p-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 disabled:opacity-40 transition-colors"
                            onClick={() => handleView(o.id)}
                            disabled={deletingId === o.id}
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="p-1.5 border border-green-200 rounded-md text-green-600 hover:bg-green-50 disabled:opacity-40 transition-colors"
                            onClick={() => openInvoiceModal(o)}
                            disabled={deletingId === o.id}
                            title="Generate invoice"
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            className="p-1.5 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            onClick={() => openUpdateModal(o)}
                            disabled={deletingId === o.id || updatingId === o.id}
                            title="Update status"
                          >
                            <Send size={14} />
                          </button>
                          <button
                            className="p-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                            onClick={() => handleDelete(o.id, o.orderNumber)}
                            disabled={deletingId === o.id}
                            title="Delete order"
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page <= 1 || loading}
                    className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages || loading}
                    className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No orders found.</p>
            ) : filtered.map((o) => (
              <div key={o.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-semibold text-gray-700">{o.orderNumber}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5 break-words">{o.customerName ?? "—"}</p>
                    <p className="text-xs text-gray-500 break-words">{o.customerEmail ?? ""}</p>
                  </div>
                  <Badge color={STATUS_COLOR[o.status] ?? "gray"}>{o.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="font-medium text-gray-800">{fmtMoney(o.total)}</span>
                  <span>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</span>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 text-xs"
                    onClick={() => handleView(o.id)}
                  >
                    <Eye size={12} /> View
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-green-200 rounded-md text-green-600 hover:bg-green-50 text-xs"
                    onClick={() => openInvoiceModal(o)}
                  >
                    <FileText size={12} /> Invoice
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 text-xs"
                    onClick={() => openUpdateModal(o)}
                  >
                    <Send size={12} /> Status
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 text-xs disabled:opacity-40"
                    onClick={() => handleDelete(o.id, o.orderNumber)}
                    disabled={deletingId === o.id}
                  >
                    <Trash2 size={12} /> Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── VIEW MODAL ──────────────────────────────────────── */}
      {(viewOrder || viewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Order Details</h2>
              <button onClick={() => setViewOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {viewLoading && (
                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</div>
              )}
              {viewOrder && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {([
                      ["Order #",   viewOrder.orderNumber],
                      ["Status",    viewOrder.status],
                      ["Customer",  viewOrder.customerName ?? "—"],
                      ["Email",     viewOrder.customerEmail ?? "—"],
                      ["Phone",     viewOrder.customerPhone ?? "—"],
                      ["Date",      viewOrder.createdAt ? new Date(viewOrder.createdAt).toLocaleDateString() : "—"],
                    ] as [string, string][]).map(([label, value]) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                        <p className="text-sm text-gray-800 font-medium mt-0.5 break-words">{value}</p>
                      </div>
                    ))}
                  </div>

                  {viewOrder.items && viewOrder.items.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Line Items</p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Product</th>
                              <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600">Qty</th>
                              <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600">Unit</th>
                              <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {viewOrder.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-800 whitespace-normal break-words">{item.productName}</td>
                                <td className="text-center px-3 py-2 text-gray-700">{item.quantity}</td>
                                <td className="text-right px-3 py-2 text-gray-700">{fmtMoney(item.unitPrice)}</td>
                                <td className="text-right px-3 py-2 font-medium text-gray-800">{fmtMoney(item.totalPrice)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-6">
                    {viewOrder.subtotal !== undefined && (
                      <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{fmtMoney(viewOrder.subtotal)}</span></div>
                    )}
                    {viewOrder.tax !== undefined && (
                      <div className="flex justify-between text-sm text-gray-600"><span>Tax</span><span>{fmtMoney(viewOrder.tax)}</span></div>
                    )}
                    {viewOrder.shipping !== undefined && (
                      <div className="flex justify-between text-sm text-gray-600"><span>Shipping</span><span>{fmtMoney(viewOrder.shipping)}</span></div>
                    )}
                    <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-blue-700">{fmtMoney(viewOrder.total)}</span>
                    </div>
                  </div>

                  {viewOrder.adminNotes && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Admin Notes</p>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{viewOrder.adminNotes}</p>
                    </div>
                  )}

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => { setViewOrder(null); openUpdateModal(viewOrder); }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                      <Send size={14} /> Update Status
                    </button>
                    <button
                      onClick={() => { setViewOrder(null); openInvoiceModal(viewOrder); }}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                    >
                      <FileText size={14} /> Invoice
                    </button>
                    <button onClick={() => setViewOrder(null)} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── STATUS UPDATE MODAL ─────────────────────────────── */}
      {updateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Update Order Status</h2>
              <button onClick={() => setUpdateTarget(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Order <span className="font-semibold font-mono">{updateTarget.orderNumber}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes for this status update..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={handleStatusUpdate}
                disabled={updateSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updateSubmitting
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
                  : "Save Status"
                }
              </button>
              <button
                onClick={() => setUpdateTarget(null)}
                disabled={updateSubmitting}
                className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INVOICE MODAL ───────────────────────────────────── */}
      {invoiceTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Generate Invoice</h2>
              <button onClick={() => setInvoiceTarget(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Order <span className="font-semibold font-mono">{invoiceTarget.orderNumber}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">LPO Number <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={lpoNumber}
                  onChange={(e) => setLpoNumber(e.target.value)}
                  placeholder="e.g. LPO-2024-001"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">TIN Number <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                  placeholder="Tax Identification Number"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendToCustomer}
                  onChange={(e) => setSendToCustomer(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700">Send invoice to customer via email</span>
              </label>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={handleInvoiceGenerate}
                disabled={invoicing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {invoicing
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating...</>
                  : <><FileText size={14} /> Generate Invoice</>
                }
              </button>
              <button
                onClick={() => setInvoiceTarget(null)}
                disabled={invoicing}
                className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default OrderListPage;
