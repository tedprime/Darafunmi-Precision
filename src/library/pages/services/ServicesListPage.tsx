import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { confirmDialog } from "../../components/common/confirmDialog";
import { Plus, Edit2, Trash2, Search, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getServices, deleteService } from "../../../services/services.jsx";

interface Service {
  id: number;
  title: string;
  slug?: string;
  description?: string;
  icon?: string;
  isFeatured?: boolean;
  status?: string;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const ServiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    getServices()
      .then(({ data }) => {
        setServices(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number, title: string) => {
    if (!(await confirmDialog({
      title: "Delete service?",
      description: `Delete service "${title}"?`,
      confirmLabel: "Delete",
    }))) return;
    setDeletingId(id);
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Failed to delete service.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = services.filter((s) =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ?? true
  );

  return (
    <Layout
      pageTitle="Services"
      pageSubtitle="Manage service offerings displayed on the website."
      action={
        <Button onClick={() => navigate("/services/add")}>
          <Plus size={16} /> Add Service
        </Button>
      }
    >
      {/* Search */}
      <div className="mb-5 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
          placeholder="Search services..."
        />
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, j) => <Skeleton key={j} className="h-8" />)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load services</p>
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
              <h3 className="text-sm font-semibold text-gray-700">All Services</h3>
            </div>
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No services found.</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    {["Title", "Slug", "Featured", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-900 whitespace-normal break-words">{s.title}</td>
                      <td className="px-4 py-3.5 text-xs font-mono text-gray-500 whitespace-normal break-words">{s.slug ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        {s.isFeatured
                          ? <Badge color="blue">Featured</Badge>
                          : <span className="text-gray-400 text-sm">—</span>
                        }
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge color={s.status === "active" ? "green" : "gray"}>{s.status ?? "—"}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            className="p-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 disabled:opacity-40 transition-colors"
                            onClick={() => navigate(`/services/edit/${s.id}`)}
                            disabled={deletingId === s.id}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="p-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                            onClick={() => handleDelete(s.id, s.title)}
                            disabled={deletingId === s.id}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No services found.</p>
            ) : filtered.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 break-words">{s.title}</p>
                    {s.slug && <p className="text-xs font-mono text-gray-400 mt-0.5">{s.slug}</p>}
                  </div>
                  <Badge color={s.status === "active" ? "green" : "gray"}>{s.status ?? "—"}</Badge>
                </div>
                {s.isFeatured && (
                  <div className="mb-3">
                    <Badge color="blue">Featured</Badge>
                  </div>
                )}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 text-xs font-medium disabled:opacity-40"
                    onClick={() => navigate(`/services/edit/${s.id}`)}
                    disabled={deletingId === s.id}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 text-xs font-medium disabled:opacity-40"
                    onClick={() => handleDelete(s.id, s.title)}
                    disabled={deletingId === s.id}
                  >
                    <Trash2 size={13} /> Delete
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

export default ServiceListPage;
