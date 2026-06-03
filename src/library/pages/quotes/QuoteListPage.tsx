import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Trash2, Search, Edit2, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getQuotes, deleteQuote } from "../../../services/quote.jsx";

interface Quote {
  id: number;
  quoteNumber: string;
  client?: { name: string } | string;
  amount: number;
  status: "pending" | "accepted" | "rejected" | string;
  date: string;
  notes?: string;
}

const STATUS_COLOR: Record<string, "yellow" | "green" | "red" | "gray"> = {
  pending: "yellow",
  accepted: "green",
  rejected: "red",
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const QuoteListPage: React.FC = () => {
  const navigate = useNavigate();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [count, setCount] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    getQuotes({ search, status })
      .then(({ data, count }) => {
        setQuotes(data);
        setCount(count);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, status]);

  const handleDelete = async (id: number, quoteNumber: string) => {
    if (!confirm(`Delete quote "${quoteNumber}"?`)) return;
    try {
      setDeletingId(id);
      await deleteQuote(id);
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    } catch {
      alert("Failed to delete quote.");
    } finally {
      setDeletingId(null);
    }
  };

  const getClientName = (client: Quote["client"]) => {
    if (!client) return "—";
    if (typeof client === "object") return client.name;
    return client;
  };

  const headers = [
    "Quote No",
    "Client",
    "Amount",
    "Status",
    "Date",
    "Notes",
    "Actions",
  ];

  const data = quotes.map((quote) => [
    quote.quoteNumber,
    getClientName(quote.client),
    quote.amount !== undefined
      ? `₦${Number(quote.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      : "—",
    <Badge
      key={`status-${quote.id}`}
      color={STATUS_COLOR[quote.status] ?? "gray"}
    >
      {quote.status}
    </Badge>,
    quote.date ? new Date(quote.date).toLocaleDateString() : "—",
    quote.notes ?? "—",
    <div key={`actions-${quote.id}`} className="flex space-x-2">
      <button
        className="p-1 border border-blue-200 rounded text-blue-500 hover:bg-blue-50 disabled:opacity-40"
        onClick={() => navigate(`/quotes/edit/${quote.id}`)}
        disabled={deletingId === quote.id}
      >
        <Edit2 size={15} />
      </button>
      <button
        className="p-1 border border-red-100 rounded text-red-500 hover:bg-red-50 disabled:opacity-40"
        onClick={() => handleDelete(quote.id, quote.quoteNumber)}
        disabled={deletingId === quote.id}
      >
        <Trash2 size={15} />
      </button>
    </div>,
  ]);

  return (
    <Layout
      pageTitle="Quotes"
      pageSubtitle={`Manage all quotes and their details here.${count ? ` (${count} total)` : ""}`}
      action={
        <Button
          className="flex items-center"
          onClick={() => navigate("/quotes/add")}
        >
          <Plus size={16} className="mr-2" /> Add Quote
        </Button>
      }
    >
      {/* Filters */}
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
            placeholder="Search by quote number..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <Card>
          <div className="space-y-3">
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, j) => (
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
          <p className="text-4xl mb-4"><TriangleAlert className="w-8 h-8"/></p>
          <p className="text-gray-700 font-medium">Failed to load quotes</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Quotes Table */}
      {!loading && !error && (
        <Card>
          {data.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No quotes found.
            </p>
          ) : (
            <Table headers={headers} data={data} />
          )}
        </Card>
      )}
    </Layout>
  );
};

export default QuoteListPage;
