import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/common/Badge";
import { confirmDialog } from "../../components/common/confirmDialog";
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
    const action = user.isActive ? "Deactivate" : "Activate";
    if (!(await confirmDialog({
      title: `${action} account?`,
      description: `${action} account for "${user.email}"?`,
      confirmLabel: action,
      variant: user.isActive ? "danger" : "primary",
    }))) return;
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

  return (
    <Layout
      pageTitle="Site Users"
      pageSubtitle="Manage registered customer accounts."
    >
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
            placeholder="Search by email..."
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-8" />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load site users</p>
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
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">All Site Users</h3>
            </div>
            {users.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No site users found.</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    {["Name", "Email", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-900 whitespace-normal break-words">{user.name ?? "—"}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-normal break-words">{user.email}</td>
                      <td className="px-4 py-3.5">
                        <Badge color={user.isActive ? "green" : "gray"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggle(user)}
                          disabled={togglingId === user.id}
                          title={user.isActive ? "Deactivate user" : "Activate user"}
                          className={`p-1.5 border rounded-md transition-colors disabled:opacity-40 ${
                            user.isActive
                              ? "border-red-100 text-red-500 hover:bg-red-50"
                              : "border-green-200 text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {user.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
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
            {users.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No site users found.</p>
            ) : users.map((user) => (
              <div key={user.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{user.name ?? "—"}</p>
                    <p className="text-xs text-gray-500 break-words mt-0.5">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                  <Badge color={user.isActive ? "green" : "gray"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleToggle(user)}
                    disabled={togglingId === user.id}
                    className={`flex items-center gap-1.5 text-xs font-medium disabled:opacity-40 transition-colors ${
                      user.isActive
                        ? "text-red-500 hover:text-red-700"
                        : "text-green-600 hover:text-green-800"
                    }`}
                  >
                    {user.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {user.isActive ? "Deactivate" : "Activate"}
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

export default SiteUserListPage;
