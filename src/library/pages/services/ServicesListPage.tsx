import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Edit2, Trash2, Search, TriangleAlert } from "lucide-react";
import { apiFetch } from "../../../services/api";

interface Service {
  id: number;
  title: string;
  slug: string;
  description: string;
  status: "active" | "inactive" | string;
  imageUrl?: string;
}

const STATUS_COLOR: Record<string, "green" | "gray"> = {
  active: "green",
  inactive: "gray",
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const ServicesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchServices = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (search) params.append("search", search);

    apiFetch(`/services?${params.toString()}`)
      .then((res: any) => {
        // Handle array responses directly or wrapped inside data properties
        setServices(res.data ?? res);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, [search]);

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the service "${title}"?`)) return;
    try {
      await apiFetch(`/services/${id}`, { method: "DELETE" });
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete service.");
    }
  };

  // Maps clean uniform action components into table rows
  const tableData = services.map((service) => [
    service.imageUrl ? (
      <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 border border-gray-200">
        <img src={service.imageUrl} alt="" className="w-full h-full object-cover" />
      </div>
    ) : (
      <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">
        No Img
      </div>
    ),
    <div className="font-medium text-gray-900">{service.title}</div>,
    <span className="text-gray-500 font-mono text-xs">{service.slug || "-"}</span>,
    <div className="text-gray-500 max-w-xs truncate">{service.description || "-"}</div>,
    <Badge color={STATUS_COLOR[service.status] || "gray"}>{service.status}</Badge>,
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate(`/services/edit/${service.id}`)}
        className="p-1 border border-blue-200 rounded text-blue-500 hover:bg-blue-50"
        title="Edit"
      >
        <Edit2 size={15} />
      </button>
      <button
        onClick={() => handleDelete(service.id, service.title)}
        className="p-1 border border-red-100 rounded text-red-500 hover:bg-red-50"
        title="Delete"
      >
        <Trash2 size={15} />
      </button>
    </div>,
  ]);

  return (
    <Layout
      pageTitle="Services"
      pageSubtitle="Manage client service packages and documentation."
      action={
        <Button onClick={() => navigate("/services/add")} className="flex items-center gap-2">
          <Plus size={16} />
          <span>Add Service</span>
        </Button>
      }
    >
      {/* Structural Search Box Layout */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search services by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Loading Skeleton matching Product Table Skeletons */}
      {loading && (
        <Card>
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4 border-b border-gray-100 pb-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-24" />
              ))}
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 py-1">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error Boundary */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-red-500 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load services</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <Button onClick={fetchServices} className="mt-4" variant="secondary">
            Retry
          </Button>
        </div>
      )}

      {/* Structured Table Context View */}
      {!loading && !error && (
        <Card className="overflow-hidden">
          {services.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No services found. Click "Add Service" to create one.
            </div>
          ) : (
            <Table
              headers={["Image", "Title", "Slug", "Description", "Status", "Actions"]}
              data={tableData}
            />
          )}
        </Card>
      )}
    </Layout>
  );
};

export default ServicesListPage;