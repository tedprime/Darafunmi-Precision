import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { confirmDialog } from "../../components/common/confirmDialog";
import {
  TriangleAlert, Trash2, Search, ChevronLeft, ChevronRight,
  Loader2, PenSquare, Send, Clock, Edit,
} from "lucide-react";
import {
  getNewsletterSubscribers, unsubscribeNewsletter,
  getCampaigns, deleteCampaign,
} from "../../../services/newsletter.jsx";
import { toastSuccess, toastError } from "../../../services/useToast";

interface Subscriber {
  id: number;
  email: string;
  name?: string | null;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt?: string | null;
}

interface Campaign {
  id: number;
  subject: string;
  preheader?: string | null;
  status: "draft" | "sent";
  sentAt?: string | null;
  recipientCount?: number;
  createdAt: string;
  createdBy?: { id: number; name: string } | null;
}

const LIMIT = 20;

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

type Tab = "subscribers" | "campaigns";

const NewsletterListPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("subscribers");

  /* ── Subscribers state ─────────────────────────────────────────── */
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subLoading, setSubLoading]   = useState(true);
  const [subError, setSubError]       = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [removingId, setRemovingId]   = useState<number | null>(null);
  const totalPages = Math.ceil(total / LIMIT);

  /* ── Campaigns state ───────────────────────────────────────────── */
  const [campaigns, setCampaigns]     = useState<Campaign[]>([]);
  const [campLoading, setCampLoading] = useState(false);
  const [campError, setCampError]     = useState<string | null>(null);
  const [campTotal, setCampTotal]     = useState(0);
  const [campPage, setCampPage]       = useState(1);
  const [deletingId, setDeletingId]   = useState<number | null>(null);
  const campTotalPages = Math.ceil(campTotal / LIMIT);

  /* ── Load subscribers ──────────────────────────────────────────── */
  const loadSubs = useCallback(() => {
    setSubLoading(true);
    getNewsletterSubscribers({ page, limit: LIMIT, search, isActive: true })
      .then((res: any) => {
        setSubscribers(res.data ?? []);
        setTotal(res.count ?? 0);
        setSubError(null);
      })
      .catch((err: any) => setSubError(err?.message ?? "Failed to load subscribers."))
      .finally(() => setSubLoading(false));
  }, [page, search]);

  useEffect(() => { loadSubs(); }, [loadSubs]);
  useEffect(() => { setPage(1); }, [search]);

  /* ── Load campaigns ────────────────────────────────────────────── */
  const loadCampaigns = useCallback(() => {
    setCampLoading(true);
    getCampaigns({ page: campPage, limit: LIMIT })
      .then((res: any) => {
        setCampaigns(res.data ?? []);
        setCampTotal(res.count ?? 0);
        setCampError(null);
      })
      .catch((err: any) => setCampError(err?.message ?? "Failed to load campaigns."))
      .finally(() => setCampLoading(false));
  }, [campPage]);

  useEffect(() => {
    if (activeTab === "campaigns") loadCampaigns();
  }, [activeTab, loadCampaigns]);

  /* ── Handlers ──────────────────────────────────────────────────── */
  const handleUnsubscribe = async (sub: Subscriber) => {
    if (!(await confirmDialog({
      title: "Remove subscriber?",
      description: `"${sub.email}" will be unsubscribed from the newsletter.`,
      confirmLabel: "Remove",
      variant: "danger",
    }))) return;
    setRemovingId(sub.id);
    try {
      await unsubscribeNewsletter(sub.email);
      toastSuccess(`${sub.email} has been unsubscribed.`);
      if (subscribers.length === 1 && page > 1) setPage((p) => p - 1);
      else loadSubs();
    } catch {
      toastError("Failed to unsubscribe. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleDeleteCampaign = async (c: Campaign) => {
    if (!(await confirmDialog({
      title: "Delete campaign?",
      description: `"${c.subject}" will be permanently deleted.`,
      confirmLabel: "Delete",
      variant: "danger",
    }))) return;
    setDeletingId(c.id);
    try {
      await deleteCampaign(c.id);
      if (campaigns.length === 1 && campPage > 1) setCampPage((p) => p - 1);
      else loadCampaigns();
    } catch (err: any) {
      toastError(err?.message || "Failed to delete campaign.");
    } finally {
      setDeletingId(null);
    }
  };

  const fmt = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <Layout
      pageTitle="Newsletter"
      pageSubtitle={`${total} active subscriber${total !== 1 ? "s" : ""}`}
      action={
        <button
          onClick={() => navigate("/newsletter/compose")}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PenSquare size={15} />
          Compose
        </button>
      }
    >
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        {(["subscribers", "campaigns"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Subscribers tab ── */}
      {activeTab === "subscribers" && (
        <>
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
              />
            </div>
          </div>

          {subLoading && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => <Skeleton key={j} className="h-8" />)}
                </div>
              ))}
            </div>
          )}

          {!subLoading && subError && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
              <p className="text-gray-700 font-medium">Failed to load subscribers</p>
              <p className="text-sm text-gray-400 mt-1">{subError}</p>
              <button onClick={loadSubs} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
            </div>
          )}

          {!subLoading && !subError && (
            <>
              <div className="max-md:hidden bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {subscribers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-12">
                    {search ? "No subscribers match your search." : "No subscribers yet."}
                  </p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50/80 border-b border-gray-100">
                      <tr>
                        {["Name", "Email", "Subscribed On", "Actions"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3.5 text-sm text-gray-700">{sub.name ?? "—"}</td>
                          <td className="px-4 py-3.5 text-sm text-gray-600 break-words">{sub.email}</td>
                          <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{sub.subscribedAt ? fmt(sub.subscribedAt) : "—"}</td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => handleUnsubscribe(sub)}
                              disabled={removingId === sub.id}
                              title="Unsubscribe"
                              className="p-1.5 border border-red-100 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40"
                            >
                              {removingId === sub.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="md:hidden space-y-3">
                {subscribers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-12">
                    {search ? "No subscribers match your search." : "No subscribers yet."}
                  </p>
                ) : subscribers.map((sub) => (
                  <div key={sub.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-900">{sub.name ?? "—"}</p>
                    <p className="text-xs text-gray-500 break-words mt-0.5">{sub.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{sub.subscribedAt ? fmt(sub.subscribedAt) : "—"}</p>
                    <div className="pt-3 mt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleUnsubscribe(sub)}
                        disabled={removingId === sub.id}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
                      >
                        {removingId === sub.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        Unsubscribe
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-5">
                  <p className="text-sm text-gray-500">Page {page} of {totalPages} · {total} subscribers</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronLeft size={16} /></button>
                    <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronRight size={16} /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Campaigns tab ── */}
      {activeTab === "campaigns" && (
        <>
          {campLoading && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => <Skeleton key={j} className="h-10" />)}
                </div>
              ))}
            </div>
          )}

          {!campLoading && campError && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
              <p className="text-gray-700 font-medium">Failed to load campaigns</p>
              <p className="text-sm text-gray-400 mt-1">{campError}</p>
              <button onClick={loadCampaigns} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
            </div>
          )}

          {!campLoading && !campError && (
            <>
              <div className="max-md:hidden bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {campaigns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-sm text-gray-500 mb-3">No campaigns yet.</p>
                    <button
                      onClick={() => navigate("/newsletter/compose")}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PenSquare size={14} />
                      Write your first campaign
                    </button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50/80 border-b border-gray-100">
                      <tr>
                        {["Subject", "Status", "Sent On", "Recipients", "Actions"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {campaigns.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3.5 text-sm font-medium text-gray-800 max-w-xs truncate">{c.subject}</td>
                          <td className="px-4 py-3.5">
                            {c.status === "sent" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                <Send size={11} />Sent
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                <Clock size={11} />Draft
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                            {c.sentAt ? fmt(c.sentAt) : "—"}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">
                            {c.status === "sent" ? (c.recipientCount ?? 0) : "—"}
                          </td>
                          <td className="px-4 py-3.5">
                            {c.status === "draft" ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => navigate(`/newsletter/edit/${c.id}`)}
                                  title="Edit draft"
                                  className="p-1.5 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-md transition-colors"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCampaign(c)}
                                  disabled={deletingId === c.id}
                                  title="Delete draft"
                                  className="p-1.5 border border-red-100 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40"
                                >
                                  {deletingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Mobile campaign cards */}
              <div className="md:hidden space-y-3">
                {campaigns.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-12">No campaigns yet.</p>
                ) : campaigns.map((c) => (
                  <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.subject}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{c.sentAt ? fmt(c.sentAt) : "Draft · not sent"}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${c.status === "sent" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {c.status === "sent" ? "Sent" : "Draft"}
                      </span>
                    </div>
                    {c.status === "draft" && (
                      <div className="pt-3 mt-3 border-t border-gray-100 flex gap-4">
                        <button onClick={() => navigate(`/newsletter/edit/${c.id}`)} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800">
                          <Edit size={12} />Edit
                        </button>
                        <button onClick={() => handleDeleteCampaign(c)} disabled={deletingId === c.id} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 disabled:opacity-40">
                          {deletingId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {campTotalPages > 1 && (
                <div className="flex items-center justify-between mt-5">
                  <p className="text-sm text-gray-500">Page {campPage} of {campTotalPages}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setCampPage((p) => p - 1)} disabled={campPage === 1} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronLeft size={16} /></button>
                    <button onClick={() => setCampPage((p) => p + 1)} disabled={campPage === campTotalPages} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronRight size={16} /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </Layout>
  );
};

export default NewsletterListPage;
