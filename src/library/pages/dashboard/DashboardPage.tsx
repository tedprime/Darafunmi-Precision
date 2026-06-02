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

// Skeleton pulse placeholder
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const DashboardPage = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Layout pageTitle="Dashboard" pageSubtitle="Welcome back. Here's your business overview.">
        {/* KPI Skeleton Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Activity Log Skeleton */}
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
      <Layout pageTitle="Dashboard" pageSubtitle="Welcome back. Here's your business overview.">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-gray-700 font-medium">Failed to load dashboard</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
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
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Clients" value={summary?.clients.total} />
        <StatCard label="Total Certificates" value={summary?.certificates.total} />
        <StatCard label="Expiring Soon" value={summary?.certificates.expiringSoon} />
        <StatCard label="Expired" value={summary?.certificates.expired} />
        <StatCard label="Total Calibrations" value={summary?.calibrations.total} />
        <StatCard label="Overdue Calibrations" value={summary?.calibrations.overdue} />
        <StatCard label="Quotes" value={summary?.quotes.total} />
        <StatCard label="Products" value={summary?.products.total} />
      </div>

      {/* Recent Activity */}
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