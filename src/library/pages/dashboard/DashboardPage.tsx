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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-sm text-gray-500 animate-pulse">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mx-4 my-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600 font-medium">{error}</p>
      </div>
    );
  }

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
      <div className="px-2 sm:px-4 py-4 max-w-7xl mx-auto">
        {/* KPI Cards: Dynamic column sizing for xs, sm, md, and lg viewpoints */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Clients" value={summary?.clients.total} />
          <StatCard
            label="Total Certificates"
            value={summary?.certificates.total}
          />
          <StatCard
            label="Expiring Soon"
            value={summary?.certificates.expiringSoon}
            highlight={Boolean(summary?.certificates.expiringSoon)}
          />
          <StatCard
            label="Expired"
            value={summary?.certificates.expired}
            alert={Boolean(summary?.certificates.expired)}
          />
          <StatCard
            label="Total Calibrations"
            value={summary?.calibrations.total}
          />
          <StatCard
            label="Overdue Calibrations"
            value={summary?.calibrations.overdue}
            alert={Boolean(summary?.calibrations.overdue)}
          />
          <StatCard label="Quotes" value={summary?.quotes.total} />
          <StatCard label="Products" value={summary?.products.total} />
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Activity Log
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Recent system activities and events
          </p>

          {tableData.length > 0 ? (
            <div className="w-full">
              <Table
                headers={tableHeaders}
                data={tableData}
                className="w-full"
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 italic">
                No recent activity found.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

// Enhanced responsive stat card component
interface StatCardProps {
  label: string;
  value?: number;
  alert?: boolean;
  highlight?: boolean;
}

const StatCard = ({ label, value, alert, highlight }: StatCardProps) => {
  let statusBorder = "border-gray-200";
  if (alert && value && value > 0)
    statusBorder = "border-l-4 border-l-red-500 border-gray-200";
  if (highlight && value && value > 0)
    statusBorder = "border-l-4 border-l-amber-500 border-gray-200";

  return (
    <div
      className={`bg-white rounded-xl border p-4 sm:p-5 shadow-sm transition-all hover:shadow-md ${statusBorder}`}
    >
      <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
        {label}
      </p>
      <p
        className={`text-2xl sm:text-3xl font-bold mt-2 tracking-tight ${alert && value && value > 0 ? "text-red-600" : ""}`}
      >
        {value ?? "—"}
      </p>
    </div>
  );
};

export default DashboardPage;
