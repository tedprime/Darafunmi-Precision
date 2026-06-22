import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import { Trash2, Eye, TriangleAlert, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getBookings,
  getBookingByNumber,
  updateBookingStatus,
  deleteBooking,
} from "../../../services/booking.jsx";

interface Booking {
  id: number;
  bookingNumber?: string;
  customerName?: string;
  name?: string;
  customerEmail?: string;
  email?: string;
  customerPhone?: string;
  phone?: string;
  companyName?: string;
  company?: string;
  serviceType?: string;
  scheduledDate?: string;
  preferredDate?: string;
  scheduledTime?: string;
  serviceLocation?: string;
  equipmentDetails?: string;
  notes?: string;
  adminNotes?: string;
  status: string;
  createdAt?: string;
}

const ALL_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const Modal = ({
  open, onClose, title, children,
}: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto p-6 flex-1">{children}</div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <div className="flex gap-2 text-sm py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-gray-800 font-medium break-words">{value}</span>
    </div>
  ) : null;

const BookingListPage: React.FC = () => {
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [status, setStatus]       = useState("");
  const [search, setSearch]       = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [count, setCount]         = useState(0);

  // View modal
  const [viewBooking, setViewBooking]   = useState<Booking | null>(null);
  const [viewLoading, setViewLoading]   = useState(false);

  // Status update modal
  const [updateTarget, setUpdateTarget] = useState<Booking | null>(null);
  const [newStatus, setNewStatus]       = useState("");
  const [adminNotes, setAdminNotes]     = useState("");
  const [updatingId, setUpdatingId]     = useState<number | null>(null);

  // Pagination
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 20;

  // Delete
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoading(true);
    getBookings({ status, search, page, limit: LIMIT })
      .then(({ data, count }) => {
        setBookings(data);
        setCount(count);
        setTotalPages(Math.max(1, Math.ceil(count / LIMIT)));
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status, search, page]);

  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => { setSearch(val.trim()); setPage(1); }, 500);
  };

  const handleView = async (b: Booking) => {
    if (!b.bookingNumber) {
      setViewBooking(b);
      return;
    }
    setViewLoading(true);
    setViewBooking(b); // show partial while loading
    try {
      const full = await getBookingByNumber(b.bookingNumber);
      setViewBooking(full);
    } catch {
      // keep partial data
    } finally {
      setViewLoading(false);
    }
  };

  const openUpdateModal = (b: Booking) => {
    setUpdateTarget(b);
    setNewStatus(b.status);
    setAdminNotes(b.adminNotes ?? "");
  };

  const handleStatusSave = async () => {
    if (!updateTarget) return;
    setUpdatingId(updateTarget.id);
    try {
      await updateBookingStatus(updateTarget.id, newStatus, adminNotes);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === updateTarget.id
            ? { ...b, status: newStatus, adminNotes: adminNotes.trim() || b.adminNotes }
            : b
        )
      );
      if (viewBooking?.id === updateTarget.id) {
        setViewBooking((prev) => prev ? { ...prev, status: newStatus, adminNotes: adminNotes.trim() || prev.adminNotes } : prev);
      }
      setUpdateTarget(null);
    } catch {
      alert("Failed to update booking status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this booking? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      if (viewBooking?.id === id) setViewBooking(null);
    } catch {
      alert("Failed to delete booking.");
    } finally {
      setDeletingId(null);
    }
  };

  const displayName = (b: Booking) => b.customerName ?? b.name ?? "—";
  const displayDate = (b: Booking) => {
    const d = b.scheduledDate ?? b.preferredDate;
    return d ? new Date(d).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  };

  const headers = ["Customer", "Service", "Date / Time", "Status", "Actions"];

  const data = bookings.map((b) => [
    <div key={`name-${b.id}`}>
      <p className="font-medium text-gray-800 text-sm">{displayName(b)}</p>
      {b.bookingNumber && <p className="text-xs text-gray-400 font-mono">{b.bookingNumber}</p>}
      {(b.customerEmail ?? b.email) && <p className="text-xs text-gray-500">{b.customerEmail ?? b.email}</p>}
    </div>,
    <span key={`svc-${b.id}`} className="text-sm text-gray-700">{b.serviceType ?? "—"}</span>,
    <div key={`date-${b.id}`}>
      <p className="text-sm text-gray-700">{displayDate(b)}</p>
      {b.scheduledTime && <p className="text-xs text-gray-400">{b.scheduledTime}</p>}
    </div>,
    <button
      key={`status-${b.id}`}
      onClick={() => openUpdateModal(b)}
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLOR[b.status] ?? "bg-gray-100 text-gray-600"}`}
      title="Click to update status"
    >
      {b.status}
    </button>,
    <div key={`actions-${b.id}`} className="flex items-center gap-1.5">
      <button
        className="p-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-40"
        onClick={() => handleView(b)}
        title="View details"
      >
        <Eye size={14} />
      </button>
      <button
        className="p-1.5 border border-red-100 rounded text-red-500 hover:bg-red-50 disabled:opacity-40"
        onClick={() => handleDelete(b.id)}
        disabled={deletingId === b.id}
        title="Delete booking"
      >
        <Trash2 size={14} />
      </button>
    </div>,
  ]);

  return (
    <Layout
      pageTitle="Bookings"
      pageSubtitle={`Manage all service booking requests.${count ? ` (${count} total)` : ""}`}
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by customer name…"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setSearch(""); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <Card>
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4" />)}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, j) => <Skeleton key={j} className="h-10" />)}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 mb-4 text-gray-400" />
          <p className="text-gray-700 font-medium">Failed to load bookings</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Retry</button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <Card>
          {data.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              {search ? "No bookings match your search." : "No bookings found."}
            </p>
          ) : (
            <Table headers={headers} data={data} />
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1 || loading}
                  className="p-1.5 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages || loading}
                  className="p-1.5 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── View Modal ── */}
      <Modal open={!!viewBooking} onClose={() => setViewBooking(null)} title="Booking Details">
        {viewBooking && (
          viewLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[viewBooking.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {viewBooking.status}
                </span>
                {viewBooking.bookingNumber && (
                  <span className="text-xs font-mono text-gray-500">{viewBooking.bookingNumber}</span>
                )}
              </div>
              <div className="space-y-0.5">
                <InfoRow label="Customer" value={viewBooking.customerName ?? viewBooking.name} />
                <InfoRow label="Email" value={viewBooking.customerEmail ?? viewBooking.email} />
                <InfoRow label="Phone" value={viewBooking.customerPhone ?? viewBooking.phone} />
                <InfoRow label="Company" value={viewBooking.companyName ?? viewBooking.company} />
                <InfoRow label="Service Type" value={viewBooking.serviceType} />
                <InfoRow label="Scheduled Date" value={displayDate(viewBooking)} />
                <InfoRow label="Scheduled Time" value={viewBooking.scheduledTime} />
                <InfoRow label="Location" value={viewBooking.serviceLocation} />
                <InfoRow label="Equipment" value={viewBooking.equipmentDetails} />
                <InfoRow label="Notes" value={viewBooking.notes} />
                {viewBooking.adminNotes && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs font-semibold text-yellow-700 mb-1">Admin Notes</p>
                    <p className="text-sm text-yellow-800">{viewBooking.adminNotes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => { setViewBooking(null); openUpdateModal(viewBooking); }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Update Status
                </button>
                <button
                  onClick={() => handleDelete(viewBooking.id)}
                  disabled={deletingId === viewBooking.id}
                  className="px-4 py-2 border border-red-200 text-red-500 text-sm font-medium rounded-md hover:bg-red-50 disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </>
          )
        )}
      </Modal>

      {/* ── Status Update Modal ── */}
      <Modal open={!!updateTarget} onClose={() => setUpdateTarget(null)} title="Update Booking Status">
        {updateTarget && (
          <>
            <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
              <p className="font-medium">{displayName(updateTarget)}</p>
              {updateTarget.bookingNumber && <p className="text-xs text-gray-400 font-mono mt-0.5">{updateTarget.bookingNumber}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Notes <span className="text-gray-400 font-normal">(optional — internal only)</span>
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Engineer assigned, rescheduled to afternoon slot…"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleStatusSave}
                disabled={updatingId === updateTarget.id}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {updatingId === updateTarget.id ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setUpdateTarget(null)}
                disabled={updatingId === updateTarget.id}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </Modal>
    </Layout>
  );
};

export default BookingListPage;
