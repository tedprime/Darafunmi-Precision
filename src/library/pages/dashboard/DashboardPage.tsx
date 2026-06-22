import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { getDashboardSummary } from "../../../services/dashboard";
import {
  Users, FileCheck, AlertTriangle,
  ShoppingCart, Calendar, FileText, MessageSquare,
  ArrowUpRight, RefreshCw, Package, Mail, Award, Wrench,
} from "lucide-react";

interface DashboardSummary {
  clients:       { total: number };
  certificates:  { total: number; expiringSoon: number; expired: number };
  calibrations:  { total: number; overdue: number };
  quotes:        { total: number; draft?: number };
  quoteRequests: { total: number; pending?: number };
  products:      { total: number };
  orders:        { total: number; pending?: number };
  bookings:      { total: number; pending?: number };
  contacts:      { new: number };
  recentActivity: {
    event: string;
    category: string;
    status: string;
    user: string;
    createdAt: string;
  }[];
}

/* ─── Skeleton ─────────────────────────────────────────────── */
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

/* ─── KPI Card (top row — action-oriented) ─────────────────── */
interface KpiCardProps {
  label: string;
  value?: number;
  note?: string;
  icon: React.ReactNode;
  alert?: boolean;          // amber when true
  accent?: "blue" | "amber" | "gray";
  onClick?: () => void;
}

const KpiCard = ({ label, value, note, icon, accent = "gray", onClick }: KpiCardProps) => {
  const styles = {
    amber: {
      wrap:  "border-amber-200 bg-amber-50",
      icon:  "bg-amber-100 text-amber-600",
      value: "text-amber-900",
      note:  "text-amber-600",
    },
    blue: {
      wrap:  "border-blue-200 bg-blue-50",
      icon:  "bg-blue-100 text-blue-600",
      value: "text-blue-900",
      note:  "text-blue-600",
    },
    gray: {
      wrap:  "border-gray-200 bg-white",
      icon:  "bg-gray-100 text-gray-500",
      value: "text-gray-900",
      note:  "text-gray-500",
    },
  }[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left rounded-2xl border p-5 transition-all hover:shadow-md ${styles.wrap}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className={`w-10 h-10 p-2 rounded-xl flex items-center justify-center shrink-0 ${styles.icon}`}>
          {icon}
        </div>
        <ArrowUpRight
          size={15}
          className="opacity-0 group-hover:opacity-40 transition-opacity shrink-0 mt-1 text-gray-400"
        />
      </div>
      <p className={`text-3xl font-bold tabular-nums leading-none mb-1.5 ${styles.value}`}>
        {value ?? "—"}
      </p>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {note && <p className={`text-xs mt-1 ${styles.note}`}>{note}</p>}
    </button>
  );
};

/* ─── Module card (grouped secondary stats) ────────────────── */
interface ModuleStat { label: string; value?: number; alert?: boolean }
interface ModuleCardProps {
  title: string;
  icon: React.ReactNode;
  stats: ModuleStat[];
  onClick?: () => void;
}

const ModuleCard = ({ title, icon, stats, onClick }: ModuleCardProps) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
    <div className="flex items-center gap-2 mb-4">
      <span className="text-gray-400">{icon}</span>
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      {onClick && (
        <button
          onClick={onClick}
          className="ml-auto text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-0.5"
        >
          View <ArrowUpRight size={11} />
        </button>
      )}
    </div>
    <div className="divide-y divide-gray-100">
      {stats.map(({ label, value, alert }) => (
        <div key={label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
          <span className="text-sm text-gray-500">{label}</span>
          <span className={`text-sm font-semibold tabular-nums ${alert && value ? "text-red-600" : "text-gray-900"}`}>
            {value ?? "—"}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Activity item ────────────────────────────────────────── */
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; bg: string; text: string; label: string }> = {
  orders:         { icon: <ShoppingCart size={13} />, bg: "bg-blue-100",   text: "text-blue-600",   label: "Order"         },
  bookings:       { icon: <Calendar     size={13} />, bg: "bg-amber-100",  text: "text-amber-600",  label: "Booking"       },
  quotes:         { icon: <FileText     size={13} />, bg: "bg-purple-100", text: "text-purple-600", label: "Quote"         },
  certifications: { icon: <Award        size={13} />, bg: "bg-green-100",  text: "text-green-600",  label: "Certificate"   },
  clients:        { icon: <Users        size={13} />, bg: "bg-cyan-100",   text: "text-cyan-600",   label: "Client"        },
  products:       { icon: <Package      size={13} />, bg: "bg-pink-100",   text: "text-pink-600",   label: "Product"       },
  contacts:       { icon: <Mail         size={13} />, bg: "bg-orange-100", text: "text-orange-600", label: "Contact"       },
  calibrations:   { icon: <Wrench       size={13} />, bg: "bg-rose-100",   text: "text-rose-600",   label: "Calibration"   },
};

const FALLBACK_CAT = { icon: <FileCheck size={13} />, bg: "bg-gray-100", text: "text-gray-500", label: "Activity" };

const STATUS_BADGE: Record<string, string> = {
  completed: "bg-green-50 text-green-700 border border-green-200",
  pending:   "bg-yellow-50 text-yellow-700 border border-yellow-200",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
  active:    "bg-blue-50 text-blue-700 border border-blue-200",
  draft:     "bg-gray-100 text-gray-600 border border-gray-200",
  sent:      "bg-purple-50 text-purple-700 border border-purple-200",
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-NG", { day: "2-digit", month: "short" });
};

// Insert zero-width break opportunities for long tokens (emails, urls)
const insertSoftBreaks = (s?: string) => {
  if (!s) return s ?? "";
  // add a zero-width space before @, ., / and - so browsers can wrap there
  return s.replace(/([@\.\/\-])/g, '\u200B$1');
};

/* ─── Main page ────────────────────────────────────────────── */
const DashboardPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getDashboardSummary()
      .then((r) => { if (alive) { setSummary(r); setError(null); } })
      .catch((e) => { if (alive) setError(e.message || "Failed to load dashboard."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [retry]);

  /* ── Loading ──────────────────────────────────────────────── */
  if (loading) return (
    <Layout pageTitle="Dashboard" pageSubtitle="Here's what's happening today.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
      </div>
      <Skeleton className="h-64" />
    </Layout>
  );

  /* ── Error ────────────────────────────────────────────────── */
  if (error) return (
    <Layout pageTitle="Dashboard" pageSubtitle="Here's what's happening today.">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="text-red-400 w-6 h-6" />
        </div>
        <p className="font-semibold text-gray-800">Failed to load dashboard</p>
        <p className="text-sm text-gray-400 mt-1 mb-6">{error}</p>
        <button
          onClick={() => setRetry((p) => p + 1)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    </Layout>
  );

  const s = summary!;

  /* Compute accents for KPI cards */
  const pendingOrders   = s.orders?.pending   ?? 0;
  const pendingBookings = s.bookings?.pending  ?? 0;
  const pendingRequests = s.quoteRequests?.pending ?? 0;
  const newContacts     = s.contacts?.new      ?? 0;

  return (
    <Layout pageTitle="Dashboard" pageSubtitle="Here's what's happening today.">

      {/* ── Row 1: Action KPIs ─────────────────────────────────
          These are the numbers that demand action. Amber = needs attention.
          2×2 on mobile, 4 across on desktop.                             */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <KpiCard
          label="Pending Orders"
          value={pendingOrders}
          note={pendingOrders ? "Awaiting fulfilment" : "All caught up"}
          icon={<ShoppingCart size={18} />}
          accent={pendingOrders ? "amber" : "gray"}
          onClick={() => navigate("/orders")}
        />
        <KpiCard
          label="Pending Bookings"
          value={pendingBookings}
          note={pendingBookings ? "Need confirmation" : "All confirmed"}
          icon={<Calendar size={18} />}
          accent={pendingBookings ? "amber" : "gray"}
          onClick={() => navigate("/bookings")}
        />
        <KpiCard
          label="Quote Requests"
          value={pendingRequests}
          note={pendingRequests ? "Awaiting response" : "None pending"}
          icon={<FileText size={18} />}
          accent={pendingRequests ? "blue" : "gray"}
          onClick={() => navigate("/quote-requests")}
        />
        <KpiCard
          label="New Messages"
          value={newContacts}
          note={newContacts ? "Unread enquiries" : "Inbox clear"}
          icon={<MessageSquare size={18} />}
          accent={newContacts ? "blue" : "gray"}
          onClick={() => navigate("/contact-submissions")}
        />
      </div>

      {/* ── Row 2: Module overviews ────────────────────────────
          Grouped stats — each card covers a domain.
          1 column on mobile, 3 across on tablet+.                        */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
        <ModuleCard
          title="Certifications"
          icon={<FileCheck size={15} />}
          onClick={() => navigate("/certifications")}
          stats={[
            { label: "Total issued",    value: s.certificates?.total },
            { label: "Expiring soon",   value: s.certificates?.expiringSoon, alert: true },
            { label: "Expired",         value: s.certificates?.expired,      alert: true },
            { label: "Calibrations",    value: s.calibrations?.total },
          ]}
        />
        <ModuleCard
          title="Sales pipeline"
          icon={<ShoppingCart size={15} />}
          onClick={() => navigate("/orders")}
          stats={[
            { label: "Total orders",       value: s.orders?.total },
            { label: "Total quote requests",value: s.quoteRequests?.total },
            { label: "Active quotes",      value: s.quotes?.total },
            { label: "Draft quotes",       value: s.quotes?.draft },
          ]}
        />
        <ModuleCard
          title="Clients & Catalogue"
          icon={<Users size={15} />}
          onClick={() => navigate("/clients")}
          stats={[
            { label: "Registered clients", value: s.clients?.total },
            { label: "Products listed",    value: s.products?.total },
            { label: "Total bookings",     value: s.bookings?.total },
          ]}
        />
      </div>

      {/* ── Row 3: Activity feed ───────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Recent Activity</h3>
          <span className="text-xs text-gray-400">{s.recentActivity?.length ?? 0} events</span>
        </div>

        {(!s.recentActivity || s.recentActivity.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <FileCheck size={18} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No activity yet</p>
          </div>
        ) : (
          <ul className="px-5 py-3">
            {s.recentActivity.map((item, idx) => {
              // case-insensitive + partial match so "Activity", "orders", "Certifications" all resolve
              const catKey = Object.keys(CATEGORY_CONFIG).find(
                (k) => item.category?.toLowerCase().includes(k) || k.includes(item.category?.toLowerCase())
              );
              const cat    = catKey ? CATEGORY_CONFIG[catKey] : FALLBACK_CAT;
              const isLast = idx === s.recentActivity.length - 1;
              return (
                <li key={idx} className="flex gap-4 min-w-0 py-4">
                  {/* Icon node + connecting line */}
                  <div className="flex flex-col items-center shrink-0 pt-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cat.bg} ${cat.text}`}>
                      {cat.icon}
                    </div>
                    {!isLast && <div className="w-px flex-1 min-h-4 bg-gray-100 my-1" />}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 min-w-0 w-full ${!isLast ? "pb-5" : "pb-2"}`}>
                    {/* Timestamp sits above the text on its own line */}
                    <span className="text-xs text-gray-400 tabular-nums">{timeAgo(item.createdAt)}</span>
                    <p className="text-sm text-gray-800 leading-snug mt-0.5 whitespace-normal wrap-break-word">{insertSoftBreaks(item.event)}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[item.status] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                        {item.status}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
                        {cat.label}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

    </Layout>
  );
};

export default DashboardPage;
