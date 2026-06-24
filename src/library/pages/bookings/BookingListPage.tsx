import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Search,
  X,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Mail,
  Phone,
  Building2,
  MapPin,
  Wrench,
  FileText,
  Clock,
  MoreHorizontal,
  Loader2,
  RefreshCw,
} from "lucide-react";

import Layout from "../../components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import {
  getBookings,
  getBookingByNumber,
  updateBookingStatus,
  deleteBooking,
} from "../../../services/booking.jsx";

/* ------------------------------------------------------------------ */
/* Types — match the shape returned by services/booking.jsx           */
/* ------------------------------------------------------------------ */

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: number;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  serviceType: string;
  scheduledDate: string; // ISO
  scheduledTime: string;
  serviceLocation: string;
  equipmentDetails?: string;
  notes?: string;
  adminNotes?: string;
  status: BookingStatus;
  createdAt: string;
}

const STATUS_META: Record<
  BookingStatus,
  { label: string; dot: string; chip: string; ring: string }
> = {
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
    ring: "ring-amber-500/40",
  },
  confirmed: {
    label: "Confirmed",
    dot: "bg-sky-500",
    chip: "bg-sky-50 text-sky-700 ring-sky-200/70 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30",
    ring: "ring-sky-500/40",
  },
  completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
    ring: "ring-emerald-500/40",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700 ring-rose-200/70 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30",
    ring: "ring-rose-500/40",
  },
};

const ALL_STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];
const PAGE_SIZE = 5;

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [page, setPage] = useState(1);

  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [updateTarget, setUpdateTarget] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<BookingStatus>("pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* --------------------------- data fetching --------------------------- */

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBookings();
      // accept either an array, or { data: [...] }, or { bookings: [...] }
      const list: Booking[] = Array.isArray(data)
        ? data
        : (data?.data ?? data?.bookings ?? []);
      setBookings(list);
    } catch (err: any) {
      console.error("Failed to load bookings:", err);
      setError(err?.message ?? "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  /* ------------------------------ derived ------------------------------ */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!q) return true;
      return (
        b.customerName?.toLowerCase().includes(q) ||
        b.bookingNumber?.toLowerCase().includes(q) ||
        b.customerEmail?.toLowerCase().includes(q) ||
        b.serviceType?.toLowerCase().includes(q) ||
        (b.companyName ?? "").toLowerCase().includes(q)
      );
    });
  }, [bookings, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const counts = useMemo(() => {
    const base = { all: bookings.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    for (const b of bookings) {
      if (b.status in base) (base as any)[b.status]++;
    }
    return base;
  }, [bookings]);

  /* ------------------------------ handlers ----------------------------- */

  const openView = useCallback(async (b: Booking) => {
    setViewBooking(b);
    // optionally refresh details from API by booking number
    try {
      setViewLoading(true);
      const detailed = await getBookingByNumber(b.bookingNumber);
      const resolved: Booking | undefined =
        detailed?.data ?? detailed?.booking ?? detailed;
      if (resolved && resolved.id) setViewBooking(resolved);
    } catch (err) {
      // soft-fail — we already show the row data
      console.warn("getBookingByNumber failed:", err);
    } finally {
      setViewLoading(false);
    }
  }, []);

  const openUpdate = (b: Booking) => {
    setUpdateTarget(b);
    setNewStatus(b.status);
    setAdminNotes(b.adminNotes ?? "");
  };

  const saveStatus = async () => {
    if (!updateTarget) return;
    setSaving(true);
    try {
      await updateBookingStatus(updateTarget.id, newStatus, adminNotes.trim() || undefined);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === updateTarget.id
            ? { ...b, status: newStatus, adminNotes: adminNotes.trim() || b.adminNotes }
            : b,
        ),
      );
      if (viewBooking?.id === updateTarget.id) {
        setViewBooking((v) =>
          v ? { ...v, status: newStatus, adminNotes: adminNotes.trim() || v.adminNotes } : v,
        );
      }
      setUpdateTarget(null);
    } catch (err: any) {
      console.error("updateBookingStatus failed:", err);
      alert(err?.message ?? "Failed to update booking status.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBooking(deleteTarget.id);
      setBookings((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      if (viewBooking?.id === deleteTarget.id) setViewBooking(null);
      setDeleteTarget(null);
    } catch (err: any) {
      console.error("deleteBooking failed:", err);
      alert(err?.message ?? "Failed to delete booking.");
    } finally {
      setDeleting(false);
    }
  };

  /* ------------------------------- render ------------------------------ */

  return (
    <Layout
      pageTitle="Bookings"
      pageSubtitle="Review incoming service requests, update their status, and keep your team aligned."
      action={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBookings}
            disabled={loading}
            className="h-9 gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2 shadow-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">{counts.all}</span>
            <span className="text-sm text-muted-foreground">total</span>
          </div>
        </div>
      }
    >
      <div>

          {/* Toolbar */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by customer, booking number, service…"
                className="h-11 rounded-xl border-border/70 bg-card pl-9 pr-9 shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as BookingStatus | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-card shadow-sm sm:w-48 py-4">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={loadBookings} />
          ) : pageItems.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <ul className="space-y-3">
              {pageItems.map((b) => (
                <li key={b.id}>
                  <BookingCard
                    booking={b}
                    onView={() => openView(b)}
                    onUpdate={() => openUpdate(b)}
                    onDelete={() => setDeleteTarget(b)}
                  />
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {!loading && !error && filtered.length > PAGE_SIZE && (
            <div className="mt-6 flex items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of <span className="font-medium text-foreground">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 text-sm tabular-nums text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

        {/* View dialog */}
        <Dialog open={!!viewBooking} onOpenChange={(o) => !o && setViewBooking(null)}>
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
            {viewBooking && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <StatusPill status={viewBooking.status} />
                    <span className="font-mono text-xs text-muted-foreground">
                      {viewBooking.bookingNumber}
                    </span>
                    {viewLoading && (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <DialogTitle className="pt-1 text-xl">{viewBooking.customerName}</DialogTitle>
                </DialogHeader>

                <Separator />

                <div className="space-y-3 text-sm">
                  <DetailRow icon={Mail} label="Email" value={viewBooking.customerEmail} />
                  <DetailRow icon={Phone} label="Phone" value={viewBooking.customerPhone} />
                  <DetailRow icon={Building2} label="Company" value={viewBooking.companyName} />
                  <DetailRow icon={Wrench} label="Service" value={viewBooking.serviceType} />
                  <DetailRow
                    icon={Calendar}
                    label="Scheduled"
                    value={`${formatDate(viewBooking.scheduledDate)} · ${viewBooking.scheduledTime}`}
                  />
                  <DetailRow icon={MapPin} label="Location" value={viewBooking.serviceLocation} />
                  <DetailRow
                    icon={FileText}
                    label="Equipment"
                    value={viewBooking.equipmentDetails}
                  />
                  {viewBooking.notes && (
                    <div className="rounded-lg border border-border/70 bg-muted/40 p-3">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        Customer notes
                      </p>
                      <p className="text-sm text-foreground">{viewBooking.notes}</p>
                    </div>
                  )}
                  {viewBooking.adminNotes && (
                    <div className="rounded-lg border border-amber-200/70 bg-amber-50/70 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
                      <p className="mb-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                        Internal notes
                      </p>
                      <p className="text-sm text-amber-900 dark:text-amber-100">
                        {viewBooking.adminNotes}
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteTarget(viewBooking)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                  <Button
                    onClick={() => {
                      const b = viewBooking;
                      setViewBooking(null);
                      openUpdate(b);
                    }}
                  >
                    Update status
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Update status dialog */}
        <Dialog open={!!updateTarget} onOpenChange={(o) => !o && !saving && setUpdateTarget(null)}>
          <DialogContent className="sm:max-w-md">
            {updateTarget && (
              <>
                <DialogHeader>
                  <DialogTitle>Update status</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {updateTarget.customerName}{" "}
                    <span className="font-mono text-xs">· {updateTarget.bookingNumber}</span>
                  </p>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      New status
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_STATUSES.map((s) => {
                        const meta = STATUS_META[s];
                        const active = newStatus === s;
                        return (
                          <button
                            key={s}
                            onClick={() => setNewStatus(s)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                              active
                                ? "border-foreground/80 bg-foreground/5 ring-2 " + meta.ring
                                : "border-border bg-card text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
                            )}
                          >
                            <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
                            {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="admin-notes" className="mb-1.5 block text-sm font-medium">
                      Internal notes{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Textarea
                      id="admin-notes"
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="e.g. Engineer dispatched, ETA 30 minutes…"
                      className="resize-none"
                    />
                  </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => setUpdateTarget(null)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={saveStatus} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save changes
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete confirm */}
        <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && !deleting && setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete booking?</DialogTitle>
              <p className="text-sm text-muted-foreground">
                This will permanently remove{" "}
                <span className="font-medium text-foreground">{deleteTarget?.bookingNumber}</span>{" "}
                from your records.
              </p>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponents                                                       */
/* ------------------------------------------------------------------ */

// function StatTab({
//   label,
//   count,
//   active,
//   onClick,
//   dotClass,
// }: {
//   label: string;
//   count: number;
//   active: boolean;
//   onClick: () => void;
//   dotClass?: string;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className={cn(
//         "group flex items-center justify-between gap-2 rounded-xl border bg-card px-3.5 py-3 text-left shadow-sm transition-all",
//         active
//           ? "border-foreground/70 ring-2 ring-foreground/10"
//           : "border-border/70 hover:border-border hover:shadow",
//       )}
//     >
//       <div className="flex min-w-0 items-center gap-2">
//         {dotClass && <span className={cn("h-2 w-2 shrink-0 rounded-full", dotClass)} />}
//         <span
//           className={cn(
//             "truncate text-sm font-medium",
//             active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
//           )}
//         >
//           {label}
//         </span>
//       </div>
//       <span
//         className={cn(
//           "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
//           active ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
//         )}
//       >
//         {count}
//       </span>
//     </button>
//   );
// }

function StatusPill({ status }: { status: BookingStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        meta.chip,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

function BookingCard({
  booking,
  onView,
  onUpdate,
  onDelete,
}: {
  booking: Booking;
  onView: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onView}
      className="group cursor-pointer rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-px hover:border-border hover:shadow-md sm:p-5"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_auto] sm:items-center sm:gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Avatar name={booking.customerName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {booking.customerName}
              </p>
              <p className="truncate font-mono text-[11px] text-muted-foreground">
                {booking.bookingNumber}
              </p>
            </div>
          </div>
          {booking.companyName && (
            <p className="mt-2 hidden truncate text-xs text-muted-foreground sm:block">
              <Building2 className="mr-1 inline h-3 w-3" />
              {booking.companyName}
            </p>
          )}
        </div>

        <div className="hidden min-w-0 sm:block">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Service
          </p>
          <p className="mt-0.5 truncate text-sm text-foreground">{booking.serviceType}</p>
        </div>

        <div className="hidden min-w-0 sm:block">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Scheduled
          </p>
          <p className="mt-0.5 truncate text-sm text-foreground">
            {formatDate(booking.scheduledDate)}
          </p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {booking.scheduledTime}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate();
            }}
            className="rounded-full transition hover:scale-105"
            aria-label="Update status"
          >
            <StatusPill status={booking.status} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
                aria-label="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onSelect={onView}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onUpdate}>
                <Wrench className="mr-2 h-4 w-4" />
                Update status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border/60 pt-3 text-xs text-muted-foreground sm:hidden">
        <div className="min-w-0">
          <p className="font-medium uppercase tracking-wide text-[10px]">Service</p>
          <p className="truncate text-foreground">{booking.serviceType}</p>
        </div>
        <div className="min-w-0">
          <p className="font-medium uppercase tracking-wide text-[10px]">Scheduled</p>
          <p className="truncate text-foreground">
            {formatDate(booking.scheduledDate)} · {booking.scheduledTime}
          </p>
        </div>
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = (name ?? "?")
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-muted to-muted/60 text-xs font-semibold text-foreground ring-1 ring-border/60">
      {initials || "?"}
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="wrap-break-word text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="h-23 animate-pulse rounded-xl border border-border/70 bg-card shadow-sm"
        />
      ))}
    </ul>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <p className="text-sm font-medium text-destructive">Couldn’t load bookings</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/70 bg-card/50 p-12 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {search ? "No bookings match your search" : "No bookings yet"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {search
          ? "Try adjusting your filters or clearing the search."
          : "New service requests will show up here."}
      </p>
    </div>
  );
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
