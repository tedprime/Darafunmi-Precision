import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import { Trash2, TriangleAlert } from "lucide-react";
import { getBookings, updateBookingStatus, deleteBooking } from "../../../services/booking.jsx";

interface Booking {
  id: number;
  bookingNumber?: string;
  // Support both old field names and new ones from backend
  name?: string;
  customerName?: string;
  email?: string;
  customerEmail?: string;
  phone?: string;
  customerPhone?: string;
  company?: string;
  companyName?: string;
  serviceType?: string;
  preferredDate?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  serviceLocation?: string;
  equipmentDetails?: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | string;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const BookingListPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [count, setCount] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    getBookings({ status })
      .then(({ data, count }) => {
        setBookings(data);
        setCount(count);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateBookingStatus(id, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    } catch {
      alert("Failed to update booking status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Delete this booking?`)) return;
    setDeletingId(id);
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("Failed to delete booking.");
    } finally {
      setDeletingId(null);
    }
  };

  const headers = [
    "Name",
    "Contact",
    "Service",
    "Preferred Date",
    "Time",
    "Location",
    "Equipment",
    "Company",
    "Notes",
    "Status",
    "Actions",
  ];

  const data = bookings.map((b) => [
    <div key={`name-${b.id}`}>
      <p className="font-medium text-gray-800 text-sm">{b.customerName ?? b.name ?? "—"}</p>
      {b.bookingNumber && (
        <p className="text-xs text-gray-400">{b.bookingNumber}</p>
      )}
    </div>,
    <div key={`contact-${b.id}`}>
      <p className="text-sm text-gray-700">{b.customerEmail ?? b.email ?? "—"}</p>
      <p className="text-xs text-gray-500">{b.customerPhone ?? b.phone ?? "—"}</p>
    </div>,
    b.serviceType ?? "—",
    (() => { const d = b.scheduledDate ?? b.preferredDate; return d ? new Date(d).toLocaleDateString() : "—"; })(),
    b.scheduledTime ?? "—",
    b.serviceLocation ?? "—",
    b.equipmentDetails ? <span key={`eq-${b.id}`} title={b.equipmentDetails} className="max-w-[120px] truncate block text-sm">{b.equipmentDetails}</span> : "—",
    b.companyName ?? b.company ?? "—",
    b.notes ? <span key={`notes-${b.id}`} title={b.notes} className="max-w-[120px] truncate block text-sm">{b.notes}</span> : "—",
    <select
      key={`status-${b.id}`}
      value={b.status}
      disabled={updatingId === b.id || deletingId === b.id}
      onChange={(e) => handleStatusChange(b.id, e.target.value)}
      className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-40"
    >
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>,
    <button
      key={`del-${b.id}`}
      className="p-1 border border-red-100 rounded text-red-500 hover:bg-red-50 disabled:opacity-40"
      onClick={() => handleDelete(b.id)}
      disabled={deletingId === b.id || updatingId === b.id}
    >
      <Trash2 size={15} />
    </button>,
  ]);

  return (
    <Layout
      pageTitle="Bookings"
      pageSubtitle={`Manage all service booking requests.${count ? ` (${count} total)` : ""}`}
    >
      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <Card>
          <div className="space-y-3">
            <div className="grid grid-cols-11 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-11 gap-4">
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
          <TriangleAlert className="w-8 h-8 mb-4 text-gray-400" />
          <p className="text-gray-700 font-medium">Failed to load bookings</p>
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
          {data.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No bookings found.
            </p>
          ) : (
            <Table headers={headers} data={data} />
          )}
        </Card>
      )}
    </Layout>
  );
};

export default BookingListPage;