import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { confirmDialog } from "../../components/common/confirmDialog";
import { Plus, Trash2, Search, Edit2, TriangleAlert, Send, Eye, X, RefreshCw, PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getQuotes, deleteQuote, dispatchQuote, getQuoteById, convertQuoteToOrder } from "../../../services/quote.jsx";
import { useToast } from "../../../services/useToast";

interface QuoteItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: string | number;
  totalPrice?: string | number;
}

interface Quote {
  id: number;
  quoteNumber: string;
  client?: { name: string; email?: string } | string;
  clientId?: number;
  quoteRequestId?: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "revision_requested" | string;
  subtotal?: string | number;
  tax?: string | number;
  total?: string | number;
  notes?: string;
  description?: string;
  items?: QuoteItem[];
  createdAt?: string;
  validUntil?: string;
}

const STATUS_COLOR: Record<string, "yellow" | "blue" | "green" | "red" | "gray"> = {
  draft:              "gray",
  sent:               "blue",
  accepted:           "green",
  rejected:           "red",
  revision_requested: "yellow",
  pending:            "yellow",
};

const ALL_STATUSES = ["draft", "sent", "accepted", "rejected", "revision_requested"];

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const fmtMoney = (v?: string | number) =>
  v !== undefined && v !== null
    ? `₦${Number(v).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
    : "—";

const QuoteListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast() as any;

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [count, setCount] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dispatchingId, setDispatchingId] = useState<number | null>(null);
  const [convertingId, setConvertingId] = useState<number | null>(null);

  const [viewQuote, setViewQuote] = useState<Quote | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getQuotes({ search, status })
      .then(({ data, count: c }: any) => {
        setQuotes(data ?? []);
        setCount(c ?? 0);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, status]);

  const handleDelete = async (id: number, quoteNumber: string) => {
    if (!(await confirmDialog({
      title: "Delete quote?",
      description: `Delete quote "${quoteNumber}"?`,
      confirmLabel: "Delete",
    }))) return;
    setDeletingId(id);
    try {
      await deleteQuote(id);
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    } catch {
      alert("Failed to delete quote.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDispatch = async (id: number) => {
    if (!(await confirmDialog({
      title: "Send quote?",
      description: "Send this quote to the customer?",
      confirmLabel: "Send",
      variant: "primary",
    }))) return;
    setDispatchingId(id);
    try {
      await dispatchQuote(id);
      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: "sent" } : q))
      );
    } catch {
      alert("Failed to dispatch quote.");
    } finally {
      setDispatchingId(null);
    }
  };

  const handleView = async (id: number) => {
    setViewLoading(true);
    setViewQuote(null);
    try {
      const data = await getQuoteById(id);
      setViewQuote(data);
    } catch {
      alert("Failed to load quote details.");
    } finally {
      setViewLoading(false);
    }
  };

  const handleConvert = async (id: number, quoteNumber: string) => {
    if (!(await confirmDialog({
      title: "Convert quote?",
      description: `Convert quote ${quoteNumber} to a new order? A pending order will be created from this quote's line items.`,
      confirmLabel: "Convert",
      variant: "primary",
    }))) return;
    setConvertingId(id);
    try {
      const res = await convertQuoteToOrder(id);
      const orderNumber = res?.data?.orderNumber;
      toast?.success?.(`Order ${orderNumber ?? ""} created successfully.`);
    } catch {
      toast?.error?.("Failed to convert quote to order.");
    } finally {
      setConvertingId(null);
    }
  };

  const getClientName = (client: Quote["client"]) => {
    if (!client) return "—";
    if (typeof client === "object") return client.name;
    return client;
  };

  const revisionQuotes = quotes.filter((q) => q.status === "revision_requested");

  return (
    <Layout
      pageTitle="Quotes"
      pageSubtitle={`Manage all quotes.${count ? ` (${count} total)` : ""}`}
      action={
        <Button onClick={() => navigate("/quotes/add")}>
          <Plus size={16} /> Add Quote
        </Button>
      }
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
            placeholder="Search by quote number..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      {/* Revision alert banner */}
      {!loading && !error && revisionQuotes.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <RefreshCw size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {revisionQuotes.length} quote{revisionQuotes.length !== 1 ? "s" : ""} need{revisionQuotes.length === 1 ? "s" : ""} revision
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {revisionQuotes.map((q) => q.quoteNumber).join(", ")} — use <span className="font-semibold">Edit & Re-send</span> to update and re-dispatch.
            </p>
          </div>
          <button
            onClick={() => setStatus("revision_requested")}
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap"
          >
            Filter →
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, j) => <Skeleton key={j} className="h-8" />)}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load quotes</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Desktop Table */}
          <div className="max-md:hidden bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {quotes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No quotes found.</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    {["Quote No", "Client", "Total", "Status", "Date", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {quotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-medium text-gray-700">{quote.quoteNumber}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-normal break-words">{getClientName(quote.client)}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">{fmtMoney(quote.total)}</td>
                      <td className="px-4 py-3.5">
                        <Badge color={STATUS_COLOR[quote.status] ?? "gray"}>{quote.status.replace("_", " ")}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            className="p-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 disabled:opacity-40 transition-colors"
                            onClick={() => handleView(quote.id)}
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                          {quote.status === "revision_requested" ? (
                            <button
                              className="flex items-center gap-1 px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-md disabled:opacity-40"
                              onClick={() => navigate(`/quotes/edit/${quote.id}`)}
                              disabled={deletingId === quote.id}
                              title="Customer requested revision — edit and re-send"
                            >
                              <RefreshCw size={11} /> Edit & Re-send
                            </button>
                          ) : (
                            <button
                              className="p-1.5 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                              onClick={() => navigate(`/quotes/edit/${quote.id}`)}
                              disabled={deletingId === quote.id}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                          {quote.status === "draft" && (
                            <button
                              className="p-1.5 border border-green-200 rounded-md text-green-600 hover:bg-green-50 disabled:opacity-40 transition-colors"
                              onClick={() => handleDispatch(quote.id)}
                              disabled={dispatchingId === quote.id || deletingId === quote.id}
                              title="Send to customer"
                            >
                              {dispatchingId === quote.id
                                ? <span className="w-3.5 h-3.5 border-2 border-green-400/40 border-t-green-600 rounded-full animate-spin block" />
                                : <Send size={14} />
                              }
                            </button>
                          )}
                          {quote.status === "accepted" && (
                            <button
                              className="p-1.5 border border-purple-200 rounded-md text-purple-600 hover:bg-purple-50 disabled:opacity-40 transition-colors"
                              onClick={() => handleConvert(quote.id, quote.quoteNumber)}
                              disabled={convertingId === quote.id || deletingId === quote.id}
                              title="Convert to order"
                            >
                              {convertingId === quote.id
                                ? <span className="w-3.5 h-3.5 border-2 border-purple-400/40 border-t-purple-600 rounded-full animate-spin block" />
                                : <PackagePlus size={14} />
                              }
                            </button>
                          )}
                          <button
                            className="p-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                            onClick={() => handleDelete(quote.id, quote.quoteNumber)}
                            disabled={deletingId === quote.id || dispatchingId === quote.id}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {quotes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No quotes found.</p>
            ) : quotes.map((quote) => (
              <div key={quote.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-semibold text-gray-700">{quote.quoteNumber}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5 break-words">{getClientName(quote.client)}</p>
                  </div>
                  <Badge color={STATUS_COLOR[quote.status] ?? "gray"}>{quote.status.replace("_", " ")}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="font-medium text-gray-800">{fmtMoney(quote.total)}</span>
                  <span>{quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : "—"}</span>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 text-xs"
                    onClick={() => handleView(quote.id)}
                  >
                    <Eye size={12} /> View
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 text-xs"
                    onClick={() => navigate(`/quotes/edit/${quote.id}`)}
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  {quote.status === "draft" && (
                    <button
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-green-200 rounded-md text-green-600 hover:bg-green-50 text-xs disabled:opacity-40"
                      onClick={() => handleDispatch(quote.id)}
                      disabled={dispatchingId === quote.id}
                    >
                      <Send size={12} /> Send
                    </button>
                  )}
                  <button
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 text-xs disabled:opacity-40"
                    onClick={() => handleDelete(quote.id, quote.quoteNumber)}
                    disabled={deletingId === quote.id}
                  >
                    <Trash2 size={12} /> Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── VIEW MODAL ──────────────────────────────────────── */}
      {(viewQuote || viewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Quote Details</h2>
              <button onClick={() => setViewQuote(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6">
              {viewLoading && (
                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</div>
              )}
              {viewQuote && (
                <>
                  {viewQuote.status === "revision_requested" && (
                    <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                      <RefreshCw size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Revision requested</p>
                        <p className="text-xs text-amber-700 mt-0.5">The customer has requested changes. Edit the quote and re-send it.</p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {([
                      ["Quote #",     viewQuote.quoteNumber],
                      ["Status",      viewQuote.status.replace("_", " ")],
                      ["Client",      getClientName(viewQuote.client)],
                      ["Date",        viewQuote.createdAt ? new Date(viewQuote.createdAt).toLocaleDateString() : "—"],
                      ["Valid Until",  viewQuote.validUntil ? new Date(viewQuote.validUntil).toLocaleDateString() : "—"],
                    ] as [string, string][]).map(([label, value]) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                        <p className="text-sm text-gray-800 font-medium mt-0.5 capitalize break-words">{value}</p>
                      </div>
                    ))}
                  </div>

                  {viewQuote.items && viewQuote.items.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Line Items</p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Description</th>
                              <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600">Qty</th>
                              <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600">Unit Price</th>
                              <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {viewQuote.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-800 whitespace-normal break-words">{item.description}</td>
                                <td className="text-center px-3 py-2 text-gray-700">{item.quantity}</td>
                                <td className="text-right px-3 py-2 text-gray-700">{fmtMoney(item.unitPrice)}</td>
                                <td className="text-right px-3 py-2 font-medium text-gray-800">{fmtMoney(item.totalPrice ?? (Number(item.unitPrice) * item.quantity))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-6">
                    {viewQuote.subtotal !== undefined && (
                      <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{fmtMoney(viewQuote.subtotal)}</span></div>
                    )}
                    {viewQuote.tax !== undefined && (
                      <div className="flex justify-between text-sm text-gray-600"><span>VAT (7.5%)</span><span>{fmtMoney(viewQuote.tax)}</span></div>
                    )}
                    <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-blue-700">{fmtMoney(viewQuote.total)}</span>
                    </div>
                  </div>

                  {viewQuote.notes && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Notes</p>
                      <p className="text-sm text-gray-700">{viewQuote.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-3 flex-wrap">
                    {viewQuote.status === "revision_requested" ? (
                      <button
                        onClick={() => { setViewQuote(null); navigate(`/quotes/edit/${viewQuote.id}`); }}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg"
                      >
                        <RefreshCw size={14} /> Edit & Re-send
                      </button>
                    ) : (
                      <button
                        onClick={() => { setViewQuote(null); navigate(`/quotes/edit/${viewQuote.id}`); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                      >
                        <Edit2 size={14} /> Edit Quote
                      </button>
                    )}
                    {viewQuote.status === "draft" && (
                      <button
                        onClick={() => { setViewQuote(null); handleDispatch(viewQuote.id); }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                      >
                        <Send size={14} /> Send to Customer
                      </button>
                    )}
                    {viewQuote.status === "accepted" && (
                      <button
                        onClick={() => { setViewQuote(null); handleConvert(viewQuote.id, viewQuote.quoteNumber); }}
                        disabled={convertingId === viewQuote.id}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                      >
                        <PackagePlus size={14} /> Convert to Order
                      </button>
                    )}
                    <button onClick={() => setViewQuote(null)} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default QuoteListPage;
