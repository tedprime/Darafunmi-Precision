import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Button from "../../components/common/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { Download } from "lucide-react";
import { generatePdf } from "../../../services/certification.jsx";
import { apiFetch } from "../../../services/api";

type TableType = "3col" | "4col";

interface CertData {
  id: number;
  certificateNumber: string;
  calibrationDate: string;
  recommendedRecalibDate: string;
  customerName: string;
  customerAddress: string;
  equipmentCalibrated: string;
  equipmentLocation: string;
  identificationNo: string;
  scale: string;
  scaleRange: string;
  scaleDivision: string;
  maxScaleError: string;
  referenceInstrument: string;
  referenceInstrumentSN: string;
  temperature: string;
  humidity: string;
  physicalExamText: string;
  tableType: TableType;
  tableUnit: string;
  calibrationResults: {
    standardValue: string;
    measuredValue: string;
    asFoundValue: string;
    asLeftValue: string;
    deviation: string;
  }[];
  comments: string;
  sonLabRef: string;
  wmvCertNo: string;
  performedBy: string;
  performedByTitle: string;
}

/* ── Shared style tokens ── */
const BLACK = "#111111";
const MAROON = "#8B3A3A";
const FONT = "Arial, Helvetica, sans-serif";

const s = {
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
  header: { padding: "14px 18px 6px" } as React.CSSProperties,
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
  body: { padding: "0 44px 18px" } as React.CSSProperties,
  section: { marginBottom: 9 },
  sectionHead: {
    fontWeight: 700,
    textDecoration: "underline",
    color: BLACK,
    fontSize: 15,
    margin: "0 0 2px",
  } as React.CSSProperties,
  bold: { fontWeight: 700, color: BLACK } as React.CSSProperties,
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
  inlineRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 22,
    marginBottom: 7,
    fontSize: 14,
  } as React.CSSProperties,
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
  td: {
    border: "1.5px solid #222",
    padding: "8px 8px",
    textAlign: "center" as const,
    fontWeight: 700,
    fontSize: 15,
    backgroundColor: "#fff",
    color: BLACK,
  } as React.CSSProperties,
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

const GenerateCertificatePreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const certId = new URLSearchParams(location.search).get("id");

  const [data, setData] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(!!certId);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!certId) return;
    apiFetch(`/certifications/${certId}`)
      .then((res: { data: CertData }) => setData(res.data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [certId]);

  const handleDownload = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const blob = await generatePdf(data.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.certificateNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const tab = (p: string) =>
    `font-medium pb-1 cursor-pointer mr-4 ${location.pathname === p ? "text-gray-800 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`;

  const d = data;
  const is4 = d?.tableType === "4col";
  const unit = d?.tableUnit ?? "cm";
  const addressLines = d?.customerAddress?.split("\n") ?? [];

  return (
    <Layout
      pageTitle="Generate Certificate"
      pageSubtitle="Create a new calibration certificate."
    >
      <div className="flex items-center mb-6">
        <span
          className={tab("/certifications/generate")}
          onClick={() => navigate("/certifications/generate")}
        >
          Form
        </span>
        <span
          className={tab("/certifications/generate/preview")}
          onClick={() => navigate("/certifications/generate/preview")}
        >
          Preview
        </span>
      </div>

      {loading && (
        <p className="text-sm text-gray-500 text-center py-12">
          Loading certificate...
        </p>
      )}
      {error && (
        <p className="text-sm text-red-500 text-center py-12">{error}</p>
      )}

      {!loading && !error && !d && (
        <p className="text-sm text-gray-500 text-center py-12">
          No certificate to preview.{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/certifications/generate")}
          >
            Go to form
          </span>
        </p>
      )}

      {!loading && !error && d && (
        <>
          <div id="cert-preview" style={s.page}>
            {/* HEADER */}
            <div style={s.header}>
              <div style={s.headerInner}>
                <div style={s.logoWrap}>
                  <img
                    src="/certification/logo.png"
                    alt="Darafunmi Precision Technologies Ltd."
                    style={s.logoImage}
                  />
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
                {/* Customer Information */}
                <div style={s.section}>
                  <p style={s.sectionHead}>CUSTOMER INFORMATION:</p>
                  <p style={{ ...s.bold, margin: "1px 0" }}>{d.customerName}</p>
                  {addressLines.map((line, i) => (
                    <p key={i} style={{ ...s.bold, margin: "1px 0" }}>
                      {line}
                    </p>
                  ))}
                </div>

                {/* Certificate No */}
                <div style={s.section}>
                  <p style={{ ...s.bold, margin: "0 0 2px" }}>
                    CERTIFICATE NO.: {d.certificateNumber}
                  </p>
                  <p style={s.sectionHead}>INSTRUMENT DESCRIPTION:</p>
                </div>

                {/* Equipment */}
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
                    <span>
                      <strong>Identification No:</strong> {d.identificationNo}
                    </span>
                    <span>
                      <strong>Scale:</strong> {d.scale}
                    </span>
                    <span>
                      <strong>Scale Range:</strong> {d.scaleRange}
                    </span>
                  </div>
                  <div style={s.inlineRow}>
                    <span>
                      <strong>Scale Division:</strong> {d.scaleDivision}
                    </span>
                    <span>
                      <strong>Maximum Scale Error permitted:</strong>{" "}
                      {d.maxScaleError}
                    </span>
                  </div>
                  <p style={{ margin: "2px 0" }}>
                    <strong style={{ textDecoration: "underline" }}>
                      REFERENCE INSTRUMENT USED:
                    </strong>{" "}
                    <strong>{d.referenceInstrument}</strong>
                  </p>
                  {d.referenceInstrumentSN && (
                    <p style={{ margin: "2px 0" }}>
                      <strong style={{ textDecoration: "underline" }}>
                        REFERENCE INSTRUMENT S/N:
                      </strong>{" "}
                      {d.referenceInstrumentSN}
                    </p>
                  )}
                </div>

                {/* Environmental Conditions */}
                <div style={s.section}>
                  <p style={s.sectionHead}>
                    LABORATORY ENVIRONMENTAL CONDITIONS
                  </p>
                  <p style={{ margin: "2px 0" }}>
                    <strong>Temperature {d.temperature}</strong>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <strong>Relative Humidity {d.humidity}</strong>
                  </p>
                </div>

                {/* Physical Examination */}
                <div style={s.section}>
                  <p style={s.sectionHead}>RESULTS OF PHYSICAL EXAMINATION</p>
                  <p style={{ margin: "2px 0", textAlign: "justify" }}>
                    {d.physicalExamText}
                  </p>
                </div>

                {/* Calibration Results */}
                <div style={s.section}>
                  <p
                    style={{
                      fontWeight: 700,
                      textDecoration: "underline",
                      margin: "0 0 4px",
                      color: BLACK,
                    }}
                  >
                    Results of Calibration
                  </p>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>
                          Standard Value
                          <br />({unit})
                        </th>
                        {is4 ? (
                          <>
                            <th style={s.th}>
                              As Found Value
                              <br />({unit})
                            </th>
                            <th style={s.th}>
                              As Left Value
                              <br />({unit})
                            </th>
                          </>
                        ) : (
                          <th style={s.th}>
                            Measured Value
                            <br />({unit})
                          </th>
                        )}
                        <th style={s.th}>
                          Deviation
                          <br />({unit})
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(d.calibrationResults ?? []).map((r, i) => (
                        <tr key={i}>
                          <td style={s.td}>{r.standardValue}</td>
                          {is4 ? (
                            <>
                              <td style={s.td}>{r.asFoundValue}</td>
                              <td style={s.td}>{r.asLeftValue}</td>
                            </>
                          ) : (
                            <td style={s.td}>{r.measuredValue}</td>
                          )}
                          <td style={s.td}>{r.deviation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Comments */}
                <p style={{ margin: "4px 0 8px", color: BLACK }}>
                  <strong style={{ textDecoration: "underline" }}>
                    Comments:-
                  </strong>{" "}
                  {d.comments}
                </p>

                {/* Legal bullets */}
                <div style={{ marginBottom: 10 }}>
                  <div style={s.bulletWrap}>
                    <span style={s.bulletArrow}>&#9658;</span>
                    <p style={s.bulletText}>
                      This is to certify that the instrument described above has
                      been calibrated against Physical Laboratory Standards,
                      which is traceable to Standard Organization of Nigeria
                      (SON) at National Physical Laboratory Ref:{" "}
                      <strong>{d.sonLabRef}</strong>
                    </p>
                  </div>
                  <div style={s.bulletWrap}>
                    <span style={s.bulletArrow}>&#9658;</span>
                    <p style={s.bulletText}>
                      The Reference Instruments used was verified by Weight and
                      Measure under the ACT. 1990 CAP467 of Federal Republic of
                      Nigeria with Certificate No:{" "}
                      <strong>{d.wmvCertNo}</strong>
                    </p>
                  </div>
                </div>

                {/* Dates + Signature */}
                <div style={s.bottomRow}>
                  <div>
                    <p style={{ margin: "0 0 4px", color: BLACK }}>
                      <strong>Calibration Date:</strong>{" "}
                      <span style={{ textDecoration: "underline" }}>
                        {d.calibrationDate
                          ? new Date(d.calibrationDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </span>
                    </p>
                    <p style={{ margin: "20px 0 0", color: BLACK }}>
                      This calibration was performed by
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: 11,
                        margin: "0 0 6px",
                        color: BLACK,
                        textAlign: "center",
                      }}
                    >
                      Recommended Recalibration Date:{" "}
                      <span style={{ textDecoration: "underline" }}>
                        {d.recommendedRecalibDate
                          ? new Date(
                              d.recommendedRecalibDate,
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </p>
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
            </div>

            {/* FOOTER */}
            <div style={s.footer}>
              <p style={{ margin: 0 }}>
                Calibration, Laboratory/Medical Equipment, Process Analytical
                Instrument Services, Repairs, Maintenance, Training &amp; Sales
              </p>
              <p style={{ margin: 0 }}>
                CAL LAB: Suite D4 &amp; D5, Beside Tantalizer, Opp. Queen Esther
                Hall, Km 46, Lagos-Ibadab Express Way, Redemption Camp, Ogun
                State
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center mt-6 space-x-4">
            <Button
              variant="secondary"
              onClick={() => navigate("/certifications")}
            >
              Back to List
            </Button>
            <Button
              className="flex items-center"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download size={16} className="mr-2" />
              {downloading ? "Generating..." : "Generate & Download PDF"}
            </Button>
          </div>
        </>
      )}
    </Layout>
  );
};

export default GenerateCertificatePreviewPage;
