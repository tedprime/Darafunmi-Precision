import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import { Search, Trash2, TriangleAlert, Eye, X } from "lucide-react";
import {
  getContactSubmissions,
  deleteContactSubmission,
  updateContactStatus,
  getContactSubmission,
} from "../../../services/contact.jsx";

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt?: string;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const statusColors: Record<string, "blue" | "gray" | "green"> = {
  new: "blue",
  read: "gray",
  replied: "green",
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({
  id,
  onClose,
  onStatusChange,
}: {
  id: number;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
}) => {
  const [submission, setSubmission] = useState<ContactSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getContactSubmission(id)
      .then(setSubmission)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!submission) return;
    setUpdating(true);
    try {
      await updateContactStatus(id, newStatus);
      setSubmission((prev) => prev ? { ...prev, status: newStatus as ContactSubmission["status"] } : prev);
      onStatusChange(id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Contact Submission</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : submission ? (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase font-medium mb-1">Name</p>
                <p className="text-gray-900 font-medium">{submission.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-medium mb-1">Email</p>
                <p className="text-gray-900">{submission.email}</p>
              </div>
              {submission.phone && (
                <div>
                  <p className="text-gray-500 text-xs uppercase font-medium mb-1">Phone</p>
                  <p className="text-gray-900">{submission.phone}</p>
                </div>
              )}
              {submission.company && (
                <div>
                  <p className="text-gray-500 text-xs uppercase font-medium mb-1">Company</p>
                  <p className="text-gray-900">{submission.company}</p>
                </div>
              )}
              {submission.subject && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs uppercase font-medium mb-1">Subject</p>
                  <p className="text-gray-900">{submission.subject}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-gray-500 text-xs uppercase font-medium mb-1">Message</p>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-3">
                {submission.message}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-xs uppercase font-medium mb-2">Status</p>
              <div className="flex gap-2">
                {(["new", "read", "replied"] as const).map((s) => (
                  <button
                    key={s}
                    disabled={updating || submission.status === s}
                    onClick={() => handleStatusChange(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors
                      ${submission.status === s
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {submission.createdAt && (
              <p className="text-xs text-gray-400">
                Submitted: {new Date(submission.createdAt).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <p className="p-6 text-sm text-gray-500">Could not load submission.</p>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ContactSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  
  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({ total: 0, totalPages: 1 });
  
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, pagination: pg } = await getContactSubmissions({ page, status });
        if (isMounted) {
          setSubmissions(data);
          setPaginationMeta({ total: pg.total, totalPages: pg.totalPages });
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          // Safeguard the unknown error assignment to read the message reliably
          const errorMessage = err instanceof Error ? err.message : "An error occurred";
          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [status, page]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this contact submission?")) return;
    setDeletingId(id);
    try {
      await deleteContactSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Failed to delete submission.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setSubmissions((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: newStatus as ContactSubmission["status"] } : s)
    );
  };

  const filtered = submissions.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const headers = ["Name", "Email", "Company", "Subject", "Status", "Actions"];

  const data = filtered.map((s) => [
    <span key={`name-${s.id}`} className="font-medium text-gray-900">{s.name}</span>,
    s.email,
    s.company ?? "—",
    s.subject ?? "—",
    <Badge key={`status-${s.id}`} color={statusColors[s.status] ?? "gray"}>
      {s.status}
    </Badge>,
    <div key={`actions-${s.id}`} className="flex space-x-2">
      <button
        className="p-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-50"
        onClick={() => setViewingId(s.id)}
        title="View"
      >
        <Eye size={15} />
      </button>
      <button
        className="p-1 border border-red-100 rounded text-red-500 hover:bg-red-50 disabled:opacity-40"
        onClick={() => handleDelete(s.id)}
        disabled={deletingId === s.id}
        title="Delete"
      >
        <Trash2 size={15} />
      </button>
    </div>,
  ]);

  return (
    <>
      {viewingId !== null && (
        <DetailModal
          id={viewingId}
          onClose={() => setViewingId(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      <Layout
        pageTitle="Contact Submissions"
        pageSubtitle={`Manage incoming contact form submissions.${paginationMeta.total ? ` (${paginationMeta.total} total)` : ""}`}
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
              placeholder="Search by name or email..."
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>

        {/* Skeleton */}
        {loading && (
          <Card>
            <Skeleton className="h-5 w-40 mb-6" />
            <div className="space-y-3">
              <div className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-4" />)}
              </div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, j) => <Skeleton key={j} className="h-8" />)}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
            <p className="text-gray-700 font-medium">Failed to load submissions</p>
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">All Submissions</h3>
            {data.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No submissions found.</p>
            ) : (
              <Table headers={headers} data={data} />
            )}

            {/* Pagination */}
            {paginationMeta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Page {page} of {paginationMeta.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= paginationMeta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}
      </Layout>
    </>
  );
};

export default ContactSubmissionsPage;