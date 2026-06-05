import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Button from "../../components/common/Button";
import { Plus, Edit2, Trash2, Search, TriangleAlert } from "lucide-react";
import { getServices, deleteService } from "../../../services/services.jsx";

interface ServiceItem {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const ServicesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    getServices({ search })
      .then((res) => {
        setServices(res.data ?? []);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete service.");
    }
  };

  const tableHeaders = ["Image", "Service Name", "Description", "Actions"];
  const tableData = services.map((item) => [
    item.imageUrl ? (
      <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded object-cover" />
    ) : (
      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Image</div>
    ),
    <span className="font-medium text-gray-900">{item.name}</span>,
    <p className="max-w-xs truncate text-gray-500">{item.description}</p>,
    <div className="flex items-center space-x-2">
      <button onClick={() => navigate(`/services/edit/${item.id}`)} className="p-1 border border-blue-200 rounded text-blue-500 hover:bg-blue-50">
        <Edit2 size={15} />
      </button>
      <button onClick={() => handleDelete(item.id)} className="p-1 border border-red-100 rounded text-red-500 hover:bg-red-50">
        <Trash2 size={15} />
      </button>
    </div>,
  ]);

  return (
    <Layout
      pageTitle="Services"
      pageSubtitle="Manage application services, descriptions, and media assets."
      action={
        <Button onClick={() => navigate("/services/add")} className="flex items-center gap-2">
          <Plus size={16} /> Add Service
        </Button>
      }
    >
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search services..."
          className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && (
        <Card>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load services</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <Card>
          {services.length === 0 ? (
            <p className="text-center py-6 text-gray-500">No services found.</p>
          ) : (
            <Table headers={tableHeaders} data={tableData} />
          )}
        </Card>
      )}
    </Layout>
  );
};

export default ServicesListPage;