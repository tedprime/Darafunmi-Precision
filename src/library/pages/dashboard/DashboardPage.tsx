import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Table from "../../components/ui/Table";
import { getDashboardSummary } from "../../../services/dashboard";

interface DashboardSummary {
  clients: { total: number };
  certificates: { total: number; expiringSoon: number; expired: number };
  calibrations: { total: number; overdue: number };
  quotes: { total: number };
  products: { total: number };
  recentActivity: {
    event: string;
    category: string;
    status: string;
    user: string;
    createdAt: string;
  }[];
}

interface ApiError {
  status?: number;
  message: string;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const DashboardPage = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const result = await getDashboardSummary();
        if (isMounted) {
          setSummary(result);
          setError(null); // Clear errors safely asynchronously
        }
      } catch (err) {
        if (isMounted) {
          // Fixed the explicit 'any' error by typing/checking the caught unknown error safely
          const errorObject = err as ApiError;
          setError({
            status: errorObject.status,
            message: errorObject.message || "An unexpected error occurred.",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false); // Clean asynchronous update
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [retryTrigger]); // Triggers cleanly when retryTrigger changes

  if (loading)
    return (
      <Layout
        pageTitle="Dashboard"
        pageSubtitle="Welcome back. Here's your business overview."
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-5"
            >
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        <div>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-56 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );

  if (error)
    return (
      <Layout
        pageTitle="Dashboard"
        pageSubtitle="Welcome back. Here's your business overview."
      >
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto transition-all duration-300 ease-out">
          {/* Soft Crimson Icon Ring Container */}
          <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4 shadow-sm ring-1 ring-red-100/50">
            <svg
              className="w-8 h-8 animate-bounce [animation-iteration-count:2]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          {/* Clean Typography Stack */}
          <h3 className="text-gray-800 font-semibold text-lg tracking-tight">
            Failed to load dashboard
          </h3>

          <p className="text-sm text-gray-600 mt-2 px-6 leading-relaxed">
            {error.message}
          </p>

          {/* Error Badging */}
          {error.status && (
            <span className="mt-3 text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded-md border border-gray-200/60 shadow-xs">
              Status: {error.status}
            </span>
          )}

          {/* Action Button */}
          <button
            onClick={() => {
              setLoading(true);
              setRetryTrigger((prev) => prev + 1);
            }}
            className="mt-6 px-5 py-2.5 text-sm bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 active:scale-98 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  const tableHeaders = ["Event", "Category", "Status", "User", "Date"];

  const tableData = summary?.recentActivity
    ? summary.recentActivity.map((entry) => [
        entry.event,
        entry.category,
        entry.status,
        entry.user,
        new Date(entry.createdAt).toLocaleDateString(),
      ])
    : [];

  return (
    <Layout
      pageTitle="Dashboard"
      pageSubtitle="Welcome back. Here's your business overview."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Clients" value={summary?.clients.total} />
        <StatCard
          label="Total Certificates"
          value={summary?.certificates.total}
        />
        <StatCard
          label="Expiring Soon"
          value={summary?.certificates.expiringSoon}
        />
        <StatCard label="Expired" value={summary?.certificates.expired} />
        <StatCard
          label="Total Calibrations"
          value={summary?.calibrations.total}
        />
        <StatCard
          label="Overdue Calibrations"
          value={summary?.calibrations.overdue}
        />
        <StatCard label="Quotes" value={summary?.quotes.total} />
        <StatCard label="Products" value={summary?.products.total} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-1">Activity Log</h3>
        <p className="text-sm text-gray-500 mb-4">
          Recent system activities and events
        </p>

        {tableData.length > 0 ? (
          <Table headers={tableHeaders} data={tableData} className="w-full" />
        ) : (
          <p className="text-sm text-gray-400 py-4 italic">
            No recent activity found.
          </p>
        )}
      </div>
    </Layout>
  );
};

const StatCard = ({ label, value }: { label: string; value?: number }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-3xl font-bold mt-1">{value ?? "—"}</p>
  </div>
);

export default DashboardPage;
