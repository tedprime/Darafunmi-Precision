import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { Plus, Trash2, TriangleAlert } from "lucide-react";
import { getQuoteById, updateQuote } from "../../../services/quote.jsx";
import { getClients } from "../../../services/client.jsx";

interface Client { id: number; name: string; }
interface LineItem { id?: number; description: string; quantity: string; unitPrice: string; }

const emptyItem = (): LineItem => ({ description: "", quantity: "1", unitPrice: "" });

const ALL_STATUSES = ["draft", "sent", "accepted", "rejected", "revision_requested"];

const fmtMoney = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const EditQuotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [validUntil, setValidUntil] = useState("");

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getQuoteById(id),
      getClients({ limit: 100 }).catch(() => ({ data: [] })),
    ])
      .then(([quote, c]) => {
        setClientId(quote.clientId ? String(quote.clientId) : "");
        setNotes(quote.notes ?? "");
        setDescription(quote.description ?? "");
        setStatus(quote.status ?? "draft");
        setValidUntil(quote.validUntil ? quote.validUntil.slice(0, 10) : "");
        if (quote.items && quote.items.length > 0) {
          setItems(
            quote.items.map((it: any) => ({
              id: it.id,
              description: it.description ?? "",
              quantity:    String(it.quantity ?? 1),
              unitPrice:   String(it.unitPrice ?? ""),
            }))
          );
        }
        setClients((c as any).data ?? []);
      })
      .catch((err) => setLoadError(err.message ?? "Failed to load quote."))
      .finally(() => setLoading(false));
  }, [id]);

  const setItem = (idx: number, field: keyof LineItem, value: string) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) =>
    setItems((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const subtotal = items.reduce((s, it) => {
    return s + (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0);
  }, 0);
  const tax = subtotal * 0.075;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validItems = items.filter((it) => it.description.trim() && parseFloat(it.quantity) > 0 && parseFloat(it.unitPrice) > 0);
    if (!validItems.length) {
      setError("At least one line item with description, quantity, and unit price is required.");
      return;
    }

    setSubmitting(true);
    try {
      await updateQuote(id, {
        ...(clientId && { clientId: Number(clientId) }),
        notes: notes.trim() || undefined,
        description: description.trim() || undefined,
        status,
        ...(validUntil && { validUntil }),
        items: validItems.map((it) => ({
          ...(it.id && { id: it.id }),
          description: it.description.trim(),
          quantity:    parseFloat(it.quantity),
          unitPrice:   parseFloat(it.unitPrice),
        })),
      });
      navigate("/quotes");
    } catch {
      setError("Failed to update quote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Edit Quote" pageSubtitle="Update quotation details">
      {loading && (
        <Card className="mb-6">
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="grid grid-cols-2 gap-5 mb-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-10 w-full" /></div>
            ))}
          </div>
          <Skeleton className="h-24 w-full mb-5" />
          <Skeleton className="h-5 w-32 mb-3" />
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full mb-2" />)}
        </Card>
      )}

      {!loading && loadError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load quote</p>
          <p className="text-sm text-gray-400 mt-1">{loadError}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Retry</button>
        </div>
      )}

      {!loading && !loadError && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
          )}

          {/* Header */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-5">Quote Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select client (optional)</option>
                  {clients.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">{s.replace("_", " ")}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Overall scope or context for this quote..."
                />
              </div>
            </div>
          </Card>

          {/* Line Items */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Line Items</h3>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-5">
                    {idx === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>}
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => setItem(idx, "description", e.target.value)}
                      placeholder="Service / item description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>}
                    <input
                      type="number" min="1" step="1"
                      value={item.quantity}
                      onChange={(e) => setItem(idx, "quantity", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-3">
                    {idx === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price (₦)</label>}
                    <input
                      type="number" min="0" step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => setItem(idx, "unitPrice", e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-1 text-right text-sm text-gray-600 font-medium" style={{ paddingTop: idx === 0 ? "22px" : "8px" }}>
                    {fmtMoney((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0))}
                  </div>
                  <div className="col-span-1 flex justify-center" style={{ paddingTop: idx === 0 ? "20px" : "6px" }}>
                    <button type="button" onClick={() => removeItem(idx)} disabled={items.length === 1}
                      className="p-1.5 text-red-400 hover:text-red-600 disabled:opacity-30">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={addItem}
              className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
              <Plus size={15} /> Add Item
            </button>

            <div className="mt-6 border-t border-gray-100 pt-5 max-w-xs ml-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-1.5">
                <span>Subtotal</span><span>{fmtMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>VAT (7.5%)</span><span>{fmtMoney(tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-3">
                <span>Total</span><span className="text-blue-700">{fmtMoney(total)}</span>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <h3 className="text-base font-semibold text-gray-800 mb-3">Notes</h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              placeholder="Payment terms, validity period, special conditions..."
            />
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate("/quotes")} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Layout>
  );
};

export default EditQuotePage;
