import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle, Loader2, Save, Wrench, CalendarCheck,
  User, Thermometer, FlaskConical,
  Plus, Trash2, ClipboardCheck, FileText, Info, Link2,
} from "lucide-react";
import { createCalibration } from "../../../services/calibration.jsx";
import { getClients } from "../../../services/client.jsx";

interface Client { id: number; name: string; email?: string; phone?: string; address?: string; location?: string; }

interface MeasurementRow {
  standardValue: string;
  measuredValue: string;
  asFoundValue:  string;
  asLeftValue:   string;
  deviation:     string;
}

const emptyRow = (): MeasurementRow => ({
  standardValue: "", measuredValue: "", asFoundValue: "", asLeftValue: "", deviation: "",
});

const todayISO = () => new Date().toISOString().split("T")[0];

const inputCls =
  "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors";

const SectionHead = ({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
      <Icon size={14} className="text-blue-600" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Req = () => <span className="text-red-500 ml-0.5">*</span>;

const AddCalibrationPage: React.FC = () => {
  const navigate = useNavigate();

  /* ── Core ──────────────────────────────────────────────── */
  const [equipmentName,    setEquipmentName]    = useState("");
  const [serialNumber,     setSerialNumber]      = useState("");
  const [calibrationDate,  setCalibrationDate]  = useState(todayISO());
  const [nextDueDate,      setNextDueDate]       = useState("");
  const [recalibDate,      setRecalibDate]       = useState("");
  const [technician,       setTechnician]        = useState("Daranijo Funminiyi A.");
  const [performedByTitle, setPerformedByTitle]  = useState("Chief Engineer");
  const [location,         setLocation]          = useState("");
  const [serviceType,      setServiceType]       = useState<"calibration" | "maintenance">("calibration");
  const [clientId,         setClientId]          = useState("");

  /* ── Customer ───────────────────────────────────────────── */
  const [customerName,        setCustomerName]        = useState("");
  const [customerCompanyName, setCustomerCompanyName] = useState("");
  const [customerEmail,       setCustomerEmail]       = useState("");
  const [customerPhone,       setCustomerPhone]       = useState("");
  const [customerAddress,     setCustomerAddress]     = useState("");
  const [emailHint,           setEmailHint]           = useState<{ type: "link" | "new"; name?: string } | null>(null);

  /* ── Scale & reference ──────────────────────────────────── */
  const [scale,            setScale]             = useState("");
  const [scaleRange,       setScaleRange]        = useState("");
  const [scaleDivision,    setScaleDivision]     = useState("");
  const [maxScaleError,    setMaxScaleError]     = useState("");
  const [refInst,          setRefInst]           = useState("");
  const [refInstSN,        setRefInstSN]         = useState("");

  /* ── Environmental ──────────────────────────────────────── */
  const [temperature,      setTemperature]       = useState("");
  const [humidity,         setHumidity]          = useState("");

  /* ── Cert meta ──────────────────────────────────────────── */
  const [physExam,         setPhysExam]          = useState(
    "An examination of this Measuring Instrument mentioned above showed no visually apparent flaw and it was suitable for calibration."
  );
  const [tableType,        setTableType]         = useState<"3col" | "4col">("3col");
  const [tableUnit,        setTableUnit]         = useState("cm");
  const [sonLabRef,        setSonLabRef]         = useState("");
  const [wmvCertNo,        setWmvCertNo]         = useState("WMV25054");
  const [notes,            setNotes]             = useState("Certified Okay");

  /* ── Measurements ───────────────────────────────────────── */
  const [measurements,     setMeasurements]      = useState<MeasurementRow[]>([emptyRow(), emptyRow(), emptyRow()]);

  /* ── UI ─────────────────────────────────────────────────── */
  const [clients,          setClients]           = useState<Client[]>([]);
  const [submitting,       setSubmitting]        = useState(false);
  const [error,            setError]             = useState<string | null>(null);
  const [userPickedClient, setUserPickedClient]  = useState(false);
  const emailCheckRef = useRef<string>("");

  useEffect(() => {
    getClients({ limit: 200 }).catch(() => ({ data: [] })).then((res: any) => {
      setClients(res.data ?? []);
    });
  }, []);

  useEffect(() => {
    if (!clientId || !userPickedClient) return;
    const client = clients.find((c) => String(c.id) === clientId);
    if (!client) return;
    setCustomerName(client.name);
    setCustomerEmail(client.email || "");
    setCustomerPhone(client.phone || "");
    const addr = client.address || client.location || "";
    if (addr) setCustomerAddress(addr);
    setEmailHint(null);
  }, [clientId, userPickedClient, clients]);

  const handleEmailBlur = () => {
    const email = customerEmail.trim().toLowerCase();
    if (!email || email === emailCheckRef.current) return;
    emailCheckRef.current = email;
    const match = clients.find((c) => c.email?.toLowerCase() === email);
    if (match) {
      setEmailHint({ type: "link", name: match.name });
      if (!clientId) {
        setClientId(String(match.id));
        setCustomerName((p) => p || match.name);
        setCustomerPhone((p) => p || match.phone || "");
        setCustomerAddress((p) => p || match.address || match.location || "");
      }
    } else {
      setEmailHint({ type: "new" });
    }
  };

  const updateRow = (idx: number, field: keyof MeasurementRow, value: string) =>
    setMeasurements((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  const addRow    = () => setMeasurements((prev) => [...prev, emptyRow()]);
  const removeRow = (idx: number) => setMeasurements((prev) => prev.filter((_, i) => i !== idx));

  /* Dynamic columns based on table type */
  const measureCols: { field: keyof MeasurementRow; label: string }[] =
    tableType === "3col"
      ? [
          { field: "standardValue", label: `Standard Value (${tableUnit || "cm"})` },
          { field: "measuredValue", label: `Measured Value (${tableUnit || "cm"})` },
          { field: "deviation",     label: `Deviation (${tableUnit || "cm"})` },
        ]
      : [
          { field: "standardValue", label: `Standard Value (${tableUnit || "cm"})` },
          { field: "asFoundValue",  label: `As Found (${tableUnit || "cm"})` },
          { field: "asLeftValue",   label: `As Left (${tableUnit || "cm"})` },
          { field: "deviation",     label: `Deviation (${tableUnit || "cm"})` },
        ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!equipmentName.trim()) { setError("Equipment name is required."); return; }
    if (!calibrationDate)       { setError("Calibration date is required."); return; }

    setSubmitting(true);
    try {
      await createCalibration({
        equipmentName:         equipmentName.trim(),
        serialNumber:          serialNumber.trim()        || undefined,
        calibrationDate,
        nextDueDate:           nextDueDate                || undefined,
        recommendedRecalibDate: recalibDate               || undefined,
        technician:            technician.trim()          || undefined,
        performedByTitle:      performedByTitle.trim()    || undefined,
        location:              location.trim()            || undefined,
        notes:                 notes.trim()               || undefined,
        serviceType,
        ...(clientId && { clientId: Number(clientId) }),
        customerName:          customerName.trim()        || undefined,
        customerCompanyName:   customerCompanyName.trim() || undefined,
        customerEmail:         customerEmail.trim()       || undefined,
        customerPhone:         customerPhone.trim()       || undefined,
        customerAddress:       customerAddress.trim()     || undefined,
        scale:                 scale.trim()               || undefined,
        scaleRange:            scaleRange.trim()          || undefined,
        scaleDivision:         scaleDivision.trim()       || undefined,
        maxScaleError:         maxScaleError.trim()       || undefined,
        referenceInstrument:   refInst.trim()             || undefined,
        referenceInstrumentSN: refInstSN.trim()           || undefined,
        temperature:           temperature.trim()         || undefined,
        humidity:              humidity.trim()             || undefined,
        physicalExamText:      physExam.trim()            || undefined,
        tableType,
        tableUnit:             tableUnit.trim()           || "cm",
        sonLabRef:             sonLabRef.trim()           || undefined,
        wmvCertNo:             wmvCertNo.trim()           || undefined,
        measurements: measurements.filter((r) =>
          r.standardValue || r.measuredValue || r.asFoundValue || r.asLeftValue || r.deviation
        ),
      });
      navigate("/calibrations");
    } catch {
      setError("Failed to save calibration record. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      pageTitle="Add Calibration Record"
      pageSubtitle="Enter all calibration details. Once saved, generate the certificate in one click."
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main column ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Equipment */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <SectionHead icon={Wrench} title="Instrument Description" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Equipment Calibrated <Req /></label>
                  <input value={equipmentName} onChange={(e) => setEquipmentName(e.target.value)} className={inputCls} placeholder="e.g. Vernier Caliper" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ID No.</label>
                  <input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className={inputCls} placeholder="e.g. DPT-001" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Equipment Location</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} placeholder="e.g. Lab A" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Scale <Req /></label>
                  <input value={scale} onChange={(e) => setScale(e.target.value)} className={inputCls} placeholder="e.g. Metric" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Scale Range <Req /></label>
                  <input value={scaleRange} onChange={(e) => setScaleRange(e.target.value)} className={inputCls} placeholder="e.g. 0 – 150mm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Scale Division (d) <Req /></label>
                  <input value={scaleDivision} onChange={(e) => setScaleDivision(e.target.value)} className={inputCls} placeholder="e.g. 0.02mm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Max Scale Error Permitted (e) <Req /></label>
                  <input value={maxScaleError} onChange={(e) => setMaxScaleError(e.target.value)} className={inputCls} placeholder="e.g. ±0.05mm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Reference Instrument <Req /></label>
                  <input value={refInst} onChange={(e) => setRefInst(e.target.value)} className={inputCls} placeholder="e.g. Gauge Block Set" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Reference Instrument S/N</label>
                  <input value={refInstSN} onChange={(e) => setRefInstSN(e.target.value)} className={inputCls} placeholder="e.g. SN-20210045" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Service Type <Req /></label>
                  <Select value={serviceType} onValueChange={(v) => setServiceType(v as "calibration" | "maintenance")}>
                    <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calibration">Calibration</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Client</label>
                  <Select value={clientId} onValueChange={(v) => { setClientId(v); setUserPickedClient(true); }}>
                    <SelectTrigger className={inputCls}><SelectValue placeholder="Select existing client…" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <SectionHead icon={User} title="Customer Information" sub="Appears on the certificate. Selecting a client above auto-fills these." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Customer Name <Req /></label>
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputCls} placeholder="Select a client above to auto-fill" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Customer Address <Req /></label>
                  <input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className={inputCls} placeholder="Select a client above to auto-fill" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Company / Organisation Name</label>
                  <input value={customerCompanyName} onChange={(e) => setCustomerCompanyName(e.target.value)} className={inputCls} placeholder="e.g. Lagos Bottling Company Ltd." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Customer Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => { setCustomerEmail(e.target.value); setEmailHint(null); emailCheckRef.current = ""; }}
                    onBlur={handleEmailBlur}
                    className={inputCls}
                    placeholder="e.g. procurement@company.com"
                  />
                  {emailHint && (
                    <p className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${emailHint.type === "link" ? "text-emerald-600" : "text-blue-600"}`}>
                      <Link2 size={11} />
                      {emailHint.type === "link"
                        ? `Will link to existing client: ${emailHint.name}`
                        : "No match found — a new client will be created on save"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Customer Phone</label>
                  <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={inputCls} placeholder="e.g. +234 801 234 5678" />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <SectionHead icon={CalendarCheck} title="Calibration Dates" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Calibration Date <Req /></label>
                  <input type="date" value={calibrationDate} onChange={(e) => setCalibrationDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Next Due Date</label>
                  <input type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Recommended Recalibration Date</label>
                  <input type="date" value={recalibDate} onChange={(e) => setRecalibDate(e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Environmental */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <SectionHead icon={Thermometer} title="Environmental Conditions" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Temperature <Req /></label>
                  <input value={temperature} onChange={(e) => setTemperature(e.target.value)} className={inputCls} placeholder="e.g. 25°C" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Relative Humidity <Req /></label>
                  <input value={humidity} onChange={(e) => setHumidity(e.target.value)} className={inputCls} placeholder="e.g. 60%" />
                </div>
              </div>
            </div>

            {/* Measurement Results */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <SectionHead
                icon={FlaskConical}
                title="Calibration Results"
                sub={tableType === "4col" ? "4-col: As Found = reading before adjustment · As Left = reading after adjustment" : undefined}
              />
              <div className="flex flex-wrap gap-4 mb-5 pb-4 border-b border-gray-50">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Table Type</label>
                  <Select value={tableType} onValueChange={(v) => setTableType(v as "3col" | "4col")}>
                    <SelectTrigger className="w-36 text-sm border border-gray-200 rounded-lg bg-white px-3 py-2.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3col">3 Column</SelectItem>
                      <SelectItem value="4col">4 Column</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Unit</label>
                  <input value={tableUnit} onChange={(e) => setTableUnit(e.target.value)} className="w-24 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" placeholder="cm" />
                </div>
              </div>

              {/* Desktop table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200 max-md:hidden">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {measureCols.map((col) => (
                        <th key={col.field} className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200 last:border-r-0 whitespace-nowrap">{col.label}</th>
                      ))}
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                        {measureCols.map((col) => (
                          <td key={col.field} className="px-3 py-2 border-r border-gray-100 last:border-r-0">
                            <input
                              value={row[col.field]}
                              onChange={(e) => updateRow(idx, col.field, e.target.value)}
                              className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                              placeholder="0.00"
                            />
                          </td>
                        ))}
                        <td className="px-2 py-2 text-center w-10">
                          {measurements.length > 1 && (
                            <button type="button" onClick={() => removeRow(idx)} className="p-1 rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile rows */}
              <div className="md:hidden space-y-3">
                {measurements.map((row, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg p-3 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-500">Reading {idx + 1}</span>
                      {measurements.length > 1 && (
                        <button type="button" onClick={() => removeRow(idx)} className="p-1 text-gray-400 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    {measureCols.map((col) => (
                      <div key={col.field}>
                        <label className="text-xs text-gray-500 block mb-1">{col.label}</label>
                        <input value={row[col.field]} onChange={(e) => updateRow(idx, col.field, e.target.value)} className={inputCls} placeholder="0.00" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <button type="button" onClick={addRow} className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-colors">
                <Plus size={14} /> Add Row
              </button>
            </div>

            {/* Physical Examination */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <SectionHead icon={ClipboardCheck} title="Physical Examination" />
              <Textarea value={physExam} onChange={(e) => setPhysExam(e.target.value)} rows={3} className={inputCls} />
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <SectionHead icon={FileText} title="Additional Information" />
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Comments</label>
                  <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} placeholder="e.g. Certified Okay" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">SON Lab Reference No.</label>
                    <input value={sonLabRef} onChange={(e) => setSonLabRef(e.target.value)} className={inputCls} placeholder="e.g. SON/NMI/L/2019/002" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">WMV Certificate No.</label>
                    <input value={wmvCertNo} onChange={(e) => setWmvCertNo(e.target.value)} className={inputCls} placeholder="e.g. WMV25054" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar ────────────────────────────────────────── */}
          <div className="space-y-5 lg:sticky lg:top-6 self-start">

            {/* Performed By */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <SectionHead icon={User} title="Performed By" />
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Performed By</label>
                  <input value={technician} onChange={(e) => setTechnician(e.target.value)} className={inputCls} placeholder="Engineer name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Title</label>
                  <input value={performedByTitle} onChange={(e) => setPerformedByTitle(e.target.value)} className={inputCls} placeholder="e.g. Chief Engineer" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
              <div className="flex items-start gap-2.5">
                <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  After saving, click <strong>Generate Certificate</strong> on the calibration list to create a ready-to-send certificate with all data pre-filled.
                  <br /><br />
                  Entering a customer email auto-links this record to an existing client, or creates a new one on save.
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-2.5">
                <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {submitting ? "Saving…" : "Save Calibration"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/calibrations")}
                className="w-full px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      </form>
    </Layout>
  );
};

export default AddCalibrationPage;
