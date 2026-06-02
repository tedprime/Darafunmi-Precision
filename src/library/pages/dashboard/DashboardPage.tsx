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
    return <p className="text-sm text-gray-500">Loading dashboard...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  // 1. Define table headers
  const tableHeaders = ["Event", "Category", "Status", "User", "Date"];

  // 2. Map data into the 2D array matrix required by the Table component
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

// Reusable stat card component
const StatCard = ({ label, value }: { label: string; value?: number }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-3xl font-bold mt-1">{value ?? "—"}</p>
  </div>
);

export default DashboardPage;
