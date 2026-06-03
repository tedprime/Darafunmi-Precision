import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import { Search, TriangleAlert, Eye, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getQuoteRequests,
  getQuoteRequest,
  updateQuoteRequestStatus,
  deleteQuoteRequest,
} from "../../../services/quoteRequests";

interface QuoteRequest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  serviceType?: string;
  description?: string;
  urgency?: string;
  status: "pending" | "reviewed" | "quoted" | "closed" | string;
  createdAt?: string;
}

const STATUS_COLOR: Record<string, "yellow" | "blue" | "green" | "gray"> = {
  pending: "yellow",
  reviewed: "blue",
  quoted: "green",
  closed: "gray",
};

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

  // View modal
  const [viewItem, setViewItem] = useState<QuoteRequest | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const res: { data: QuoteRequest[]; hasMore?: boolean } = await getQuoteRequests({ page, status });
        if (cancelled) return;
        setRequests(res.data ?? []);
        setHasMore(res.hasMore ?? false);
        setError(null);
      } catch (err: unknown) {
        if (!cancelled) setError((err as Error).message ?? "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [page, status, retryKey]);

  const handleView = async (id: number) => {
    setViewLoading(true);
    setViewItem(null);
    try {
      const res = await getQuoteRequest(id);
      setViewItem(res.data);
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
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      if (viewItem?.id === id) setViewItem((v) => v ? { ...v, status: newStatus } : v);
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete quote request from "${name}"?`)) return;
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

  // Client-side search filter
  const filtered = requests.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.company?.toLowerCase().includes(search.toLowerCase())
  );

  const headers = ["Name", "Email", "Company", "Service Type", "Urgency", "Status", "Actions"];

  const data = filtered.map((r) => [
    r.name,
    r.email,
    r.company ?? "—",
    r.serviceType ?? "—",
    r.urgency ?? "—",
    <Badge key={`status-${r.id}`} color={STATUS_COLOR[r.status] ?? "gray"}>
      {r.status}
    </Badge>,
    <div key={`actions-${r.id}`} className="flex items-center space-x-2">
      <select
        value={r.status}
        disabled={updatingId === r.id}
        onChange={(e) => handleStatusChange(r.id, e.target.value)}
        className="text-xs border border-gray-300 rounded px-1 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-40"
      >
        <option value="pending">Pending</option>
        <option value="reviewed">Reviewed</option>
        <option value="quoted">Quoted</option>
        <option value="closed">Closed</option>
      </select>
      <button
        className="p-1 border border-blue-200 rounded text-blue-500 hover:bg-blue-50 disabled:opacity-40"
        onClick={() => handleView(r.id)}
        disabled={deletingId === r.id}
      >
        <Eye size={15} />
      </button>
      <button
        className="p-1 border border-red-100 rounded text-red-500 hover:bg-red-50 disabled:opacity-40"
        onClick={() => handleDelete(r.id, r.name)}
        disabled={deletingId === r.id || updatingId === r.id}
      >
        <Trash2 size={15} />
      </button>
    </div>,
  ]);

  return (
    <Layout
      pageTitle="Quote Requests"
      pageSubtitle="View and manage inbound quote requests from the site."
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
            placeholder="Search by name, email or company..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="quoted">Quoted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <Card>
          <Skeleton className="h-5 w-40 mb-6" />
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

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load quote requests</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">All Quote Requests</h3>
          {data.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No quote requests found.</p>
          ) : (
            <Table headers={headers} data={data} />
          )}

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-1.5 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore || loading}
              className="p-1.5 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </Card>
      )}

      {/* View Modal */}
      {(viewItem || viewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 relative">
            <button
              onClick={() => setViewItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            {viewLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-48 mb-4" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : viewItem ? (
              <>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quote Request Details</h2>
                <dl className="space-y-3 text-sm">
                  {[
                    ["Name", viewItem.name],
                    ["Email", viewItem.email],
                    ["Phone", viewItem.phone ?? "—"],
                    ["Company", viewItem.company ?? "—"],
                    ["Service Type", viewItem.serviceType ?? "—"],
                    ["Urgency", viewItem.urgency ?? "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-2">
                      <dt className="w-28 shrink-0 font-medium text-gray-500">{label}</dt>
                      <dd className="text-gray-800">{value}</dd>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 font-medium text-gray-500">Status</dt>
                    <dd>
                      <Badge color={STATUS_COLOR[viewItem.status] ?? "gray"}>
                        {viewItem.status}
                      </Badge>
                    </dd>
                  </div>
                  {viewItem.description && (
                    <div className="flex gap-2">
                      <dt className="w-28 shrink-0 font-medium text-gray-500">Description</dt>
                      <dd className="text-gray-800 whitespace-pre-wrap">{viewItem.description}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-600">Update Status:</label>
                  <select
                    value={viewItem.status}
                    disabled={updatingId === viewItem.id}
                    onChange={(e) => handleStatusChange(viewItem.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-40"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="quoted">Quoted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default QuoteRequestListPage;