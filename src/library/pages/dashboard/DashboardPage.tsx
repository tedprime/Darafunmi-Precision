import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
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

  if (loading) return <p className="text-sm text-gray-500">Loading dashboard...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  return (
    <Layout
      pageTitle="Dashboard"
      pageSubtitle="Welcome back. Here's your business overview."
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Clients"       value={summary?.clients.total} />
        <StatCard label="Total Certificates"  value={summary?.certificates.total} />
        <StatCard label="Expiring Soon"       value={summary?.certificates.expiringSoon} />
        <StatCard label="Expired"             value={summary?.certificates.expired} />
        <StatCard label="Total Calibrations"  value={summary?.calibrations.total} />
        <StatCard label="Overdue Calibrations" value={summary?.calibrations.overdue} />
        <StatCard label="Quotes"              value={summary?.quotes.total} />
        <StatCard label="Products"            value={summary?.products.total} />
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold mb-1">Activity Log</h3>
        <p className="text-sm text-gray-500 mb-4">Recent system activities and events</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Event</th>
              <th className="pb-2">Category</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">User</th>
              <th className="pb-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {summary?.recentActivity.map((entry, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{entry.event}</td>
                <td className="py-2">{entry.category}</td>
                <td className="py-2">{entry.status}</td>
                <td className="py-2">{entry.user}</td>
                <td className="py-2">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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