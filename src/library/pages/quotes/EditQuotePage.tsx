import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Trash2, TriangleAlert, Loader2, FileText,
  User, Building2, Mail, MapPin, Phone, Link2, Receipt, StickyNote,
} from "lucide-react";
import { getQuoteById, updateQuote } from "../../../services/quote.jsx";
import { getClients } from "../../../services/client.jsx";
import { useToast } from "../../../services/useToast";

interface Client { id: number; name: string; }
interface LineItem { id?: number; description: string; quantity: string; unitPrice: string; }

const emptyItem = (): LineItem => ({ description: "", quantity: "1", unitPrice: "" });

const ALL_STATUSES = ["draft", "sent", "accepted", "rejected", "revision_requested"];

const fmtMoney = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const inputCls =
  "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors";

const Skeleton = ({ className = "", style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} style={style} />
);

const EditQuotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [clientId, setClientId]           = useState("");
  const [notes, setNotes]                 = useState("");
  const [description, setDescription]     = useState("");
  const [status, setStatus]               = useState("draft");
  const [validUntil, setValidUntil]       = useState("");
  const [items, setItems]                 = useState<LineItem[]>([emptyItem()]);
  const [customerName,  setCustomerName]  = useState("");
  const [companyName,   setCompanyName]   = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");

  const [clients, setClients]     = useState<Client[]>([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toast } = useToast();

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
        setCustomerName(quote.customerName    ?? "");
        setCompanyName(quote.companyName      ?? "");
        setCustomerEmail(quote.customerEmail  ?? "");
        setCustomerPhone(quote.customerPhone  ?? "");
        setClientAddress(quote.clientAddress  ?? "");
        if (quote.items && quote.items.length > 0) {
          setItems(
            quote.items.map((it: any) => ({
              id:          it.id,
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

  const setItem = (idx: number, field: keyof LineItem, value: string) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));

  const addItem    = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) =>
    setItems((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const lineTotal = (it: LineItem) => (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0);
  const subtotal  = items.reduce((s, it) => s + lineTotal(it), 0);
  const tax       = subtotal * 0.075;
  const total     = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim())  { toast.error("Contact name is required."); return; }
    if (!companyName.trim())   { toast.error("Company name is required."); return; }
    if (!customerEmail.trim()) { toast.error("Customer email is required."); return; }
    if (!customerPhone.trim()) { toast.error("Customer phone is required."); return; }
    if (!clientAddress.trim()) { toast.error("Address is required."); return; }

    const validItems = items.filter(
      (it) => it.description.trim() && parseFloat(it.quantity) > 0 && parseFloat(it.unitPrice) > 0,
    );
    if (!validItems.length) {
      toast.error("Add at least one line item with a description, quantity, and unit price.");
      return;
    }

    setSubmitting(true);
    try {
      await updateQuote(id, {
        ...(clientId && { clientId: Number(clientId) }),
        customerName:  customerName.trim()  || undefined,
        companyName:   companyName.trim()   || undefined,
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        clientAddress: clientAddress.trim() || undefined,
        notes:         notes.trim()         || undefined,
        description:   description.trim()   || undefined,
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
    } catch (err: any) {
      toast.error(err?.message || "Failed to update quote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Edit Quote" pageSubtitle="Update quotation details">

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {[180, 220, 300, 120].map((h, i) => <Skeleton key={i} className={`h-[${h}px]`} style={{ height: h }} />)}
          </div>
          <div className="space-y-5">
            <Skeleton className="h-40" />
            <Skeleton className="h-28" />
          </div>
        </div>
      )}

      {/* Load error */}
      {!loading && loadError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load quote</p>
          <p className="text-sm text-gray-400 mt-1">{loadError}</p>
          <button onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retry
          </button>
        </div>
      )}

      {!loading && !loadError && (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ── Main column ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Quote Details */}
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FileText size={14} className="text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Quote Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Client */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                      <User size={12} className="text-gray-400" />
                      Client
                      <span className="text-gray-400 font-normal ml-0.5">— optional</span>
                    </label>
                    <select
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className={inputCls}
                    >
                      <option value="">No client</option>
                      {clients.map((c) => (
                        <option key={c.id} value={String(c.id)}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                      <Link2 size={12} className="text-gray-400" />
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={inputCls}
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>

                  {/* Valid Until */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Valid Until
                      <span className="text-gray-400 font-normal ml-1">— optional</span>
                    </label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className={inputCls}
                    />
                  </div>

                  {/* Service Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Service Type
                      <span className="text-gray-400 font-normal ml-1">— used in PDF heading</span>
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Calibration, Maintenance, Repair…"
                      className={inputCls}
                    />
                  </div>
                </div>
              </section>

              {/* Recipient Details */}
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                    <User size={14} className="text-purple-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Recipient Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                      <User size={12} className="text-gray-400" />
                      Contact Name <span className="text-red-400 ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                      <Building2 size={12} className="text-gray-400" />
                      Company Name <span className="text-red-400 ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Corp Ltd."
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                      <Mail size={12} className="text-gray-400" />
                      Email <span className="text-red-400 ml-0.5">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                      <Phone size={12} className="text-gray-400" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. +234 801 234 5678"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                      <MapPin size={12} className="text-gray-400" />
                      Address <span className="text-red-400 ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="Street, City, State"
                      className={inputCls}
                    />
                  </div>
                </div>
              </section>

              {/* Line Items */}
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Receipt size={14} className="text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Line Items</h3>
                  <span className="ml-auto text-xs text-gray-400">{items.length} item{items.length !== 1 ? "s" : ""}</span>
                </div>

                {/* Column headers — desktop */}
                <div className="hidden sm:grid grid-cols-[1fr_80px_120px_100px_36px] gap-3 mb-2 px-1">
                  <span className="text-xs font-medium text-gray-400">Description</span>
                  <span className="text-xs font-medium text-gray-400 text-center">Qty</span>
                  <span className="text-xs font-medium text-gray-400">Unit Price (₦)</span>
                  <span className="text-xs font-medium text-gray-400 text-right">Total</span>
                  <span />
                </div>

                <div className="space-y-2.5">
                  {items.map((item, idx) => (
                    <div key={idx} className="group relative">
                      {/* Desktop row */}
                      <div className="hidden sm:grid grid-cols-[1fr_80px_120px_100px_36px] gap-3 items-center">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => setItem(idx, "description", e.target.value)}
                          placeholder="Service or item description"
                          className={inputCls}
                        />
                        <input
                          type="number" min="1" step="1"
                          value={item.quantity}
                          onChange={(e) => setItem(idx, "quantity", e.target.value)}
                          className={`${inputCls} text-center`}
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none select-none">₦</span>
                          <input
                            type="number" min="0" step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => setItem(idx, "unitPrice", e.target.value)}
                            placeholder="0.00"
                            className={`${inputCls} pl-6`}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 text-right pr-1 tabular-nums">
                          {fmtMoney(lineTotal(item))}
                        </span>
                        <button
                          type="button" onClick={() => removeItem(idx)} disabled={items.length === 1}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-0 disabled:pointer-events-none transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Mobile card */}
                      <div className="sm:hidden bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Item {idx + 1}</span>
                          <button
                            type="button" onClick={() => removeItem(idx)} disabled={items.length === 1}
                            className="p-1 rounded text-gray-300 hover:text-red-400 disabled:opacity-0 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                            <input type="text" value={item.description}
                              onChange={(e) => setItem(idx, "description", e.target.value)}
                              placeholder="Service or item" className={inputCls} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                              <input type="number" min="1" step="1" value={item.quantity}
                                onChange={(e) => setItem(idx, "quantity", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price (₦)</label>
                              <input type="number" min="0" step="0.01" value={item.unitPrice}
                                onChange={(e) => setItem(idx, "unitPrice", e.target.value)}
                                placeholder="0.00" className={inputCls} />
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-xs text-gray-400">Line total</span>
                            <span className="text-sm font-semibold text-gray-800 tabular-nums">{fmtMoney(lineTotal(item))}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add item */}
                <button type="button" onClick={addItem}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-colors">
                  <Plus size={15} /> Add Line Item
                </button>

                {/* Totals — desktop */}
                <div className="hidden sm:block mt-6 pt-5 border-t border-gray-100">
                  <div className="max-w-xs ml-auto space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span><span className="tabular-nums">{fmtMoney(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>VAT (7.5%)</span><span className="tabular-nums">{fmtMoney(tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-gray-900 pt-2 border-t border-gray-200">
                      <span>Total</span><span className="tabular-nums text-blue-700">{fmtMoney(total)}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Notes */}
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <StickyNote size={14} className="text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Notes</h3>
                  <span className="text-xs text-gray-400 font-normal ml-0.5">— optional</span>
                </div>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment terms, validity period, special conditions…"
                  className="resize-none text-sm min-h-[96px]"
                />
              </section>
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-5 lg:sticky lg:top-6">

              {/* Mobile totals */}
              <div className="sm:hidden bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Summary</p>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span><span className="tabular-nums">{fmtMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>VAT (7.5%)</span><span className="tabular-nums">{fmtMoney(tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 pt-2.5 border-t border-gray-100">
                    <span>Total</span><span className="tabular-nums text-blue-700 text-base">{fmtMoney(total)}</span>
                  </div>
                </div>
              </div>

              {/* Desktop summary */}
              <div className="hidden sm:block bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Summary</p>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span><span className="tabular-nums">{fmtMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>VAT (7.5%)</span><span className="tabular-nums">{fmtMoney(tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 pt-2.5 border-t border-gray-100">
                    <span>Total</span><span className="tabular-nums text-blue-700 text-lg">{fmtMoney(total)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                <button
                  type="submit" disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {submitting
                    ? <><Loader2 size={15} className="animate-spin" />Saving…</>
                    : <><FileText size={15} />Save Changes</>
                  }
                </button>
                <button
                  type="button" onClick={() => navigate("/quotes")} disabled={submitting}
                  className="w-full px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center px-2">
                Changes are saved as a draft until you dispatch the quote.
              </p>
            </div>
          </div>
        </form>
      )}
    </Layout>
  );
};

export default EditQuotePage;
