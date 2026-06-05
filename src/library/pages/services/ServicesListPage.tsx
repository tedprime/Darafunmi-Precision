import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Edit2, Trash2, Search, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getServices, deleteService } from "../../../services/services.jsx";

interface Service {
  id: number;
  title: string;
  slug: string;
  description?: string;
  status?: string;
  imageUrl?: string;
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
      .then((res) => {
        const all: Service[] = res.data ?? res;
        // client-side search since API has no search param
        setServices(
          search
            ? all.filter((s) =>
                s.title.toLowerCase().includes(search.toLowerCase())
              )
            : all
        );
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete service "${title}"?`)) return;
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

  const headers = ["Title", "Slug", "Status", "Actions"];

  const data = services.map((service) => [
    service.title,
    <span key={`slug-${service.id}`} className="text-xs text-gray-400 font-mono">
      {service.slug ?? "—"}
    </span>,
    <Badge
      key={`status-${service.id}`}
      color={service.status === "active" ? "green" : "gray"}
    >
      {service.status ?? "active"}
    </Badge>,
    <div key={`actions-${service.id}`} className="flex space-x-2">
      <button
        className="p-1 border border-blue-200 rounded text-blue-500 hover:bg-blue-50 disabled:opacity-40"
        onClick={() => navigate(`/services/edit/${service.id}`)}
        disabled={deletingId === service.id}
      >
        <Edit2 size={15} />
      </button>
      <button
        className="p-1 border border-red-100 rounded text-red-500 hover:bg-red-50 disabled:opacity-40"
        onClick={() => handleDelete(service.id, service.title)}
        disabled={deletingId === service.id}
      >
        <Trash2 size={15} />
      </button>
    </div>,
  ]);

  return (
    <Layout
      pageTitle="Services"
      pageSubtitle="Manage your service offerings."
      action={
        <Button
          className="flex items-center"
          onClick={() => navigate("/services/add")}
        >
          <Plus size={16} className="mr-2" /> Add Service
        </Button>
      }
    >
      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search services..."
        />
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <Card>
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
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
          <p className="text-gray-700 font-medium">Failed to load services</p>
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
            All Services
          </h3>
          {data.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No services found.
            </p>
          ) : (
            <Table headers={headers} data={data} />
          )}
        </Card>
      )}
    </Layout>
  );
};

export default ServiceListPage;