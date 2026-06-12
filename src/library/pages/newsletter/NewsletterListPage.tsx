import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
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
    if (!confirm(`Remove "${subscriber.email}" from the newsletter list?`)) return;

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

  const headers = ["Name", "Email", "Subscribed On", "Actions"];

  const data = subscribers.map((sub) => [
    sub.name ?? "—",
    sub.email,
    sub.subscribedAt
      ? new Date(sub.subscribedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—",
    <button
      key={`remove-${sub.email}`}
      onClick={() => handleUnsubscribe(sub)}
      disabled={removingEmail === sub.email}
      title="Unsubscribe"
      className="p-1 border border-red-100 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
    >
      <Trash2 size={16} />
    </button>,
  ]);

  return (
    <Layout
      pageTitle="Newsletter"
      pageSubtitle="Manage newsletter subscribers."
    >
      {loading && (
        <Card>
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-8" />
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load subscribers</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            All Subscribers{" "}
            <span className="text-sm font-normal text-gray-400">
              ({subscribers.length})
            </span>
          </h3>
          {data.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No subscribers yet.
            </p>
          ) : (
            <Table headers={headers} data={data} />
          )}
        </Card>
      )}
    </Layout>
  );
};

export default NewsletterListPage;