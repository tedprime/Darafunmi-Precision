import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Table from "../../components/ui/Table";
import { getDashboardSummary } from "../../../services/dashboard";
import {
  Users, FileCheck, Clock, AlertTriangle,
  ShoppingCart, Calendar, FileText, MessageSquare,
  PackageCheck, ChevronRight,
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

interface ApiError {
  status?: number;
  message: string;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

/* ─── Stat card ────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value?: number;
  sub?: string;
  subValue?: number;
  icon: React.ReactNode;
  accent?: "blue" | "yellow" | "red" | "green" | "gray";
  href?: string;
  onClick?: () => void;
}

const ACCENT = {
  blue:   { bg: "bg-blue-50",   icon: "text-blue-500",  badge: "bg-blue-100 text-blue-700"   },
  yellow: { bg: "bg-yellow-50", icon: "text-yellow-500",badge: "bg-yellow-100 text-yellow-700"},
  red:    { bg: "bg-red-50",    icon: "text-red-500",   badge: "bg-red-100 text-red-700"     },
  green:  { bg: "bg-green-50",  icon: "text-green-500", badge: "bg-green-100 text-green-700" },
  gray:   { bg: "bg-gray-50",   icon: "text-gray-500",  badge: "bg-gray-100 text-gray-600"   },
};

const StatCard = ({ label, value, sub, subValue, icon, accent = "gray", onClick }: StatCardProps) => {
  const a = ACCENT[accent];
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 ${onClick ? "cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all" : ""}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${a.bg}`}>
          <span className={a.icon}>{icon}</span>
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value ?? "—"}</p>
      {sub && subValue !== undefined && (
        <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full ${a.badge}`}>
          {subValue} {sub}
        </span>
      )}
    </div>
  );
};

/* ─── Section heading ──────────────────────────────────────── */
const SectionHeading = ({ title, linkLabel, onClick }: { title: string; linkLabel?: string; onClick?: () => void }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-base font-semibold text-gray-800">{title}</h3>
    {linkLabel && onClick && (
      <button onClick={onClick} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
        {linkLabel} <ChevronRight size={13} />
      </button>
    )}
  </div>
);

/* ─── Main page ────────────────────────────────────────────── */
const DashboardPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getDashboardSummary()
      .then((result) => { if (isMounted) { setSummary(result); setError(null); } })
      .catch((err) => { if (isMounted) setError({ status: err.status, message: err.message || "An unexpected error occurred." }); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [retryTrigger]);

  if (loading) return (
    <Layout pageTitle="Dashboard" pageSubtitle="Welcome back. Here's your business overview.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
    </Layout>
  );

  if (error) return (
    <Layout pageTitle="Dashboard" pageSubtitle="Welcome back. Here's your business overview.">
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-gray-800 font-semibold text-lg">Failed to load dashboard</h3>
        <p className="text-sm text-gray-600 mt-2">{error.message}</p>
        {error.status && (
          <span className="mt-3 text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
            Status: {error.status}
          </span>
        )}
        <button
          onClick={() => { setLoading(true); setRetryTrigger((p) => p + 1); }}
          className="mt-6 px-5 py-2.5 text-sm bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </Layout>
  );

  const s = summary!;

  const activityHeaders = ["Event", "Category", "Status", "User", "Date"];
  const activityData = s.recentActivity?.map((e) => [
    e.event,
    e.category,
    <span key={e.createdAt} className="capitalize text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{e.status}</span>,
    e.user,
    new Date(e.createdAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }),
  ]) ?? [];

  return (
    <Layout pageTitle="Dashboard" pageSubtitle="Welcome back. Here's your business overview.">

      {/* ── Needs Attention ─────────────────────────────── */}
      {((s.orders?.pending ?? 0) > 0 || (s.bookings?.pending ?? 0) > 0 || (s.quoteRequests?.pending ?? 0) > 0) && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex flex-wrap gap-3 items-center">
          <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-yellow-800">Needs attention:</span>
          {(s.orders?.pending ?? 0) > 0 && (
            <button onClick={() => navigate("/orders")} className="text-xs px-2.5 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium rounded-full transition-colors">
              {s.orders.pending} pending order{s.orders.pending !== 1 ? "s" : ""}
            </button>
          )}
          {(s.bookings?.pending ?? 0) > 0 && (
            <button onClick={() => navigate("/bookings")} className="text-xs px-2.5 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium rounded-full transition-colors">
              {s.bookings.pending} pending booking{s.bookings.pending !== 1 ? "s" : ""}
            </button>
          )}
          {(s.quoteRequests?.pending ?? 0) > 0 && (
            <button onClick={() => navigate("/quote-requests")} className="text-xs px-2.5 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium rounded-full transition-colors">
              {s.quoteRequests.pending} new quote request{s.quoteRequests.pending !== 1 ? "s" : ""}
            </button>
          )}
          {(s.contacts?.new ?? 0) > 0 && (
            <button onClick={() => navigate("/contact-submissions")} className="text-xs px-2.5 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium rounded-full transition-colors">
              {s.contacts.new} new contact message{s.contacts.new !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      {/* ── Orders & Bookings ─────────────────────────── */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Operations</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Orders"
            value={s.orders?.total}
            sub="pending"
            subValue={s.orders?.pending}
            icon={<ShoppingCart size={18} />}
            accent={s.orders?.pending ? "yellow" : "gray"}
            onClick={() => navigate("/orders")}
          />
          <StatCard
            label="Bookings"
            value={s.bookings?.total}
            sub="pending"
            subValue={s.bookings?.pending}
            icon={<Calendar size={18} />}
            accent={s.bookings?.pending ? "yellow" : "gray"}
            onClick={() => navigate("/bookings")}
          />
          <StatCard
            label="Quote Requests"
            value={s.quoteRequests?.total}
            sub="pending"
            subValue={s.quoteRequests?.pending}
            icon={<MessageSquare size={18} />}
            accent={s.quoteRequests?.pending ? "blue" : "gray"}
            onClick={() => navigate("/quote-requests")}
          />
          <StatCard
            label="Quotes"
            value={s.quotes?.total}
            sub="draft"
            subValue={s.quotes?.draft}
            icon={<FileText size={18} />}
            accent="gray"
            onClick={() => navigate("/quotes")}
          />
        </div>
      </div>

      {/* ── Certifications & Calibrations ─────────────── */}
      <div className="mb-3 mt-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Certifications</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Certificates"
            value={s.certificates?.total}
            sub="expiring soon"
            subValue={s.certificates?.expiringSoon}
            icon={<FileCheck size={18} />}
            accent={s.certificates?.expiringSoon ? "yellow" : "green"}
            onClick={() => navigate("/certifications")}
          />
          <StatCard
            label="Expired Certs"
            value={s.certificates?.expired}
            icon={<AlertTriangle size={18} />}
            accent={s.certificates?.expired ? "red" : "gray"}
            onClick={() => navigate("/certifications?status=expired")}
          />
          <StatCard
            label="Calibrations"
            value={s.calibrations?.total}
            sub="overdue"
            subValue={s.calibrations?.overdue}
            icon={<Clock size={18} />}
            accent={s.calibrations?.overdue ? "red" : "gray"}
          />
          <StatCard
            label="Clients"
            value={s.clients?.total}
            icon={<Users size={18} />}
            accent="blue"
            onClick={() => navigate("/clients")}
          />
        </div>
      </div>

      {/* ── Products & Contacts ────────────────────────── */}
      <div className="mb-8 mt-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Catalogue & Contacts</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Products"
            value={s.products?.total}
            icon={<PackageCheck size={18} />}
            accent="gray"
            onClick={() => navigate("/products")}
          />
          <StatCard
            label="New Messages"
            value={s.contacts?.new}
            icon={<MessageSquare size={18} />}
            accent={s.contacts?.new ? "blue" : "gray"}
            onClick={() => navigate("/contact-submissions")}
          />
        </div>
      </div>

      {/* ── Activity Log ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <SectionHeading title="Recent Activity" />
        {activityData.length > 0 ? (
          <Table headers={activityHeaders} data={activityData} className="w-full" />
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center italic">No recent activity found.</p>
        )}
      </div>

    </Layout>
  );
};

export default DashboardPage;
