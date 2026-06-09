import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Plus, Trash2, Download, Eye } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createCertification, generatePdf, getCertification } from "../../../services/certification.jsx";

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

/* ── Style tokens (same as preview) ── */
const BLACK = "#111111";
const MAROON = "#8B3A3A";
const FONT = "Arial, Helvetica, sans-serif";

const s = {
  page: { maxWidth: 760, margin: "0 auto", background: "#fff", border: "1px solid #d8d8d8", boxShadow: "0 2px 12px rgba(0,0,0,.15)", fontFamily: FONT, fontSize: 12.5, color: BLACK, lineHeight: 1.3 } as React.CSSProperties,
  header: { padding: "14px 18px 6px" } as React.CSSProperties,
  headerInner: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 } as React.CSSProperties,
  logoWrap: { display: "flex", alignItems: "flex-start", gap: 8, flexShrink: 0 } as React.CSSProperties,
  logoImage: { display: "block", width: 525, maxWidth: "100%", height: "auto" } as React.CSSProperties,
  addrBlock: { textAlign: "left" as const, fontSize: 8, fontWeight: 800, color: BLACK, lineHeight: 1.55, flexShrink: 0, paddingTop: 4 },
  contentFrame: { margin: "4px 18px 0", border: "1.5px solid #8B3A3A" } as React.CSSProperties,
  titleBox: { padding: "10px 10px 84px", textAlign: "center" as const } as React.CSSProperties,
  titleText: { fontFamily: "'Brush Script MT', 'Segoe Script', 'URW Chancery L', cursive", fontSize: 28, color: MAROON, fontWeight: "normal" as const, borderBottom: "1.5px solid #8B3A3A", padding: "0 42px 2px" } as React.CSSProperties,
  body: { padding: "0 44px 18px" } as React.CSSProperties,
  section: { marginBottom: 9 },
  sectionHead: { fontWeight: 700, textDecoration: "underline", color: BLACK, fontSize: 15, margin: "0 0 2px" } as React.CSSProperties,
  bold: { fontWeight: 700, color: BLACK } as React.CSSProperties,
  eqRow: { display: "flex", alignItems: "baseline", marginBottom: 6 } as React.CSSProperties,
  eqLabel: { fontWeight: 700, color: BLACK, minWidth: 250, flexShrink: 0, fontSize: 15 } as React.CSSProperties,
  eqValue: { fontWeight: 700, color: BLACK, fontSize: 15 } as React.CSSProperties,
  inlineRow: { display: "flex", justifyContent: "space-between", gap: 22, marginBottom: 7, fontSize: 14 } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, border: "1.5px solid #222", marginTop: 8 } as React.CSSProperties,
  th: { border: "1.5px solid #222", padding: "8px 8px", textAlign: "center" as const, fontWeight: 700, fontSize: 15, backgroundColor: "#fff", color: BLACK } as React.CSSProperties,
  td: { border: "1.5px solid #222", padding: "8px 8px", textAlign: "center" as const, fontWeight: 700, fontSize: 15, backgroundColor: "#fff", color: BLACK } as React.CSSProperties,
  bulletWrap: { display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" } as React.CSSProperties,
  bulletArrow: { flexShrink: 0, fontWeight: 700, fontSize: 15, color: BLACK, lineHeight: 1.4 },
  bulletText: { margin: 0, textAlign: "justify" as const, lineHeight: 1.4, fontWeight: 700 } as React.CSSProperties,
  bottomRow: { paddingTop: 16, marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 } as React.CSSProperties,
  stampBox: { textAlign: "center" as const, minWidth: 240 } as React.CSSProperties,
  stampImage: { display: "block", width: 240, maxWidth: "100%", height: "auto", margin: "0 auto" } as React.CSSProperties,
  footer: { backgroundColor: "#fff", padding: "6px 18px 10px", textAlign: "center" as const, fontSize: 9, fontWeight: 700, color: BLACK, lineHeight: 1.7 } as React.CSSProperties,
};

const GenerateCertificateFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ActiveTab>("form");
  // Initialised as true when ?id= is present so the effect never calls setLoadingCert synchronously
  const [loadingCert, setLoadingCert] = useState(() => !!new URLSearchParams(window.location.search).get("id"));

  // Form fields
  const [certNo, setCertNo] = useState("");
  const [calDate, setCalDate] = useState("");
  const [custName, setCustName] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [equipCalibrated, setEquipCalibrated] = useState("");
  const [equipLocation, setEquipLocation] = useState("");
  const [idNo, setIdNo] = useState("");
  const [scale, setScale] = useState("");
  const [scaleRange, setScaleRange] = useState("");
  const [scaleDiv, setScaleDiv] = useState("");
  const [maxError, setMaxError] = useState("");
  const [refInst, setRefInst] = useState("");
  const [refInstSn, setRefInstSn] = useState("");
  const [temp, setTemp] = useState("");
  const [humidity, setHumidity] = useState("");
  const [physExam, setPhysExam] = useState("An examination of this Measuring Instrument mentioned above showed no visually apparent flaw and it was suitable for calibration.");
  const [tableType, setTableType] = useState<TableType>("3col");
  const [tableUnit, setTableUnit] = useState("cm");
  const [rows, setRows] = useState<CalibrationRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [comments, setComments] = useState("Certified Okay");
  const [sonLabRef, setSonLabRef] = useState("");
  const [wmvCertNo, setWmvCertNo] = useState("WMV25054");
  const [perfBy, setPerfBy] = useState("Daranijo Funminiyi A.");
  const [perfTitle, setPerfTitle] = useState("Chief Engineer");
  const [recDate, setRecDate] = useState("");
  const [expDate, setExpDate] = useState("");
  const [status, setStatus] = useState("draft");
  const [clientId, setClientId] = useState("");

  // Saved certificate ID (set after successful save)
  const [savedId, setSavedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing cert when navigated with ?id=X&tab=preview
  useEffect(() => {
    const id = searchParams.get("id");
    const tab = searchParams.get("tab");
    if (!id) return;

    let cancelled = false;
    getCertification(Number(id))
      .then((cert: { data?: Record<string, unknown> } & Record<string, unknown>) => {
        if (cancelled) return;
        const d = (cert?.data ?? cert) as Record<string, unknown>;
        const str = (v: unknown) => (v != null ? String(v) : "");
        setCertNo(str(d.certificateNumber));
        setCalDate(d.calibrationDate ? str(d.calibrationDate).slice(0, 10) : "");
        setCustName(str(d.customerName));
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
            ? rawRows.map((r: Record<string, unknown>) => ({
                standardValue: str(r.standardValue),
                measuredValue: str(r.measuredValue),
                asFoundValue: str(r.asFoundValue),
                asLeftValue: str(r.asLeftValue),
                deviation: str(r.deviation),
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
        setClientId(d.clientId ? str(d.clientId) : "");
        setSavedId(typeof d.id === "number" ? d.id : Number(id));
        if (tab === "preview") setActiveTab("preview");
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load certificate for preview.");
      })
      .finally(() => {
        if (!cancelled) setLoadingCert(false);
      });

    return () => { cancelled = true; };
  }, [searchParams]);

  const addRow = () => setRows((r) => [...r, emptyRow()]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof CalibrationRow, val: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  const buildCalibrationResults = () =>
    rows
      .filter((r) => r.standardValue || r.measuredValue || r.deviation)
      .map((r) => ({ ...r }));

  // Preview data derived from current form state
  const previewData = {
    certificateNumber: certNo,
    calibrationDate: calDate,
    recommendedRecalibDate: recDate,
    customerName: custName,
    customerAddress: custAddress,
    equipCalibrated,
    equipmentLocation: equipLocation,
    identificationNo: idNo,
    scale,
    scaleRange,
    scaleDivision: scaleDiv,
    maxScaleError: maxError,
    referenceInstrument: refInst,
    referenceInstrumentSN: refInstSn,
    temperature: temp,
    humidity,
    physicalExamText: physExam,
    tableType,
    tableUnit,
    calibrationResults: buildCalibrationResults(),
    comments,
    sonLabRef,
    wmvCertNo,
    performedBy: perfBy,
    performedByTitle: perfTitle,
  };

  const hasPreviewData = !!certNo.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!certNo.trim()) { setError("Certificate number is required."); return; }

    const calibrationResults = buildCalibrationResults();
    if (calibrationResults.length === 0) {
      setError("Please add at least one calibration result row with a standard value.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createCertification({
        certificateNumber: certNo.trim(),
        // Always send clientId — null when empty so the server gets an explicit
        // value rather than a missing key that may trip a NOT NULL constraint.
        clientId: clientId ? Number(clientId) : null,
        customerName: custName.trim(),
        customerAddress: custAddress.trim(),
        equipmentCalibrated: equipCalibrated.trim(),
        equipmentLocation: equipLocation.trim(),
        identificationNo: idNo.trim(),
        scale: scale.trim(),
        scaleRange: scaleRange.trim(),
        scaleDivision: scaleDiv.trim(),
        maxScaleError: maxError.trim(),
        referenceInstrument: refInst.trim(),
        referenceInstrumentSN: refInstSn.trim(),
        temperature: temp.trim(),
        humidity: humidity.trim(),
        tableType,
        tableUnit,
        physicalExamText: physExam.trim(),
        sonLabRef: sonLabRef.trim(),
        wmvCertNo: wmvCertNo.trim(),
        comments: comments.trim(),
        performedBy: perfBy.trim(),
        performedByTitle: perfTitle.trim(),
        // Send null instead of "" so the server receives a proper nullable date
        calibrationDate: calDate || null,
        recommendedRecalibDate: recDate || null,
        expiryDate: expDate || null,
        status,
        calibrationResults,
      });
      setSavedId(res?.data?.id ?? null);
      navigate("/certifications");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create certificate.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!savedId) return;
    setDownloading(true);
    try {
      const result = await generatePdf(savedId);
      const pdfUrl = result?.pdfUrl;
      if (!pdfUrl) throw new Error("No PDF URL returned from server.");
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error("Failed to fetch PDF from server.");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${certNo || `certificate-${savedId}`}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const tab = (t: ActiveTab) =>
    `font-medium pb-1 cursor-pointer mr-4 ${activeTab === t ? "text-gray-800 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`;

  const d = previewData;
  const is4 = d.tableType === "4col";
  const unit = d.tableUnit ?? "cm";
  const addressLines = d.customerAddress?.split("\n") ?? [];

  return (
    <Layout pageTitle="Generate Certificate" pageSubtitle="Create a new calibration certificate.">
      {loadingCert ? (
        <div className="flex items-center justify-center py-24 text-sm text-gray-400">
          Loading certificate…
        </div>
      ) : (
      <>
      {/* Tabs */}
      <div className="flex items-center mb-6">
        <span className={tab("form")} onClick={() => setActiveTab("form")}>Form</span>
        <span className={tab("preview")} onClick={() => setActiveTab("preview")}>Preview</span>
      </div>

      {/* ── FORM TAB ── */}
      {activeTab === "form" && (
        <>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Certificate Information */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Certificate Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input id="certNo" label="Certificate Number" placeholder="e.g., DPT/CAL/2025/001" value={certNo} onChange={(e) => setCertNo(e.target.value)} />
                <Input id="calDate" label="Calibration Date" type="date" value={calDate} onChange={(e) => setCalDate(e.target.value)} />
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </div>
                <Input id="clientId" label="Client ID (optional)" placeholder="e.g., 12" value={clientId} onChange={(e) => setClientId(e.target.value)} />
              </div>
            </Card>

            {/* Customer Information */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input id="custName" label="Customer Name" placeholder="Enter customer name" value={custName} onChange={(e) => setCustName(e.target.value)} />
                <Input id="custAddress" label="Customer Address" placeholder="Enter customer address" value={custAddress} onChange={(e) => setCustAddress(e.target.value)} />
              </div>
            </Card>

            {/* Instrument Description */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Instrument Description</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input id="equipCalibrated" label="Equipment Calibrated" placeholder="e.g., Vernier Caliper" value={equipCalibrated} onChange={(e) => setEquipCalibrated(e.target.value)} />
                <Input id="equipLocation" label="Equipment Location" placeholder="e.g., Lab A" value={equipLocation} onChange={(e) => setEquipLocation(e.target.value)} />
                <Input id="idNo" label="ID No." placeholder="e.g., DPT-001" value={idNo} onChange={(e) => setIdNo(e.target.value)} />
                <Input id="scale" label="Scale" placeholder="e.g., Metric" value={scale} onChange={(e) => setScale(e.target.value)} />
                <Input id="scaleRange" label="Scale Range" placeholder="e.g., 0 - 150mm" value={scaleRange} onChange={(e) => setScaleRange(e.target.value)} />
                <Input id="scaleDiv" label="Scale Division" placeholder="e.g., 0.02mm" value={scaleDiv} onChange={(e) => setScaleDiv(e.target.value)} />
                <Input id="maxError" label="Max Scale Error Permitted" placeholder="e.g., ±0.05mm" value={maxError} onChange={(e) => setMaxError(e.target.value)} />
                <Input id="refInst" label="Reference Instrument" placeholder="e.g., Gauge Block Set" value={refInst} onChange={(e) => setRefInst(e.target.value)} />
                <Input id="refInstSn" label="Reference Instrument S/N" placeholder="e.g., SN-20210045" value={refInstSn} onChange={(e) => setRefInstSn(e.target.value)} />
              </div>
            </Card>

            {/* Environmental Conditions */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Environmental Conditions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input id="temp" label="Temperature" placeholder="e.g., 25°C" value={temp} onChange={(e) => setTemp(e.target.value)} />
                <Input id="humidity" label="Relative Humidity" placeholder="e.g., 60%" value={humidity} onChange={(e) => setHumidity(e.target.value)} />
              </div>
            </Card>

            {/* Physical Examination */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Physical Examination</h3>
              <textarea id="physExam" rows={3} value={physExam} onChange={(e) => setPhysExam(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </Card>

            {/* Calibration Results */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Calibration Results</h3>
              <div className="flex flex-wrap gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Table Type</label>
                  <select value={tableType} onChange={(e) => setTableType(e.target.value as TableType)} className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="3col">3 Column</option>
                    <option value="4col">4 Column</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input type="text" value={tableUnit} onChange={(e) => setTableUnit(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-24" placeholder="cm" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-center font-semibold text-gray-700 border border-gray-300">Standard Value ({tableUnit})</th>
                      {tableType === "3col" ? (
                        <th className="px-4 py-2 text-center font-semibold text-gray-700 border border-gray-300">Measured Value ({tableUnit})</th>
                      ) : (
                        <>
                          <th className="px-4 py-2 text-center font-semibold text-gray-700 border border-gray-300">As Found Value ({tableUnit})</th>
                          <th className="px-4 py-2 text-center font-semibold text-gray-700 border border-gray-300">As Left Value ({tableUnit})</th>
                        </>
                      )}
                      <th className="px-4 py-2 text-center font-semibold text-gray-700 border border-gray-300">Deviation ({tableUnit})</th>
                      <th className="px-4 py-2 w-10 border border-gray-300"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-2 border border-gray-200">
                          <input type="text" value={row.standardValue} onChange={(e) => updateRow(i, "standardValue", e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-center" placeholder="0.00" />
                        </td>
                        {tableType === "3col" ? (
                          <td className="px-3 py-2 border border-gray-200">
                            <input type="text" value={row.measuredValue} onChange={(e) => updateRow(i, "measuredValue", e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-center" placeholder="0.00" />
                          </td>
                        ) : (
                          <>
                            <td className="px-3 py-2 border border-gray-200">
                              <input type="text" value={row.asFoundValue} onChange={(e) => updateRow(i, "asFoundValue", e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-center" placeholder="0.00" />
                            </td>
                            <td className="px-3 py-2 border border-gray-200">
                              <input type="text" value={row.asLeftValue} onChange={(e) => updateRow(i, "asLeftValue", e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-center" placeholder="0.00" />
                            </td>
                          </>
                        )}
                        <td className="px-3 py-2 border border-gray-200">
                          <input type="text" value={row.deviation} onChange={(e) => updateRow(i, "deviation", e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-center" placeholder="0.00" />
                        </td>
                        <td className="px-3 py-2 text-center border border-gray-200">
                          <button type="button" onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addRow} className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                <Plus size={15} /> Add Row
              </button>
            </Card>

            {/* Additional Information */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                  <input type="text" id="comments" value={comments} onChange={(e) => setComments(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g., Certified Okay" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input id="sonLabRef" label="SON Lab Reference No." placeholder="e.g., SON/NMI/L/2019/002" value={sonLabRef} onChange={(e) => setSonLabRef(e.target.value)} />
                  <Input id="wmvCertNo" label="WMV Certificate No." placeholder="e.g., WMV25054" value={wmvCertNo} onChange={(e) => setWmvCertNo(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input id="perfBy" label="Performed By" placeholder="Engineer name" value={perfBy} onChange={(e) => setPerfBy(e.target.value)} />
                  <Input id="perfTitle" label="Title" placeholder="e.g., Chief Engineer" value={perfTitle} onChange={(e) => setPerfTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input id="recDate" label="Recommended Recalibration Date" type="date" value={recDate} onChange={(e) => setRecDate(e.target.value)} />
                  <Input id="expDate" label="Expiry Date" type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
                </div>
              </div>
            </Card>

            <div className="flex space-x-4">
              <Button type="submit" className="flex items-center" disabled={submitting}>
                <Download size={16} className="mr-2" />
                {submitting ? "Saving..." : "Save Certificate"}
              </Button>
              <Button type="button" variant="secondary" className="flex items-center" onClick={() => setActiveTab("preview")} disabled={submitting}>
                <Eye size={16} className="mr-2" /> Preview
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate("/certifications")} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </form>
        </>
      )}

      {/* ── PREVIEW TAB ── */}
      {activeTab === "preview" && (
        <>
          {!hasPreviewData ? (
            <div className="text-center py-20">
              <p className="text-sm text-gray-500">
                No certificate to preview.{" "}
                <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => setActiveTab("form")}>
                  Go to form
                </span>
              </p>
            </div>
          ) : (
            <>
              <div id="cert-preview" style={s.page}>
                {/* HEADER */}
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

                {/* TITLE BOX */}
                <div style={s.contentFrame}>
                  <div style={s.titleBox}>
                    <span style={s.titleText}>Certificate of Calibration</span>
                  </div>

                  {/* BODY */}
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
                          {(d.calibrationResults ?? []).map((r, i) => (
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

                {/* FOOTER */}
                <div style={s.footer}>
                  <p style={{ margin: 0 }}>Calibration, Laboratory/Medical Equipment, Process Analytical Instrument Services, Repairs, Maintenance, Training &amp; Sales</p>
                  <p style={{ margin: 0 }}>CAL LAB: Suite D4 &amp; D5, Beside Tantalizer, Opp. Queen Esther Hall, Km 46, Lagos-Ibadab Express Way, Redemption Camp, Ogun State</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-center mt-6 space-x-4">
                <Button variant="secondary" onClick={() => setActiveTab("form")}>
                  Back to Form
                </Button>
                <Button variant="secondary" onClick={() => navigate("/certifications")}>
                  Back to List
                </Button>
                {savedId && (
                  <Button className="flex items-center" onClick={handleDownloadPdf} disabled={downloading}>
                    <Download size={16} className="mr-2" />
                    {downloading ? "Generating..." : "Generate & Download PDF"}
                  </Button>
                )}
              </div>
            </>
          )}
        </>
      )}
      </>
      )}
    </Layout>
  );
};

export default GenerateCertificateFormPage;