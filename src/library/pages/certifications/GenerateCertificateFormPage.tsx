import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Download,
  Eye,
  Send,
  Save,
  Loader2,
  User,
  Wrench,
  Thermometer,
  FlaskConical,
  Info,
  Hash,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../../services/useToast";
import { getClients } from "../../../services/client.jsx";
import {
  createCertification,
  updateCertification,
  generatePdf,
  getCertification,
  sendCertificateEmail,
} from "../../../services/certification.jsx";

type TableType = "3col" | "4col";
type ActiveTab = "form" | "preview";

interface CalibrationRow {
  standardValue: string;
  measuredValue: string;
  asFoundValue: string;
  asLeftValue: string;
  deviation: string;
}

const emptyRow = (): CalibrationRow => ({
  standardValue: "",
  measuredValue: "",
  asFoundValue: "",
  asLeftValue: "",
  deviation: "",
});

/* ── Style tokens for certificate preview ── */
const BLACK  = "#111111";
const MAROON = "#8B3A3A";
const FONT   = "Arial, Helvetica, sans-serif";

const s = {
  page:        { maxWidth: 760, margin: "0 auto", background: "#fff", border: "1px solid #d8d8d8", boxShadow: "0 2px 12px rgba(0,0,0,.15)", fontFamily: FONT, fontSize: 12.5, color: BLACK, lineHeight: 1.3 } as React.CSSProperties,
  header:      { padding: "14px 18px 6px" } as React.CSSProperties,
  headerInner: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 } as React.CSSProperties,
  logoWrap:    { display: "flex", alignItems: "flex-start", gap: 8, flexShrink: 0 } as React.CSSProperties,
  logoImage:   { display: "block", width: 525, maxWidth: "100%", height: "auto" } as React.CSSProperties,
  addrBlock:   { textAlign: "left" as const, fontSize: 8, fontWeight: 800, color: BLACK, lineHeight: 1.55, flexShrink: 0, paddingTop: 4 },
  contentFrame:{ margin: "4px 18px 0", border: "1.5px solid #8B3A3A" } as React.CSSProperties,
  titleBox:    { padding: "10px 10px 84px", textAlign: "center" as const } as React.CSSProperties,
  titleText:   { fontFamily: "'Brush Script MT', 'Segoe Script', 'URW Chancery L', cursive", fontSize: 28, color: MAROON, fontWeight: "normal" as const, borderBottom: "1.5px solid #8B3A3A", padding: "0 42px 2px" } as React.CSSProperties,
  body:        { padding: "0 44px 18px" } as React.CSSProperties,
  section:     { marginBottom: 9 },
  sectionHead: { fontWeight: 700, textDecoration: "underline", color: BLACK, fontSize: 15, margin: "0 0 2px" } as React.CSSProperties,
  bold:        { fontWeight: 700, color: BLACK } as React.CSSProperties,
  eqRow:       { display: "flex", alignItems: "baseline", marginBottom: 6 } as React.CSSProperties,
  eqLabel:     { fontWeight: 700, color: BLACK, minWidth: 250, flexShrink: 0, fontSize: 15 } as React.CSSProperties,
  eqValue:     { fontWeight: 700, color: BLACK, fontSize: 15 } as React.CSSProperties,
  inlineRow:   { display: "flex", justifyContent: "space-between", gap: 22, marginBottom: 7, fontSize: 14 } as React.CSSProperties,
  table:       { width: "100%", borderCollapse: "collapse" as const, border: "1.5px solid #222", marginTop: 8 } as React.CSSProperties,
  th:          { border: "1.5px solid #222", padding: "8px 8px", textAlign: "center" as const, fontWeight: 700, fontSize: 15, backgroundColor: "#fff", color: BLACK } as React.CSSProperties,
  td:          { border: "1.5px solid #222", padding: "8px 8px", textAlign: "center" as const, fontWeight: 700, fontSize: 15, backgroundColor: "#fff", color: BLACK } as React.CSSProperties,
  bulletWrap:  { display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" } as React.CSSProperties,
  bulletArrow: { flexShrink: 0, fontWeight: 700, fontSize: 15, color: BLACK, lineHeight: 1.4 },
  bulletText:  { margin: 0, textAlign: "justify" as const, lineHeight: 1.4, fontWeight: 700 } as React.CSSProperties,
  bottomRow:   { paddingTop: 16, marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 } as React.CSSProperties,
  stampBox:    { textAlign: "center" as const, minWidth: 240 } as React.CSSProperties,
  stampImage:  { display: "block", width: 240, maxWidth: "100%", height: "auto", margin: "0 auto" } as React.CSSProperties,
  footer:      { backgroundColor: "#fff", padding: "6px 18px 10px", textAlign: "center" as const, fontSize: 9, fontWeight: 700, color: BLACK, lineHeight: 1.7 } as React.CSSProperties,
};

/* ── Shared input class ── */
const inputCls =
  "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors";

/* ── Section header helper ── */
const SectionHead = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children?: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
      <Icon size={14} className="text-blue-600" />
    </div>
    <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    {children}
  </div>
);

const Req = () => <span className="text-red-500 ml-0.5">*</span>;

const GenerateCertificateFormPage: React.FC = () => {
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();

  const editId     = searchParams.get("id") ? Number(searchParams.get("id")) : null;
  const isEditMode = editId !== null;

  const [activeTab,    setActiveTab]    = useState<ActiveTab>(() =>
    searchParams.get("tab") === "preview" ? "preview" : "form"
  );
  const [loadingCert, setLoadingCert] = useState(isEditMode);

  const [certNo,          setCertNo]          = useState("");
  const [calDate,         setCalDate]         = useState("");
  const [custName,        setCustName]        = useState("");
  const [custCompany,     setCustCompany]     = useState("");
  const [custEmail,       setCustEmail]       = useState("");
  const [custPhone,       setCustPhone]       = useState("");
  const [custAddress,     setCustAddress]     = useState("");
  const [equipCalibrated, setEquipCalibrated] = useState("");
  const [equipLocation,   setEquipLocation]   = useState("");
  const [idNo,            setIdNo]            = useState("");
  const [scale,           setScale]           = useState("");
  const [scaleRange,      setScaleRange]      = useState("");
  const [scaleDiv,        setScaleDiv]        = useState("");
  const [maxError,        setMaxError]        = useState("");
  const [refInst,         setRefInst]         = useState("");
  const [refInstSn,       setRefInstSn]       = useState("");
  const [temp,            setTemp]            = useState("");
  const [humidity,        setHumidity]        = useState("");
  const [physExam,        setPhysExam]        = useState("An examination of this Measuring Instrument mentioned above showed no visually apparent flaw and it was suitable for calibration.");
  const [tableType,       setTableType]       = useState<TableType>("3col");
  const [tableUnit,       setTableUnit]       = useState("cm");
  const [rows,            setRows]            = useState<CalibrationRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [comments,        setComments]        = useState("Certified Okay");
  const [sonLabRef,       setSonLabRef]       = useState("");
  const [wmvCertNo,       setWmvCertNo]       = useState("WMV25054");
  const [perfBy,          setPerfBy]          = useState("Daranijo Funminiyi A.");
  const [perfTitle,       setPerfTitle]       = useState("Chief Engineer");
  const [recDate,         setRecDate]         = useState("");
  const [expDate,         setExpDate]         = useState("");
  const [status,          setStatus]          = useState("draft");
  const [serviceType,     setServiceType]     = useState<"calibration" | "maintenance" | "">("");
  const [clientId,        setClientId]        = useState("");
  const [clients,         setClients]         = useState<{ id: number; name: string; email?: string; phone?: string; address?: string; location?: string }[]>([]);

  const { toast } = useToast() as { toast: { error: (msg: string) => void; success: (msg: string) => void; info: (msg: string) => void } };
  const [savedId,       setSavedId]       = useState<number | null>(editId);
  const [submitting,    setSubmitting]    = useState(false);
  const [downloading,   setDownloading]  = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTo,       setEmailTo]       = useState("");
  const [sending,       setSending]       = useState(false);
  const [userPickedClient, setUserPickedClient] = useState(false);

  useEffect(() => {
    getClients({ limit: 200 })
      .then(({ data }: any) => setClients(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!clientId || !userPickedClient) return;
    const client = clients.find((c) => String(c.id) === clientId);
    if (!client) return;
    setCustName(client.name);
    if ((client as any).email)   setCustEmail((client as any).email);
    if ((client as any).phone)   setCustPhone((client as any).phone);
    const addr = client.address || client.location || "";
    if (addr) setCustAddress(addr);
  }, [clientId, userPickedClient, clients]);

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    getCertification(editId)
      .then((cert: any) => {
        if (cancelled) return;
        const d = cert?.data ?? cert;
        const str = (v: unknown) => (v != null ? String(v) : "");
        setCertNo(str(d.certificateNumber));
        setCalDate(d.calibrationDate ? str(d.calibrationDate).slice(0, 10) : "");
        setCustName(str(d.customerName));
        setCustCompany(str(d.customerCompanyName));
        setCustEmail(str(d.customerEmail));
        setCustPhone(str(d.customerPhone));
        setCustAddress(str(d.customerAddress));
        setEquipCalibrated(str(d.equipmentCalibrated));
        setEquipLocation(str(d.equipmentLocation));
        setIdNo(str(d.identificationNo));
        setScale(str(d.scale));
        setScaleRange(str(d.scaleRange));
        setScaleDiv(str(d.scaleDivision));
        setMaxError(str(d.maxScaleError));
        setRefInst(str(d.referenceInstrument));
        setRefInstSn(str(d.referenceInstrumentSN));
        setTemp(str(d.temperature));
        setHumidity(str(d.humidity));
        setPhysExam(str(d.physicalExamText));
        setTableType((d.tableType as TableType) ?? "3col");
        setTableUnit(str(d.tableUnit) || "cm");
        const rawRows = d.calibrationResults;
        setRows(
          Array.isArray(rawRows) && rawRows.length > 0
            ? rawRows.map((r: any) => ({
                standardValue: str(r.standardValue),
                measuredValue: str(r.measuredValue),
                asFoundValue:  str(r.asFoundValue),
                asLeftValue:   str(r.asLeftValue),
                deviation:     str(r.deviation),
              }))
            : [emptyRow(), emptyRow(), emptyRow()]
        );
        setComments(str(d.comments) || "Certified Okay");
        setSonLabRef(str(d.sonLabRef));
        setWmvCertNo(str(d.wmvCertNo) || "WMV25054");
        setPerfBy(str(d.performedBy) || "Daranijo Funminiyi A.");
        setPerfTitle(str(d.performedByTitle) || "Chief Engineer");
        setRecDate(d.recommendedRecalibDate ? str(d.recommendedRecalibDate).slice(0, 10) : "");
        setExpDate(d.expiryDate ? str(d.expiryDate).slice(0, 10) : "");
        setStatus(str(d.status) || "draft");
        setServiceType((d.serviceType as "calibration" | "maintenance" | "") ?? "");
        setClientId(d.clientId ? str(d.clientId) : "");
        setSavedId(typeof d.id === "number" ? d.id : editId);
      })
      .catch(() => { if (!cancelled) toast.error("Failed to load certificate."); })
      .finally(() => { if (!cancelled) setLoadingCert(false); });
    return () => { cancelled = true; };
  }, [editId, toast]);

  const addRow    = () => setRows((r) => [...r, emptyRow()]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof CalibrationRow, val: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  const buildCalibrationResults = () =>
    rows.filter((r) => r.standardValue || r.measuredValue || r.deviation).map((r) => ({ ...r }));

  const buildPayload = () => {
    const clientIdNum = clientId.trim() ? Number(clientId) : undefined;
    return {
      ...(clientIdNum !== undefined && { clientId: clientIdNum }),
      customerName:          custName.trim(),
      customerCompanyName:   custCompany.trim()  || undefined,
      customerEmail:         custEmail.trim()    || undefined,
      customerPhone:         custPhone.trim()    || undefined,
      customerAddress:       custAddress.trim(),
      equipmentCalibrated:   equipCalibrated.trim(),
      equipmentLocation:     equipLocation.trim(),
      identificationNo:      idNo.trim(),
      scale:                 scale.trim(),
      scaleRange:            scaleRange.trim(),
      scaleDivision:         scaleDiv.trim(),
      maxScaleError:         maxError.trim(),
      referenceInstrument:   refInst.trim(),
      referenceInstrumentSN: refInstSn.trim(),
      temperature:           temp.trim(),
      humidity:              humidity.trim(),
      tableType,
      tableUnit,
      physicalExamText:      physExam.trim(),
      sonLabRef:             sonLabRef.trim(),
      wmvCertNo:             wmvCertNo.trim(),
      comments:              comments.trim(),
      performedBy:           perfBy.trim(),
      performedByTitle:      perfTitle.trim(),
      calibrationDate:       calDate   || undefined,
      recommendedRecalibDate: recDate  || undefined,
      expiryDate:            expDate   || undefined,
      status,
      ...(serviceType && { serviceType }),
      calibrationResults: buildCalibrationResults(),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!serviceType)             missing.push("Service Type");
    if (!calDate)                 missing.push("Calibration Date");
    if (!custName.trim())         missing.push("Customer Name");
    if (!custCompany.trim())      missing.push("Company Name");
    if (!custEmail.trim())        missing.push("Customer Email");
    if (!custPhone.trim())        missing.push("Customer Phone");
    if (!custAddress.trim())      missing.push("Customer Address");
    if (!equipCalibrated.trim())  missing.push("Equipment Calibrated");
    if (!equipLocation.trim())    missing.push("Equipment Location");
    if (!idNo.trim())             missing.push("ID No.");
    if (!scale.trim())            missing.push("Scale");
    if (!scaleRange.trim())       missing.push("Scale Range");
    if (!scaleDiv.trim())         missing.push("Scale Division");
    if (!maxError.trim())         missing.push("Max Scale Error Permitted");
    if (!refInst.trim())          missing.push("Reference Instrument");
    if (!temp.trim())             missing.push("Temperature");
    if (!humidity.trim())         missing.push("Relative Humidity");
    if (!expDate)                 missing.push("Expiry Date");
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}.`);
      return;
    }
    if (buildCalibrationResults().length === 0) {
      toast.error("Add at least one calibration result row with a standard value.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPayload();
      if (isEditMode && savedId) {
        const res = await updateCertification(savedId, payload);
        setSavedId(res?.data?.id ?? savedId);
      } else {
        const res = await createCertification(payload);
        setSavedId(res?.data?.id ?? null);
      }
      navigate("/certifications");
    } catch (err) {
      toast.error((err as any)?.message ||`Failed to ${isEditMode ? "update" : "create"} certificate.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!savedId) return;
    setDownloading(true);
    try {
      const result  = await generatePdf(savedId);
      const pdfUrl  = result?.pdfUrl;
      if (!pdfUrl) throw new Error("No PDF URL returned from server.");
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error("Failed to fetch PDF.");
      const blob    = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a       = document.createElement("a");
      a.href        = blobUrl;
      a.download    = `${certNo || `certificate-${savedId}`}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toast.error((err as any)?.message ||"Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const openEmailModal = () => {
    const client = clients.find((c) => String(c.id) === clientId);
    setEmailTo(client?.email ?? "");
    setEmailModalOpen(true);
  };

  const handleSendEmail = async () => {
    if (!savedId) return;
    if (!emailTo.trim()) { toast.error("Please enter a recipient email address."); return; }
    setSending(true);
    try {
      await sendCertificateEmail(savedId, emailTo.trim());
      toast.success("Certificate emailed successfully.");
      setEmailModalOpen(false);
    } catch (err) {
      toast.error((err as any)?.message ||"Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  const previewData = {
    certificateNumber: certNo, calibrationDate: calDate, recommendedRecalibDate: recDate,
    customerName: custName, customerCompanyName: custCompany, customerEmail: custEmail, customerPhone: custPhone, customerAddress: custAddress, equipCalibrated,
    equipmentLocation: equipLocation, identificationNo: idNo, scale, scaleRange,
    scaleDivision: scaleDiv, maxScaleError: maxError, referenceInstrument: refInst,
    referenceInstrumentSN: refInstSn, temperature: temp, humidity, physicalExamText: physExam,
    tableType, tableUnit, calibrationResults: buildCalibrationResults(),
    comments, sonLabRef, wmvCertNo, performedBy: perfBy, performedByTitle: perfTitle,
  };

  const hasPreviewData = !!certNo.trim();
  const d   = previewData;
  const is4 = d.tableType === "4col";
  const unit = d.tableUnit ?? "cm";
  const addressLines = d.customerAddress?.split("\n") ?? [];

  const pageTitle    = isEditMode ? "Edit Certificate" : "Generate Certificate";
  const pageSubtitle = isEditMode
    ? `Editing ${certNo || `certificate #${editId}`}`
    : "Select a client and service type — the certificate number is auto-generated.";
  const submitLabel  = isEditMode ? "Save Changes" : "Save Certificate";

  return (
    <Layout pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      {loadingCert ? (
        <div className="flex items-center justify-center gap-3 py-24 text-sm text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          Loading certificate…
        </div>
      ) : (
        <>
          {/* ── Tab bar ── */}
          <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
            {(["form", "preview"] as ActiveTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
                  activeTab === t
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t === "form" ? "Form" : "Preview"}
              </button>
            ))}
          </div>

          {/* ══ FORM TAB ══ */}
          {activeTab === "form" && (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* ── Main column ── */}
                <div className="flex-1 min-w-0 space-y-5">

                  {/* Certificate Information */}
                  <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <SectionHead icon={Hash} title="Certificate Information">
                      {!isEditMode && (
                        <span className="ml-auto text-xs text-gray-400">
                          Cert number auto-generated from client + service type
                        </span>
                      )}
                    </SectionHead>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Client <Req />
                        </label>
                        <Select
                          value={clientId || "none"}
                          onValueChange={(v) => { setClientId(v === "none" ? "" : v); setUserPickedClient(true); }}
                        >
                          <SelectTrigger className="w-full h-10 text-sm border-gray-200 rounded-lg">
                            <SelectValue placeholder="Select a client…" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select a client</SelectItem>
                            {clients.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Service Type <Req />
                        </label>
                        <Select
                          value={serviceType || "none"}
                          onValueChange={(v) => setServiceType(v === "none" ? "" : v as "calibration" | "maintenance")}
                        >
                          <SelectTrigger className="w-full h-10 text-sm border-gray-200 rounded-lg">
                            <SelectValue placeholder="Select type…" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select type</SelectItem>
                            <SelectItem value="calibration">Calibration</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Calibration Date <Req />
                        </label>
                        <input
                          type="date"
                          value={calDate}
                          onChange={(e) => setCalDate(e.target.value)}
                          className={inputCls}
                        />
                      </div>

                      {isEditMode && certNo && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Certificate Number</label>
                          <div className="px-3.5 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm font-mono text-gray-700 select-all">
                            {certNo}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Customer Information */}
                  <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <SectionHead icon={User} title="Customer Information">
                      {userPickedClient && clientId && (
                        <span className="ml-auto text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Auto-filled from client
                        </span>
                      )}
                    </SectionHead>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Customer Name <Req />
                        </label>
                        <input
                          type="text"
                          placeholder="Select a client above to auto-fill"
                          value={custName}
                          onChange={(e) => setCustName(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Company / Organisation Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Lagos Bottling Company Ltd."
                          value={custCompany}
                          onChange={(e) => setCustCompany(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Customer Email
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. procurement@company.com"
                          value={custEmail}
                          onChange={(e) => setCustEmail(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Customer Phone
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. +234 801 234 5678"
                          value={custPhone}
                          onChange={(e) => setCustPhone(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Customer Address <Req />
                        </label>
                        <input
                          type="text"
                          placeholder="Select a client above to auto-fill"
                          value={custAddress}
                          onChange={(e) => setCustAddress(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Instrument Description */}
                  <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <SectionHead icon={Wrench} title="Instrument Description" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {[
                        { label: "Equipment Calibrated", req: true,  val: equipCalibrated, set: setEquipCalibrated, ph: "e.g. Vernier Caliper" },
                        { label: "Equipment Location",   req: true,  val: equipLocation,   set: setEquipLocation,   ph: "e.g. Lab A" },
                        { label: "ID No.",               req: true,  val: idNo,            set: setIdNo,            ph: "e.g. DPT-001" },
                        { label: "Scale",                req: true,  val: scale,           set: setScale,           ph: "e.g. Metric" },
                        { label: "Scale Range",          req: true,  val: scaleRange,      set: setScaleRange,      ph: "e.g. 0 – 150mm" },
                        { label: "Scale Division",       req: true,  val: scaleDiv,        set: setScaleDiv,        ph: "e.g. 0.02mm" },
                        { label: "Max Scale Error Permitted", req: true,  val: maxError,    set: setMaxError,       ph: "e.g. ±0.05mm" },
                        { label: "Reference Instrument", req: true,  val: refInst,         set: setRefInst,         ph: "e.g. Gauge Block Set" },
                        { label: "Reference Instrument S/N", req: false, val: refInstSn,   set: setRefInstSn,       ph: "e.g. SN-20210045" },
                      ].map(({ label, req, val, set, ph }) => (
                        <div key={label}>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            {label} {req && <Req />}
                          </label>
                          <input
                            type="text"
                            placeholder={ph}
                            value={val}
                            onChange={(e) => set(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Environmental Conditions */}
                  <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <SectionHead icon={Thermometer} title="Environmental Conditions" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Temperature <Req /></label>
                        <input type="text" placeholder="e.g. 25°C" value={temp} onChange={(e) => setTemp(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Relative Humidity <Req /></label>
                        <input type="text" placeholder="e.g. 60%" value={humidity} onChange={(e) => setHumidity(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                  </section>

                  {/* Physical Examination */}
                  <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <SectionHead icon={ClipboardCheck} title="Physical Examination" />
                    <Textarea
                      value={physExam}
                      onChange={(e) => setPhysExam(e.target.value)}
                      className="resize-none text-sm min-h-[80px]"
                    />
                  </section>

                  {/* Calibration Results */}
                  <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <SectionHead icon={FlaskConical} title="Calibration Results" />

                    {/* Table config */}
                    <div className="flex flex-wrap gap-4 mb-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Table Type</label>
                        <Select value={tableType} onValueChange={(v) => setTableType(v as TableType)}>
                          <SelectTrigger className="h-9 text-sm border-gray-200 rounded-lg w-36">
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
                        <input
                          type="text"
                          value={tableUnit}
                          onChange={(e) => setTableUnit(e.target.value)}
                          placeholder="cm"
                          className="w-24 px-3.5 py-2 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Table — horizontal scroll on mobile only */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full border-collapse text-sm min-w-[480px]">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200">
                              Standard Value ({tableUnit})
                            </th>
                            {tableType === "3col" ? (
                              <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200">
                                Measured Value ({tableUnit})
                              </th>
                            ) : (
                              <>
                                <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200">
                                  As Found ({tableUnit})
                                </th>
                                <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200">
                                  As Left ({tableUnit})
                                </th>
                              </>
                            )}
                            <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200">
                              Deviation ({tableUnit})
                            </th>
                            <th className="w-10" />
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, i) => (
                            <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                              <td className="px-3 py-2 border-r border-gray-100">
                                <input type="text" value={row.standardValue} onChange={(e) => updateRow(i, "standardValue", e.target.value)}
                                  className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors" placeholder="0.00" />
                              </td>
                              {tableType === "3col" ? (
                                <td className="px-3 py-2 border-r border-gray-100">
                                  <input type="text" value={row.measuredValue} onChange={(e) => updateRow(i, "measuredValue", e.target.value)}
                                    className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors" placeholder="0.00" />
                                </td>
                              ) : (
                                <>
                                  <td className="px-3 py-2 border-r border-gray-100">
                                    <input type="text" value={row.asFoundValue} onChange={(e) => updateRow(i, "asFoundValue", e.target.value)}
                                      className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors" placeholder="0.00" />
                                  </td>
                                  <td className="px-3 py-2 border-r border-gray-100">
                                    <input type="text" value={row.asLeftValue} onChange={(e) => updateRow(i, "asLeftValue", e.target.value)}
                                      className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors" placeholder="0.00" />
                                  </td>
                                </>
                              )}
                              <td className="px-3 py-2 border-r border-gray-100">
                                <input type="text" value={row.deviation} onChange={(e) => updateRow(i, "deviation", e.target.value)}
                                  className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors" placeholder="0.00" />
                              </td>
                              <td className="px-2 py-2 text-center">
                                <button type="button" onClick={() => removeRow(i)}
                                  className="p-1 rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button type="button" onClick={addRow}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-colors">
                      <Plus size={14} />
                      Add Row
                    </button>
                  </section>

                  {/* Additional Information */}
                  <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <SectionHead icon={Info} title="Additional Information" />
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Comments</label>
                        <input type="text" value={comments} onChange={(e) => setComments(e.target.value)}
                          className={inputCls} placeholder="e.g. Certified Okay" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">SON Lab Reference No.</label>
                          <input type="text" value={sonLabRef} onChange={(e) => setSonLabRef(e.target.value)}
                            className={inputCls} placeholder="e.g. SON/NMI/L/2019/002" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">WMV Certificate No.</label>
                          <input type="text" value={wmvCertNo} onChange={(e) => setWmvCertNo(e.target.value)}
                            className={inputCls} placeholder="e.g. WMV25054" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Performed By</label>
                          <input type="text" value={perfBy} onChange={(e) => setPerfBy(e.target.value)}
                            className={inputCls} placeholder="Engineer name" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Title</label>
                          <input type="text" value={perfTitle} onChange={(e) => setPerfTitle(e.target.value)}
                            className={inputCls} placeholder="e.g. Chief Engineer" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Recommended Recalibration Date</label>
                          <input type="date" value={recDate} onChange={(e) => setRecDate(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Expiry Date <Req />
                          </label>
                          <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className={inputCls} />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* ── Sidebar (order-first on mobile = top, lg:order-last on desktop = right) ── */}
                <div className="w-full lg:w-72 shrink-0 space-y-5 lg:sticky lg:top-6 order-first lg:order-last">

                  {/* Certificate info card */}
                  <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <SectionHead icon={FileText} title="Certificate" />
                    {isEditMode && certNo ? (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-400 mb-1">Certificate No.</p>
                        <p className="font-mono text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 select-all">
                          {certNo}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2.5 mb-4 leading-relaxed">
                        Certificate number will be auto-generated as <span className="font-mono text-gray-600">DPT/CLIENT/CAL/YYYY/NNN</span> on save.
                      </p>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full h-9 text-sm border-gray-200 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </section>

                  {/* Actions */}
                  <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-2.5">
                    <button type="submit" disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                      {submitting ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />{submitLabel}</>}
                    </button>

                    {savedId && (
                      <>
                        <button type="button" onClick={handleDownloadPdf} disabled={downloading}
                          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
                          {downloading ? <><Loader2 size={14} className="animate-spin" />Generating…</> : <><Download size={14} />Download PDF</>}
                        </button>
                        <button type="button" onClick={openEmailModal} disabled={submitting}
                          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
                          <Send size={14} />Send to Customer
                        </button>
                      </>
                    )}

                    <button type="button" onClick={() => setActiveTab("preview")} disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
                      <Eye size={14} />Preview
                    </button>

                    <button type="button" onClick={() => navigate("/certifications")} disabled={submitting}
                      className="w-full px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                      Cancel
                    </button>
                  </section>
                </div>
              </div>
            </form>
          )}

          {/* ══ PREVIEW TAB ══ */}
          {activeTab === "preview" && (
            <>
              {!hasPreviewData ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-medium">No certificate to preview</p>
                  <p className="text-sm text-gray-400 mt-1">Save the form first to generate a certificate number.</p>
                  <button onClick={() => setActiveTab("form")}
                    className="mt-5 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                    Back to Form
                  </button>
                </div>
              ) : (
                <>
                  <div id="cert-preview" style={s.page}>
                    <div style={s.header}>
                      <div style={s.headerInner}>
                        <div style={s.logoWrap}>
                          <img src="/certification/logo.png" alt="Darafunmi Precision Technologies Ltd." style={s.logoImage} />
                        </div>
                        <div style={s.addrBlock}>
                          <div>17, Isherl Road, Suite 9,</div>
                          <div>Avis Bus-Stop, Aguda-Ogba,</div>
                          <div>Lagos State.</div>
                          <div>Tel: 08034680544, 09095260378</div>
                          <div>E-mail: darafunmi2013@yahoo.com</div>
                          <div>darafunmlprecision@gmail.com</div>
                          <div>website: darafunmlprecise.com</div>
                        </div>
                      </div>
                    </div>
                    <div style={s.contentFrame}>
                      <div style={s.titleBox}>
                        <span style={s.titleText}>Certificate of Calibration</span>
                      </div>
                      <div style={s.body}>
                        <div style={s.section}>
                          <p style={s.sectionHead}>CUSTOMER INFORMATION:</p>
                          <p style={{ ...s.bold, margin: "1px 0" }}>{d.customerName}</p>
                          {addressLines.map((line, i) => (
                            <p key={i} style={{ ...s.bold, margin: "1px 0" }}>{line}</p>
                          ))}
                        </div>
                        <div style={s.section}>
                          <p style={{ ...s.bold, margin: "0 0 2px" }}>CERTIFICATE NO.: {d.certificateNumber}</p>
                          <p style={s.sectionHead}>INSTRUMENT DESCRIPTION:</p>
                        </div>
                        <div style={s.section}>
                          <div style={s.eqRow}><span style={s.eqLabel}>EQUIPMENT CALIBRATED:</span><span style={s.eqValue}>{d.equipCalibrated}</span></div>
                          <div style={s.eqRow}><span style={s.eqLabel}>EQUIPMENT LOCATION:</span><span style={s.eqValue}>{d.equipmentLocation}</span></div>
                          <div style={s.inlineRow}>
                            <span><strong>Identification No:</strong> {d.identificationNo}</span>
                            <span><strong>Scale:</strong> {d.scale}</span>
                            <span><strong>Scale Range:</strong> {d.scaleRange}</span>
                          </div>
                          <div style={s.inlineRow}>
                            <span><strong>Scale Division:</strong> {d.scaleDivision}</span>
                            <span><strong>Maximum Scale Error permitted:</strong> {d.maxScaleError}</span>
                          </div>
                          <p style={{ margin: "2px 0" }}><strong style={{ textDecoration: "underline" }}>REFERENCE INSTRUMENT USED:</strong> <strong>{d.referenceInstrument}</strong></p>
                          {d.referenceInstrumentSN && (
                            <p style={{ margin: "2px 0" }}><strong style={{ textDecoration: "underline" }}>REFERENCE INSTRUMENT S/N:</strong> {d.referenceInstrumentSN}</p>
                          )}
                        </div>
                        <div style={s.section}>
                          <p style={s.sectionHead}>LABORATORY ENVIRONMENTAL CONDITIONS</p>
                          <p style={{ margin: "2px 0" }}><strong>Temperature {d.temperature}</strong>&nbsp;&nbsp;&nbsp;&nbsp;<strong>Relative Humidity {d.humidity}</strong></p>
                        </div>
                        <div style={s.section}>
                          <p style={s.sectionHead}>RESULTS OF PHYSICAL EXAMINATION</p>
                          <p style={{ margin: "2px 0", textAlign: "justify" }}>{d.physicalExamText}</p>
                        </div>
                        <div style={s.section}>
                          <p style={{ fontWeight: 700, textDecoration: "underline", margin: "0 0 4px", color: BLACK }}>Results of Calibration</p>
                          <table style={s.table}>
                            <thead>
                              <tr>
                                <th style={s.th}>Standard Value<br />({unit})</th>
                                {is4 ? (
                                  <>
                                    <th style={s.th}>As Found Value<br />({unit})</th>
                                    <th style={s.th}>As Left Value<br />({unit})</th>
                                  </>
                                ) : (
                                  <th style={s.th}>Measured Value<br />({unit})</th>
                                )}
                                <th style={s.th}>Deviation<br />({unit})</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(d.calibrationResults ?? []).map((r: any, i: number) => (
                                <tr key={i}>
                                  <td style={s.td}>{r.standardValue}</td>
                                  {is4 ? (
                                    <><td style={s.td}>{r.asFoundValue}</td><td style={s.td}>{r.asLeftValue}</td></>
                                  ) : (
                                    <td style={s.td}>{r.measuredValue}</td>
                                  )}
                                  <td style={s.td}>{r.deviation}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p style={{ margin: "4px 0 8px", color: BLACK }}><strong style={{ textDecoration: "underline" }}>Comments:-</strong> {d.comments}</p>
                        <div style={{ marginBottom: 10 }}>
                          <div style={s.bulletWrap}>
                            <span style={s.bulletArrow}>&#9658;</span>
                            <p style={s.bulletText}>This is to certify that the instrument described above has been calibrated against Physical Laboratory Standards, which is traceable to Standard Organization of Nigeria (SON) at National Physical Laboratory Ref: <strong>{d.sonLabRef}</strong></p>
                          </div>
                          <div style={s.bulletWrap}>
                            <span style={s.bulletArrow}>&#9658;</span>
                            <p style={s.bulletText}>The Reference Instruments used was verified by Weight and Measure under the ACT. 1990 CAP467 of Federal Republic of Nigeria with Certificate No: <strong>{d.wmvCertNo}</strong></p>
                          </div>
                        </div>
                        <div style={s.bottomRow}>
                          <div>
                            <p style={{ margin: "0 0 4px", color: BLACK }}>
                              <strong>Calibration Date:</strong>{" "}
                              <span style={{ textDecoration: "underline" }}>
                                {d.calibrationDate ? new Date(d.calibrationDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                              </span>
                            </p>
                            <p style={{ margin: "20px 0 0", color: BLACK }}>This calibration was performed by</p>
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 11, margin: "0 0 6px", color: BLACK, textAlign: "center" }}>
                              Recommended Recalibration Date:{" "}
                              <span style={{ textDecoration: "underline" }}>
                                {d.recommendedRecalibDate ? new Date(d.recommendedRecalibDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                              </span>
                            </p>
                            <div style={s.stampBox}>
                              <img src="/certification/stamp.png" alt="Darafunmi Precision stamp and signature" style={s.stampImage} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={s.footer}>
                      <p style={{ margin: 0 }}>Calibration, Laboratory/Medical Equipment, Process Analytical Instrument Services, Repairs, Maintenance, Training &amp; Sales</p>
                      <p style={{ margin: 0 }}>CAL LAB: Suite D4 &amp; D5, Beside Tantalizer, Opp. Queen Esther Hall, Km 46, Lagos-Ibadab Express Way, Redemption Camp, Ogun State</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 mt-6">
                    <button onClick={() => setActiveTab("form")}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      {isEditMode ? "Edit Certificate" : "Back to Form"}
                    </button>
                    <button onClick={() => navigate("/certifications")}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Back to List
                    </button>
                    {savedId && (
                      <>
                        <button onClick={handleDownloadPdf} disabled={downloading}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                          {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                          {downloading ? "Generating…" : "Download PDF"}
                        </button>
                        <button onClick={openEmailModal}
                          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <Send size={14} />Send to Customer
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      {/* ── Send Email Modal ── */}
      <Dialog open={emailModalOpen} onOpenChange={(open) => { if (!sending) setEmailModalOpen(open); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Send Certificate to Customer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {certNo && (
              <div className="px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg text-sm">
                <span className="text-gray-500">Certificate: </span>
                <span className="font-mono font-semibold text-blue-700">{certNo}</span>
              </div>
            )}
            <p className="text-sm text-gray-500">
              The certificate PDF will be generated and emailed to the address below.
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Recipient Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
                placeholder="customer@example.com"
                className={inputCls}
              />
            </div>
          </div>

          <DialogFooter>
            <button onClick={() => setEmailModalOpen(false)} disabled={sending}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleSendEmail} disabled={sending || !emailTo.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {sending ? <><Loader2 size={14} className="animate-spin" />Sending…</> : <><Send size={14} />Send Email</>}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default GenerateCertificateFormPage;
