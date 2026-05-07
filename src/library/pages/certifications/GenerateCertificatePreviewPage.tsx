import React from "react";
import Layout from "../../components/layout/Layout";
import Button from "../../components/common/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { Download } from "lucide-react";

type TableType = "3col" | "4col";

const D = {
  certNo: "DPT/CAL/2025/007",
  calDate: "29 - 09 - 2025",
  recalibDate: "September 28, 2026",
  customerName: "ABVEE INDUSTRIES LTD.",
  customerAddress: ["KM 1, IJOKO ROAD,", "SANGO - OTTA, OGUN STATE", "NIGERIA"],
  equipmentCalibrated: "STAINLESS STEEL RULER",
  equipmentLocation: "LABORATORY",
  idNo: "N/A",
  scale: "cm/Inch",
  scaleRange: "30cm",
  scaleDivision: "1mm",
  maxScaleError: "0.1mm",
  referenceInstrument: "STANDARD METER RULE",
  referenceInstrumentSN: "",
  temperature: "23°C ± 2°C",
  humidity: "50% ± 10%",
  physicalExamText:
    "An examination of this Measuring Instrument mentioned above showed no visually apparent flaw and it was suitable for calibration.",
  tableType: "3col" as TableType,
  tableUnit: "cm",
  calibrationResults: [
    { standardValue: "0.00",  measuredValue: "0.00",  asFoundValue: "", asLeftValue: "", deviation: "0.00" },
    { standardValue: "10.00", measuredValue: "10.00", asFoundValue: "", asLeftValue: "", deviation: "0.00" },
    { standardValue: "20.00", measuredValue: "20.00", asFoundValue: "", asLeftValue: "", deviation: "0.00" },
    { standardValue: "30.00", measuredValue: "30.00", asFoundValue: "", asLeftValue: "", deviation: "0.00" },
  ],
  comments: "Certified Okay",
  sonLabRef: "SON/NMI/L/2019/002",
  wmvCertNo: "WMV25054",
  performedBy: "Daranijo Funminiyi A.",
  performedByTitle: "Chief Engineer",
};

/* ── Shared style tokens ──────────────────────────────────────────── */
const BLACK = "#111111";
const MAROON = "#8B3A3A";
const FONT  = "Arial, Helvetica, sans-serif";

const s = {
  /* wrappers */
  page: {
    maxWidth: 760,
    margin: "0 auto",
    background: "#fff",
    border: "1px solid #d8d8d8",
    boxShadow: "0 2px 12px rgba(0,0,0,.15)",
    fontFamily: FONT,
    fontSize: 12.5,
    color: BLACK,
    lineHeight: 1.3,
  } as React.CSSProperties,

  /* ── HEADER ── */
  header: {
    padding: "14px 18px 6px",
  } as React.CSSProperties,

  headerInner: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  } as React.CSSProperties,

  logoWrap: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    flexShrink: 0,
  } as React.CSSProperties,

  logoImage: {
    display: "block",
    width: 525,
    maxWidth: "100%",
    height: "auto",
  } as React.CSSProperties,

  addrBlock: {
    textAlign: "left" as const,
    fontSize: 8,
    fontWeight: 800,
    color: BLACK,
    lineHeight: 1.55,
    flexShrink: 0,
    paddingTop: 4,
  },

  contentFrame: {
    margin: "4px 18px 0",
    border: "1.5px solid #8B3A3A",
  } as React.CSSProperties,

  /* ── TITLE BOX ── */
  titleBox: {
    padding: "10px 10px 84px",
    textAlign: "center" as const,
  } as React.CSSProperties,

  titleText: {
    fontFamily: "'Brush Script MT', 'Segoe Script', 'URW Chancery L', cursive",
    fontSize: 28,
    color: MAROON,
    fontWeight: "normal" as const,
    borderBottom: "1.5px solid #8B3A3A",
    padding: "0 42px 2px",
  } as React.CSSProperties,

  /* ── BODY ── */
  body: {
    padding: "0 44px 18px",
  } as React.CSSProperties,

  section: {
    marginBottom: 9,
  },

  sectionHead: {
    fontWeight: 700,
    textDecoration: "underline",
    color: BLACK,
    fontSize: 15,
    margin: "0 0 2px",
  } as React.CSSProperties,

  bold: {
    fontWeight: 700,
    color: BLACK,
  } as React.CSSProperties,

  /* two-col equipment row */
  eqRow: {
    display: "flex",
    alignItems: "baseline",
    marginBottom: 6,
  } as React.CSSProperties,

  eqLabel: {
    fontWeight: 700,
    color: BLACK,
    minWidth: 250,
    flexShrink: 0,
    fontSize: 15,
  } as React.CSSProperties,

  eqValue: {
    fontWeight: 700,
    color: BLACK,
    fontSize: 15,
  } as React.CSSProperties,

  /* inline fields row */
  inlineRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 22,
    marginBottom: 7,
    fontSize: 14,
  } as React.CSSProperties,

  /* calibration table */
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    border: "1.5px solid #222",
    marginTop: 8,
  } as React.CSSProperties,

  th: {
    border: "1.5px solid #222",
    padding: "8px 8px",
    textAlign: "center" as const,
    fontWeight: 700,
    fontSize: 15,
    backgroundColor: "#fff",
    color: BLACK,
  } as React.CSSProperties,

  tdEven: {
    border: "1.5px solid #222",
    padding: "8px 8px",
    textAlign: "center" as const,
    fontWeight: 700,
    fontSize: 15,
    backgroundColor: "#fff",
    color: BLACK,
  } as React.CSSProperties,

  tdOdd: {
    border: "1.5px solid #222",
    padding: "8px 8px",
    textAlign: "center" as const,
    fontWeight: 700,
    fontSize: 15,
    backgroundColor: "#fff",
    color: BLACK,
  } as React.CSSProperties,

  /* bullet */
  bulletWrap: {
    display: "flex",
    gap: 10,
    marginBottom: 6,
    alignItems: "flex-start",
  } as React.CSSProperties,

  bulletArrow: {
    flexShrink: 0,
    fontWeight: 700,
    fontSize: 15,
    color: BLACK,
    lineHeight: 1.4,
  },

  bulletText: {
    margin: 0,
    textAlign: "justify" as const,
    lineHeight: 1.4,
    fontWeight: 700,
  } as React.CSSProperties,

  /* bottom row */
  bottomRow: {
    paddingTop: 16,
    marginTop: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
  } as React.CSSProperties,

  stampBox: {
    textAlign: "center" as const,
    minWidth: 240,
  } as React.CSSProperties,

  stampImage: {
    display: "block",
    width: 240,
    maxWidth: "100%",
    height: "auto",
    margin: "0 auto",
  } as React.CSSProperties,

  /* footer */
  footer: {
    backgroundColor: "#fff",
    padding: "6px 18px 10px",
    textAlign: "center" as const,
    fontSize: 9,
    fontWeight: 700,
    color: BLACK,
    lineHeight: 1.7,
  } as React.CSSProperties,
};

/* ── Component ────────────────────────────────────────────────────── */
const GenerateCertificatePreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const d = D;
  const is4  = d.tableType === "4col";
  const unit = d.tableUnit;

  const tab = (p: string) =>
    `font-medium pb-1 cursor-pointer mr-4 ${
      location.pathname === p
        ? "text-gray-800 border-b-2 border-blue-600"
        : "text-gray-500 hover:text-gray-700"
    }`;

  const tdStyle = (i: number) => (i % 2 === 0 ? s.tdEven : s.tdOdd);

  return (
    <Layout pageTitle="Generate Certificate" pageSubtitle="Create a new calibration certificate.">
      {/* Tab navigation */}
      <div className="flex items-center mb-6">
        <span className={tab("/certifications/generate")}
              onClick={() => navigate("/certifications/generate")}>Form</span>
        <span className={tab("/certifications/generate/preview")}
              onClick={() => navigate("/certifications/generate/preview")}>Preview</span>
      </div>

      {/* ════════════════════════════════════════════════════════════
          CERTIFICATE CARD
      ════════════════════════════════════════════════════════════ */}
      <div id="cert-preview" style={s.page}>

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div style={s.header}>
          {/* Logo | Company | Address */}
          <div style={s.headerInner}>

            {/* DPT logo + company text */}
            <div style={s.logoWrap}>
              <img
                src="/certification/logo.png"
                alt="Darafunmi Precision Technologies Ltd."
                style={s.logoImage}
              />
            </div>

            {/* Address block */}
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

        {/* ── TITLE BOX ──────────────────────────────────────────── */}
        <div style={s.contentFrame}>
        <div style={s.titleBox}>
          <span style={s.titleText}>Certificate of Calibration</span>
        </div>

        {/* ── BODY ───────────────────────────────────────────────── */}
        <div style={s.body}>

          {/* Customer Information */}
          <div style={s.section}>
            <p style={s.sectionHead}>CUSTOMER INFORMATION:</p>
            <p style={{ ...s.bold, margin: "1px 0" }}>{d.customerName}</p>
            {d.customerAddress.map((line, i) => (
              <p key={i} style={{ ...s.bold, margin: "1px 0" }}>{line}</p>
            ))}
          </div>

          {/* Certificate No + Instrument Description header */}
          <div style={s.section}>
            <p style={{ ...s.bold, margin: "0 0 2px" }}>CERTIFICATE NO.: {d.certNo}</p>
            <p style={s.sectionHead}>INSTRUMENT DESCRIPTION:</p>
          </div>

          {/* Equipment details */}
          <div style={s.section}>
            <div style={s.eqRow}>
              <span style={s.eqLabel}>EQUIPMENT CALIBRATED:</span>
              <span style={s.eqValue}>{d.equipmentCalibrated}</span>
            </div>
            <div style={s.eqRow}>
              <span style={s.eqLabel}>EQUIPMENT LOCATION:</span>
              <span style={s.eqValue}>{d.equipmentLocation}</span>
            </div>
            <div style={s.inlineRow}>
              <span><strong>Identification No:</strong> {d.idNo}</span>
              <span><strong>Scale:</strong> {d.scale}</span>
              <span><strong>Scale Range:</strong> {d.scaleRange}</span>
            </div>
            <div style={s.inlineRow}>
              <span><strong>Scale Division:</strong> {d.scaleDivision}</span>
              <span><strong>Maximum Scale Error permitted:</strong> {d.maxScaleError}</span>
            </div>
            <p style={{ margin: "2px 0" }}>
              <strong style={{ textDecoration: "underline" }}>REFERENCE INSTRUMENT USED:</strong>
              {" "}<strong>{d.referenceInstrument}</strong>
            </p>
            {d.referenceInstrumentSN && (
              <p style={{ margin: "2px 0" }}>
                <strong style={{ textDecoration: "underline" }}>REFERENCE INSTRUMENT S/N:</strong>
                {" "}{d.referenceInstrumentSN}
              </p>
            )}
          </div>

          {/* Environmental Conditions */}
          <div style={s.section}>
            <p style={s.sectionHead}>LABORATORY ENVIRONMENTAL CONDITIONS</p>
            <p style={{ margin: "2px 0" }}>
              <strong>Temperature {d.temperature}</strong>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <strong>Relative Humidity {d.humidity}</strong>
            </p>
          </div>

          {/* Physical Examination */}
          <div style={s.section}>
            <p style={s.sectionHead}>RESULTS OF PHYSICAL EXAMINATION</p>
            <p style={{ margin: "2px 0", textAlign: "justify" }}>{d.physicalExamText}</p>
          </div>

          {/* Calibration Results */}
          <div style={s.section}>
            <p style={{ fontWeight: 700, textDecoration: "underline", margin: "0 0 4px", color: BLACK }}>
              Results of Calibration
            </p>
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
                {d.calibrationResults.map((r, i) => (
                  <tr key={i}>
                    <td style={tdStyle(i)}>{r.standardValue}</td>
                    {is4 ? (
                      <>
                        <td style={tdStyle(i)}>{r.asFoundValue}</td>
                        <td style={tdStyle(i)}>{r.asLeftValue}</td>
                      </>
                    ) : (
                      <td style={tdStyle(i)}>{r.measuredValue}</td>
                    )}
                    <td style={tdStyle(i)}>{r.deviation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Comments */}
          <p style={{ margin: "4px 0 8px", color: BLACK }}>
            <strong style={{ textDecoration: "underline" }}>Comments:-</strong>{" "}{d.comments}
          </p>

          {/* Legal bullets */}
          <div style={{ marginBottom: 10 }}>
            <div style={s.bulletWrap}>
              <span style={s.bulletArrow}>&#9658;</span>
              <p style={s.bulletText}>
                This is to certify that the instrument described above has been calibrated against
                Physical Laboratory Standards, which is traceable to Standard Organization of Nigeria
                (SON) at National Physical Laboratory Ref: <strong>{d.sonLabRef}</strong>
              </p>
            </div>
            <div style={s.bulletWrap}>
              <span style={s.bulletArrow}>&#9658;</span>
              <p style={s.bulletText}>
                The Reference Instruments used was verified by Weight and Measure under the ACT.
                1990 CAP467 of Federal Republic of Nigeria with Certificate No:{" "}
                <strong>{d.wmvCertNo}</strong>
              </p>
            </div>
          </div>

          {/* Dates + Signature row */}
          <div style={s.bottomRow}>
            {/* Left */}
            <div>
              <p style={{ margin: "0 0 4px", color: BLACK }}>
                <strong>Calibration Date:</strong>{" "}
                <span style={{ textDecoration: "underline" }}>{d.calDate}</span>
              </p>
              <p style={{ margin: "20px 0 0", color: BLACK }}>This calibration was performed by</p>
            </div>

            {/* Right */}
            <div>
              <p style={{ fontWeight: 700, fontSize: 11, margin: "0 0 6px", color: BLACK, textAlign: "center" }}>
                Recommended Recalibration Date:{" "}
                <span style={{ textDecoration: "underline" }}>{d.recalibDate}</span>
              </p>

              {/* Stamp box */}
              <div style={s.stampBox}>
                <img
                  src="/certification/stamp.png"
                  alt="Darafunmi Precision stamp and signature"
                  style={s.stampImage}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────── */}
        </div>

        <div style={s.footer}>
          <p style={{ margin: 0 }}>
            Calibration, Laboratory/Medical Equipment, Process Analytical Instrument Services,
            Repairs, Maintenance, Training &amp; Sales
          </p>
          <p style={{ margin: 0 }}>
            CAL LAB: Suite D4 &amp; D5, Beside Tantalizer, Opp. Queen Esther Hall, Km 46,
            Lagos-Ibadab Express Way, Redemption Camp, Ogun State
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center mt-6 space-x-4">
        <Button variant="secondary" onClick={() => navigate("/certifications/generate")}>
          Back to Form
        </Button>
        <Button className="flex items-center">
          <Download size={16} className="mr-2" /> Generate &amp; Download PDF
        </Button>
      </div>
    </Layout>
  );
};

export default GenerateCertificatePreviewPage;
