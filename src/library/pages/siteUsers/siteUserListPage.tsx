import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import { Search, TriangleAlert, ToggleLeft, ToggleRight } from "lucide-react";
import { getSiteUsers, toggleSiteUserActive } from "../../../services/siteUsers.jsx";

interface SiteUser {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const SiteUserListPage: React.FC = () => {
  const [users, setUsers] = useState<SiteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    getSiteUsers({ search })
      .then((res) => {
        setUsers(res.data ?? res);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  const handleToggle = async (user: SiteUser) => {
    if (!confirm(`${user.isActive ? "Deactivate" : "Activate"} account for "${user.email}"?`)) return;
    setTogglingId(user.id);
    try {
      await toggleSiteUserActive(user.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      );
    } catch {
      alert("Failed to update user status.");
    } finally {
      setTogglingId(null);
    }
  };

  const headers = ["Name", "Email", "Status", "Joined", "Actions"];

  const data = users.map((user) => [
    user.name ?? "—",
    user.email,
    <Badge
      key={`status-${user.id}`}
      color={user.isActive ? "green" : "gray"}
    >
      {user.isActive ? "Active" : "Inactive"}
    </Badge>,
    user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—",
    <button
      key={`toggle-${user.id}`}
      onClick={() => handleToggle(user)}
      disabled={togglingId === user.id}
      title={user.isActive ? "Deactivate user" : "Activate user"}
      className={`p-1 border rounded transition-colors disabled:opacity-40 ${
        user.isActive
          ? "border-red-100 text-red-500 hover:bg-red-50"
          : "border-green-200 text-green-600 hover:bg-green-50"
      }`}
    >
      {user.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
    </button>,
  ]);

  return (
    <Layout
      pageTitle="Site Users"
      pageSubtitle="Manage registered customer accounts."
    >
      {/* Search */}
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
            placeholder="Search by email..."
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <Card>
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, j) => (
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
          <p className="text-gray-700 font-medium">Failed to load site users</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            All Site Users
          </h3>
          {data.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No site users found.
            </p>
          ) : (
            <Table headers={headers} data={data} />
          )}
        </Card>
      )}
    </Layout>
  );
};

export default SiteUserListPage;