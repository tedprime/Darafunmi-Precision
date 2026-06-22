import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import {
  Search, Trash2, TriangleAlert, Eye, FileText, X,
  ChevronLeft, ChevronRight, Send,
} from "lucide-react";
import {
  getOrders, deleteOrder, updateOrderStatus, getOrderById, generateInvoice,
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
    if (!confirm(`Delete order ${orderNumber}? Product stock will be restored.`)) return;
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
      const token = localStorage.getItem("token") ?? "";
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
      // Reflect auto-confirm on the list
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

  const headers = ["Order #", "Customer", "Total", "Status", "Date", "Actions"];

  const data = filtered.map((o) => [
    <span key={`num-${o.id}`} className="font-mono text-xs font-medium text-gray-800">
      {o.orderNumber}
    </span>,
    <div key={`cust-${o.id}`}>
      <p className="text-sm font-medium text-gray-900">{o.customerName ?? "—"}</p>
      <p className="text-xs text-gray-400">{o.customerEmail ?? ""}</p>
    </div>,
    fmtMoney(o.total),
    <Badge key={`badge-${o.id}`} color={STATUS_COLOR[o.status] ?? "gray"}>
      {o.status}
    </Badge>,
    o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—",
    <div key={`actions-${o.id}`} className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={() => openUpdateModal(o)}
        disabled={updatingId === o.id || deletingId === o.id}
        className="disabled:opacity-40"
        title="Update status"
      >
        <Badge color={STATUS_COLOR[o.status] ?? "gray"}>{o.status}</Badge>
      </button>
      <button
        className="p-1 border border-blue-200 rounded text-blue-500 hover:bg-blue-50 disabled:opacity-40"
        onClick={() => handleView(o.id)}
        disabled={deletingId === o.id}
        title="View details"
      >
        <Eye size={14} />
      </button>
      <button
        className="p-1 border border-green-200 rounded text-green-600 hover:bg-green-50 disabled:opacity-40"
        onClick={() => openInvoiceModal(o)}
        disabled={deletingId === o.id}
        title="Generate invoice"
      >
        <FileText size={14} />
      </button>
      <button
        className="p-1 border border-red-100 rounded text-red-500 hover:bg-red-50 disabled:opacity-40"
        onClick={() => handleDelete(o.id, o.orderNumber)}
        disabled={deletingId === o.id || updatingId === o.id}
        title="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>,
  ]);

  return (
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
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search by order number or customer..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {/* Skeleton */}
      {loading && (
        <Card>
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, j) => <Skeleton key={j} className="h-8" />)}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load orders</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
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
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))} disabled={pagination.page <= 1 || loading} className="p-1.5 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
                <button onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))} disabled={pagination.page >= pagination.totalPages || loading} className="p-1.5 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── VIEW DETAILS MODAL ─────────────────────────────────── */}
      {(viewOrder || viewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Order Details</h2>
              <button onClick={() => setViewOrder(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6">
              {viewLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
                </div>
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
                        <p className="text-sm text-gray-800 font-medium mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>

                  {viewOrder.shippingAddress && (
                    <div className="mb-6">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Shipping Address</p>
                      <p className="text-sm text-gray-800">
                        {[viewOrder.shippingAddress.street, viewOrder.shippingAddress.city,
                          viewOrder.shippingAddress.state, viewOrder.shippingAddress.country]
                          .filter(Boolean).join(", ")}
                      </p>
                    </div>
                  )}

                  {viewOrder.items && viewOrder.items.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Items</p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Product</th>
                              <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600">Qty</th>
                              <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600">Unit Price</th>
                              <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {viewOrder.items.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2">
                                  <p className="font-medium text-gray-800">{item.productName}</p>
                                  {item.productSku && <p className="text-xs text-gray-400">{item.productSku}</p>}
                                </td>
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
                    <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{fmtMoney(viewOrder.subtotal)}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>VAT (7.5%)</span><span>{fmtMoney(viewOrder.tax)}</span></div>
                    {Number(viewOrder.shipping ?? 0) > 0 && (
                      <div className="flex justify-between text-sm text-gray-600"><span>Shipping</span><span>{fmtMoney(viewOrder.shipping)}</span></div>
                    )}
                    <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-blue-700">{fmtMoney(viewOrder.total)}</span>
                    </div>
                  </div>

                  {viewOrder.notes && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Customer Notes</p>
                      <p className="text-sm text-gray-700">{viewOrder.notes}</p>
                    </div>
                  )}

                  {viewOrder.adminNotes && (
                    <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-1">Admin Notes</p>
                      <p className="text-sm text-yellow-900">{viewOrder.adminNotes}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setViewOrder(null); openUpdateModal(viewOrder); }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => { setViewOrder(null); openInvoiceModal(viewOrder); }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                    >
                      <FileText size={15} /> Generate Invoice
                    </button>
                    <button onClick={() => setViewOrder(null)} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── STATUS UPDATE MODAL ───────────────────────────────── */}
      {updateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Update Order Status</h2>
                <p className="text-xs text-gray-400 mt-0.5">{updateTarget.orderNumber} · {updateTarget.customerName}</p>
              </div>
              <button onClick={() => setUpdateTarget(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white capitalize"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes <span className="text-gray-400 font-normal">(internal only)</span>
                </label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any internal notes about this order or status change..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="border-t border-gray-100 px-6 py-4 flex gap-3">
              <button
                onClick={handleStatusUpdate}
                disabled={updateSubmitting}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {updateSubmitting ? "Saving..." : "Update Status"}
              </button>
              <button onClick={() => setUpdateTarget(null)} disabled={updateSubmitting} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INVOICE MODAL ──────────────────────────────────────── */}
      {invoiceTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Generate Invoice</h2>
              <button onClick={() => setInvoiceTarget(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-800">
                <span className="font-semibold">{invoiceTarget.orderNumber}</span>
                {" · "}{invoiceTarget.customerName}
                {" · "}{fmtMoney(invoiceTarget.total)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LPO / PO Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={lpoNumber}
                  onChange={(e) => setLpoNumber(e.target.value)}
                  placeholder="e.g. LPO/2024/00379"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer TIN <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                  placeholder="e.g. 0124185-3001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendToCustomer}
                  onChange={(e) => setSendToCustomer(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">Send invoice to customer</span>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    Emails the PDF to {invoiceTarget.customerEmail ?? "the customer"}.
                    {invoiceTarget.status === "pending" && " Order will auto-confirm."}
                  </span>
                </span>
              </label>
            </div>

            <div className="border-t border-gray-100 px-6 py-4 flex gap-3">
              <button
                onClick={handleInvoiceGenerate}
                disabled={invoicing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {invoicing
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating...</>
                  : <>{sendToCustomer ? <Send size={15} /> : <FileText size={15} />} {sendToCustomer ? "Generate & Send" : "Download PDF"}</>
                }
              </button>
              <button onClick={() => setInvoiceTarget(null)} disabled={invoicing} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">
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
