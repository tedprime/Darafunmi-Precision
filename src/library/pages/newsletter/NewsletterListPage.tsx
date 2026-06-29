import React, { useState, useEffect, useCallback } from "react";
import Layout from "../../components/layout/Layout";
import { confirmDialog } from "../../components/common/confirmDialog";
import { TriangleAlert, Trash2, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getNewsletterSubscribers, unsubscribeNewsletter } from "../../../services/newsletter.jsx";
import { toastSuccess, toastError } from "../../../services/useToast";

interface Subscriber {
  id: number;
  email: string;
  name?: string | null;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt?: string | null;
}

const LIMIT = 20;

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const NewsletterListPage: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [removingId, setRemovingId]   = useState<number | null>(null);

  const totalPages = Math.ceil(total / LIMIT);

  const load = useCallback(() => {
    setLoading(true);
    getNewsletterSubscribers({ page, limit: LIMIT, search, isActive: true })
      .then((res) => {
        setSubscribers(res.data ?? []);
        setTotal(res.count ?? 0);
        setError(null);
      })
      .catch((err: any) => setError(err?.message ?? "Failed to load subscribers."))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1); }, [search]);

  const handleUnsubscribe = async (subscriber: Subscriber) => {
    if (!(await confirmDialog({
      title: "Remove subscriber?",
      description: `"${subscriber.email}" will be unsubscribed from the newsletter.`,
      confirmLabel: "Remove",
      variant: "danger",
    }))) return;

    setRemovingId(subscriber.id);
    try {
      await unsubscribeNewsletter(subscriber.email);
      toastSuccess(`${subscriber.email} has been unsubscribed.`);
      // If this was the last item on the page, go back one
      if (subscribers.length === 1 && page > 1) setPage((p) => p - 1);
      else load();
    } catch {
      toastError("Failed to unsubscribe. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const fmt = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <Layout
      pageTitle="Newsletter"
      pageSubtitle={`${total} active subscriber${total !== 1 ? "s" : ""}`}
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => <Skeleton key={j} className="h-8" />)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load subscribers</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={load}
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
            {subscribers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">
                {search ? "No subscribers match your search." : "No subscribers yet."}
              </p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    {["Name", "Email", "Subscribed On", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-normal break-words">{sub.name ?? "—"}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-normal break-words">{sub.email}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                        {sub.subscribedAt ? fmt(sub.subscribedAt) : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleUnsubscribe(sub)}
                          disabled={removingId === sub.id}
                          title="Unsubscribe"
                          className="p-1.5 border border-red-100 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40"
                        >
                          {removingId === sub.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {subscribers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">
                {search ? "No subscribers match your search." : "No subscribers yet."}
              </p>
            ) : subscribers.map((sub) => (
              <div key={sub.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{sub.name ?? "—"}</p>
                    <p className="text-xs text-gray-500 break-words mt-0.5">{sub.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {sub.subscribedAt ? fmt(sub.subscribedAt) : "—"}
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleUnsubscribe(sub)}
                    disabled={removingId === sub.id}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
                  >
                    {removingId === sub.id
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Trash2 size={13} />
                    }
                    Unsubscribe
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages} · {total} subscribers
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default NewsletterListPage;
