import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { Plus, Trash2 } from "lucide-react";
import { createQuote } from "../../../services/quote.jsx";
import { getClients } from "../../../services/client.jsx";
import { getQuoteRequests } from "../../../services/quoteRequests";

interface Client { id: number; name: string; }
interface QuoteRequest { id: number; quoteNumber?: string; customerName: string; customerEmail: string; }
interface LineItem { description: string; quantity: string; unitPrice: string; }

const emptyItem = (): LineItem => ({ description: "", quantity: "1", unitPrice: "" });

const fmtMoney = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const AddQuotePage: React.FC = () => {
  const navigate = useNavigate();

  const [clientId, setClientId] = useState("");
  const [quoteRequestId, setQuoteRequestId] = useState("");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);

  const [clients, setClients] = useState<Client[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getClients({ limit: 100 }).catch(() => ({ data: [] })),
      getQuoteRequests({ page: 1 }).catch(() => ({ data: [] })),
    ]).then(([c, q]) => {
      setClients((c as any).data ?? []);
      setQuoteRequests((q as any).data ?? []);
    });
  }, []);

  const setItem = (idx: number, field: keyof LineItem, value: string) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (idx: number) =>
    setItems((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const subtotal = items.reduce((s, it) => {
    const qty = parseFloat(it.quantity) || 0;
    const price = parseFloat(it.unitPrice) || 0;
    return s + qty * price;
  }, 0);
  const tax = subtotal * 0.075;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validItems = items.filter((it) => it.description.trim() && parseFloat(it.quantity) > 0 && parseFloat(it.unitPrice) > 0);
    if (!validItems.length) {
      setError("Add at least one line item with description, quantity, and unit price.");
      return;
    }

    setSubmitting(true);
    try {
      await createQuote({
        ...(clientId && { clientId: Number(clientId) }),
        ...(quoteRequestId && { quoteRequestId: Number(quoteRequestId) }),
        notes: notes.trim() || undefined,
        description: description.trim() || undefined,
        items: validItems.map((it) => ({
          description: it.description.trim(),
          quantity:    parseFloat(it.quantity),
          unitPrice:   parseFloat(it.unitPrice),
        })),
      });
      navigate("/quotes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save quote.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Add Quote" pageSubtitle="Create a new quotation for a client">
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Info */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Linked Quote Request <span className="text-gray-400 font-normal">(optional)</span></label>
              <select
                value={quoteRequestId}
                onChange={(e) => setQuoteRequestId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">None</option>
                {quoteRequests.map((qr) => (
                  <option key={qr.id} value={String(qr.id)}>
                    {qr.quoteNumber ? `${qr.quoteNumber} — ` : ""}{qr.customerName}
                  </option>
                ))}
              </select>
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
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => setItem(idx, "quantity", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-3">
                  {idx === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price (₦)</label>}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
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

          {/* Totals */}
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
            {submitting ? "Saving..." : "Create Quote"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/quotes")} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default AddQuotePage;
