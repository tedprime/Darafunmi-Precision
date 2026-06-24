import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/common/Badge";
import { confirmDialog } from "../../components/common/confirmDialog";
import { Search, TriangleAlert, Eye, Trash2, X, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import {
  getQuoteRequests,
  getQuoteRequest,
  updateQuoteRequestStatus,
  deleteQuoteRequest,
  declineQuoteRequest,
} from "../../../services/quoteRequests";

interface RequestItem {
  equipmentName: string;
  quantity?: number;
  note?: string;
}

interface QuoteRequest {
  id: number;
  quoteNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyName?: string;
  serviceType?: string;
  description?: string;
  adminNotes?: string;
  requestItems?: RequestItem[];
  status: "pending" | "reviewed" | "quoted" | "closed" | "declined" | string;
  createdAt?: string;
}

const STATUS_COLOR: Record<string, "yellow" | "blue" | "green" | "gray" | "red"> = {
  pending:  "yellow",
  reviewed: "blue",
  quoted:   "green",
  closed:   "gray",
  declined: "red",
};

const INLINE_STATUSES = ["pending", "reviewed", "quoted", "closed"];

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const QuoteRequestListPage: React.FC = () => {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [viewItem, setViewItem] = useState<QuoteRequest | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [declineTarget, setDeclineTarget] = useState<QuoteRequest | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getQuoteRequests({ page, status })
      .then((res: { data: QuoteRequest[]; hasMore?: boolean }) => {
        if (cancelled) return;
        setRequests(res.data ?? []);
        setHasMore(res.hasMore ?? false);
        setError(null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message ?? "Something went wrong.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, status, retryKey]);

  const handleView = async (id: number) => {
    setViewLoading(true);
    setViewItem(null);
    try {
      const res = await getQuoteRequest(id);
      setViewItem(res?.data ?? res);
    } catch {
      alert("Failed to load quote request.");
    } finally {
      setViewLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateQuoteRequestStatus(id, newStatus);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      if (viewItem?.id === id) setViewItem((v) => v ? { ...v, status: newStatus } : v);
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number, customerName: string) => {
    if (!(await confirmDialog({
      title: "Delete quote request?",
      description: `Delete quote request from "${customerName}"?`,
      confirmLabel: "Delete",
    }))) return;
    setDeletingId(id);
    try {
      await deleteQuoteRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Failed to delete quote request.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDecline = async () => {
    if (!declineTarget) return;
    setDeclining(true);
    try {
      await declineQuoteRequest(declineTarget.id, declineReason);
      setRequests((prev) =>
        prev.map((r) => (r.id === declineTarget.id ? { ...r, status: "declined" } : r))
      );
      if (viewItem?.id === declineTarget.id) setViewItem((v) => v ? { ...v, status: "declined" } : v);
      setDeclineTarget(null);
      setDeclineReason("");
    } catch {
      alert("Failed to decline quote request.");
    } finally {
      setDeclining(false);
    }
  };

  const filtered = requests.filter(
    (r) =>
      r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      r.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      r.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout pageTitle="Quote Requests" pageSubtitle="View and manage inbound quote requests from the site.">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
            placeholder="Search by name, email or company..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="quoted">Quoted</option>
          <option value="closed">Closed</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, j) => <Skeleton key={j} className="h-8" />)}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load quote requests</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button onClick={() => setRetryKey((k) => k + 1)} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Desktop Table */}
          <div className="max-md:hidden bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">All Quote Requests</h3>
            </div>
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No quote requests found.</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    {["Quote #", "Name", "Company", "Service Type", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-gray-600">{r.quoteNumber ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-gray-900 whitespace-normal wrap-break-word">{r.customerName}</p>
                        <p className="text-xs text-gray-400 whitespace-normal wrap-break-word">{r.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-normal wrap-break-word">{r.companyName ?? "—"}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-normal wrap-break-word">{r.serviceType ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        <Badge color={STATUS_COLOR[r.status] ?? "gray"}>{r.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {r.status !== "declined" && (
                            <select
                              value={r.status}
                              disabled={updatingId === r.id}
                              onChange={(e) => handleStatusChange(r.id, e.target.value)}
                              className="text-xs border border-gray-200 rounded-md px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-40"
                            >
                              {INLINE_STATUSES.map((s) => (
                                <option key={s} value={s} className="capitalize">{s}</option>
                              ))}
                            </select>
                          )}
                          <button
                            className="p-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 disabled:opacity-40 transition-colors"
                            onClick={() => handleView(r.id)}
                            disabled={deletingId === r.id}
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                          {r.status !== "declined" && (
                            <button
                              className="p-1.5 border border-orange-200 rounded-md text-orange-500 hover:bg-orange-50 disabled:opacity-40 transition-colors"
                              onClick={() => { setDeclineTarget(r); setDeclineReason(""); }}
                              disabled={deletingId === r.id || updatingId === r.id}
                              title="Decline request"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                          <button
                            className="p-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                            onClick={() => handleDelete(r.id, r.customerName)}
                            disabled={deletingId === r.id || updatingId === r.id}
                            title="Delete"
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
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-100">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading} className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <span className="text-sm text-gray-600">Page {page}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={!hasMore || loading} className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No quote requests found.</p>
            ) : filtered.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 wrap-break-word">{r.customerName}</p>
                    <p className="text-xs text-gray-500 wrap-break-word">{r.customerEmail}</p>
                    {r.companyName && <p className="text-xs text-gray-400 mt-0.5">{r.companyName}</p>}
                  </div>
                  <Badge color={STATUS_COLOR[r.status] ?? "gray"}>{r.status}</Badge>
                </div>
                {r.serviceType && (
                  <p className="text-xs text-gray-500 mb-3">Service: {r.serviceType}</p>
                )}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 text-xs"
                    onClick={() => handleView(r.id)}
                  >
                    <Eye size={12} /> View
                  </button>
                  {r.status !== "declined" && (
                    <button
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-orange-200 rounded-md text-orange-500 hover:bg-orange-50 text-xs"
                      onClick={() => { setDeclineTarget(r); setDeclineReason(""); }}
                    >
                      <XCircle size={12} /> Decline
                    </button>
                  )}
                  <button
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 text-xs disabled:opacity-40"
                    onClick={() => handleDelete(r.id, r.customerName)}
                    disabled={deletingId === r.id}
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
      {(viewItem || viewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Quote Request Details</h2>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6">
              {viewLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
                </div>
              )}
              {viewItem && (
                <>
                  <dl className="space-y-3 text-sm">
                    {([
                      ["Quote #",      viewItem.quoteNumber   ?? "—"],
                      ["Name",         viewItem.customerName],
                      ["Email",        viewItem.customerEmail],
                      ["Phone",        viewItem.customerPhone ?? "—"],
                      ["Company",      viewItem.companyName   ?? "—"],
                      ["Service Type", viewItem.serviceType   ?? "—"],
                    ] as [string, string][]).map(([label, value]) => (
                      <div key={label} className="flex gap-2">
                        <dt className="w-28 shrink-0 font-medium text-gray-500">{label}</dt>
                        <dd className="text-gray-800 wrap-break-word">{value}</dd>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <dt className="w-28 shrink-0 font-medium text-gray-500">Status</dt>
                      <dd><Badge color={STATUS_COLOR[viewItem.status] ?? "gray"}>{viewItem.status}</Badge></dd>
                    </div>
                    {viewItem.description && (
                      <div className="flex gap-2">
                        <dt className="w-28 shrink-0 font-medium text-gray-500">Description</dt>
                        <dd className="text-gray-800 whitespace-pre-wrap wrap-break-word">{viewItem.description}</dd>
                      </div>
                    )}
                  </dl>

                  {viewItem.requestItems && viewItem.requestItems.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Requested Equipment</p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Equipment</th>
                              <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600">Qty</th>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Note</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {viewItem.requestItems.map((item, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-medium text-gray-800 whitespace-normal wrap-break-word">{item.equipmentName}</td>
                                <td className="text-center px-3 py-2 text-gray-700">{item.quantity ?? "—"}</td>
                                <td className="px-3 py-2 text-gray-500 text-xs whitespace-normal wrap-break-word">{item.note ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {viewItem.status !== "declined" && (
                    <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
                      <label className="text-sm font-medium text-gray-600">Update Status:</label>
                      <select
                        value={viewItem.status}
                        disabled={updatingId === viewItem.id}
                        onChange={(e) => handleStatusChange(viewItem.id, e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-40"
                      >
                        {INLINE_STATUSES.map((s) => (
                          <option key={s} value={s} className="capitalize">{s}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => { setDeclineTarget(viewItem); setViewItem(null); setDeclineReason(""); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50"
                      >
                        <XCircle size={14} /> Decline
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DECLINE MODAL ───────────────────────────────────── */}
      {declineTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Decline Quote Request</h2>
              <button onClick={() => setDeclineTarget(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                Declining request from <span className="font-semibold">{declineTarget.customerName}</span>.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Reason <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Equipment not available, out of scope..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                />
              </div>
            </div>
            <div className="border-t border-gray-100 px-6 py-4 flex gap-3">
              <button
                onClick={handleDecline}
                disabled={declining}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {declining
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Declining...</>
                  : <><XCircle size={15} /> Decline Request</>
                }
              </button>
              <button onClick={() => setDeclineTarget(null)} disabled={declining} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default QuoteRequestListPage;
