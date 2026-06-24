import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/common/Badge";
import { confirmDialog } from "../../components/common/confirmDialog";
import { TriangleAlert, Trash2 } from "lucide-react";
import {
  getNewsletterSubscribers,
  unsubscribeNewsletter,
} from "../../../services/newsletter.jsx";
import { toastSuccess, toastError } from "../../../services/useToast";

interface Subscriber {
  id: number;
  email: string;
  name?: string | null;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt?: string | null;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const NewsletterListPage: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  useEffect(() => {
    getNewsletterSubscribers()
      .then((res) => {
        const all: Subscriber[] = res.data ?? res;
        setSubscribers(all.filter((s) => s.isActive));
        setError(null);
      })
      .catch((err) => setError(err.message ?? "Failed to load subscribers"))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsubscribe = async (subscriber: Subscriber) => {
    if (!(await confirmDialog({
      title: "Remove subscriber?",
      description: `Remove "${subscriber.email}" from the newsletter list?`,
      confirmLabel: "Remove",
    }))) return;

    setRemovingEmail(subscriber.email);
    try {
      await unsubscribeNewsletter(subscriber.email);
      setSubscribers((prev) =>
        prev.filter((s) => s.email !== subscriber.email)
      );
      toastSuccess(`${subscriber.email} has been unsubscribed.`);
    } catch {
      toastError("Failed to unsubscribe. Please try again.");
    } finally {
      setRemovingEmail(null);
    }
  };

  return (
    <Layout
      pageTitle="Newsletter"
      pageSubtitle="Manage newsletter subscribers."
    >
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-8" />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load subscribers</p>
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
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-700">All Subscribers</h3>
              <span className="text-xs text-gray-400 font-normal">({subscribers.length})</span>
            </div>
            {subscribers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No subscribers yet.</p>
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
                    <tr key={sub.email} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-normal break-words">{sub.name ?? "—"}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-normal break-words">{sub.email}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {sub.subscribedAt
                          ? new Date(sub.subscribedAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleUnsubscribe(sub)}
                          disabled={removingEmail === sub.email}
                          title="Unsubscribe"
                          className="p-1.5 border border-red-100 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={14} />
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
              <p className="text-sm text-gray-500 text-center py-12">No subscribers yet.</p>
            ) : subscribers.map((sub) => (
              <div key={sub.email} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{sub.name ?? "—"}</p>
                    <p className="text-xs text-gray-500 break-words mt-0.5">{sub.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {sub.subscribedAt
                        ? new Date(sub.subscribedAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                  <Badge color="green">Active</Badge>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleUnsubscribe(sub)}
                    disabled={removingEmail === sub.email}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
                  >
                    <Trash2 size={13} /> Unsubscribe
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

export default NewsletterListPage;
