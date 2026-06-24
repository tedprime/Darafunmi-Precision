import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { confirmDialog } from "../../components/common/confirmDialog";
import { Plus, Eye, Download, Mail, Search, Trash2, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../services/useToast";
import {
  getCertifications,
  deleteCertification,
  generatePdf,
  sendCertificateEmail,
} from "../../../services/certification.jsx";

interface Certificate {
  id: number;
  certificateNumber: string;
  customerName: string;
  equipmentCalibrated: string;
  equipment?: string;
  instrument?: string;
  expiryDate: string;
  status: "draft" | "active" | "expiring-soon" | "expired" | string;
}

const STATUS_COLOR: Record<string, "gray" | "green" | "yellow" | "red"> = {
  draft: "gray",
  active: "green",
  "expiring-soon": "yellow",
  expired: "red",
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const CertificationListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast() as {
    toast: {
      error: (msg: string) => void;
      success: (msg: string) => void;
      info: (msg: string) => void;
    };
  };

  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [count, setCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [emailModal, setEmailModal] = useState<{ id: number; customerName: string } | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchCerts = async () => {
      try {
        const { data, count: total } = await getCertifications({ search, status });
        if (cancelled) return;
        setCerts(data);
        setCount(total);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load certificates.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCerts();
    return () => { cancelled = true; };
  }, [search, status]);

  const handleDelete = async (id: number, certNo: string) => {
    if (!(await confirmDialog({
      title: "Delete certificate?",
      description: `Delete certificate ${certNo}?`,
      confirmLabel: "Delete",
    }))) return;
    try {
      setActionLoading(id);
      await deleteCertification(id);
      setCerts((prev) => prev.filter((c) => c.id !== id));
      toast.success("Certificate deleted.");
    } catch {
      toast.error("Failed to delete certificate.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (id: number) => {
    const cert = certs.find((c) => c.id === id);
    try {
      setActionLoading(id);
      const result = await generatePdf(id);
      const pdfUrl = result?.pdfUrl;
      if (!pdfUrl) throw new Error("No PDF URL returned from server.");
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error("Failed to fetch PDF from server.");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = cert ? `${cert.certificateNumber}.pdf` : `certificate-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success("PDF downloaded successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate PDF.";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenEmailModal = (id: number, customerName: string) => {
    setEmailTo("");
    setEmailModal({ id, customerName });
  };

  const handleSendEmail = async () => {
    if (!emailModal || !emailTo.trim()) return;
    setSending(true);
    try {
      await sendCertificateEmail(emailModal.id, emailTo.trim());
      setCerts((prev) =>
        prev.map((c) =>
          c.id === emailModal.id && c.status === "draft"
            ? { ...c, status: "active" as Certificate["status"] }
            : c
        )
      );
      toast.success(`Certificate sent to ${emailTo} successfully!`);
      setEmailModal(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send email.";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout
      pageTitle="Certifications"
      pageSubtitle={`Manage all issued certificates${count ? ` (${count} total)` : ""}`}
      action={
        <Button onClick={() => navigate("/certifications/generate")}>
          <Plus size={16} /> Generate Certificate
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
            placeholder="Search by certificate number or customer name..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="expiring-soon">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, j) => <Skeleton key={j} className="h-8" />)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-yellow-500 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load certificates</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Desktop Table */}
      {!loading && !error && (
        <>
          <div className="max-md:hidden bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">All Certificates</h3>
            </div>
            {certs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No certificates found.</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    {["Certificate No", "Recipient", "Equipment", "Expiry Date", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {certs.map((cert) => (
                    <tr key={cert.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-mono font-medium text-gray-900">{cert.certificateNumber}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-normal break-words">{cert.customerName}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-normal break-words">{cert.equipmentCalibrated || cert.equipment || cert.instrument || "—"}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3.5">
                        <Badge color={STATUS_COLOR[cert.status] ?? "gray"}>{cert.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            title="Preview"
                            className="p-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            onClick={() => navigate(`/certifications/generate?id=${cert.id}&tab=preview`)}
                            disabled={actionLoading === cert.id}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            title="Download PDF"
                            className="p-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            onClick={() => handleDownload(cert.id)}
                            disabled={actionLoading === cert.id}
                          >
                            {actionLoading === cert.id ? (
                              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                            ) : (
                              <Download size={14} />
                            )}
                          </button>
                          <button
                            type="button"
                            title={`Email PDF to ${cert.customerName}`}
                            className="p-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 disabled:opacity-40 transition-colors"
                            onClick={() => handleOpenEmailModal(cert.id, cert.customerName)}
                            disabled={actionLoading === cert.id}
                          >
                            <Mail size={14} />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            className="p-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                            onClick={() => handleDelete(cert.id, cert.certificateNumber)}
                            disabled={actionLoading === cert.id}
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
            {certs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No certificates found.</p>
            ) : certs.map((cert) => (
              <div key={cert.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-semibold text-gray-800">{cert.certificateNumber}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{cert.customerName}</p>
                  </div>
                  <Badge color={STATUS_COLOR[cert.status] ?? "gray"}>{cert.status}</Badge>
                </div>
                <div className="text-xs text-gray-500 space-y-0.5 mb-3">
                  <p>{cert.equipmentCalibrated || cert.equipment || cert.instrument || "—"}</p>
                  <p>Expires: {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : "—"}</p>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 text-xs"
                    onClick={() => navigate(`/certifications/generate?id=${cert.id}&tab=preview`)}
                  >
                    <Eye size={12} /> View
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 text-xs"
                    onClick={() => handleDownload(cert.id)}
                    disabled={actionLoading === cert.id}
                  >
                    <Download size={12} /> PDF
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 text-xs"
                    onClick={() => handleOpenEmailModal(cert.id, cert.customerName)}
                  >
                    <Mail size={12} /> Email
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 text-xs"
                    onClick={() => handleDelete(cert.id, cert.certificateNumber)}
                    disabled={actionLoading === cert.id}
                  >
                    <Trash2 size={12} /> Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Email Modal */}
      {emailModal && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 99999 }}
          onClick={() => setEmailModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Send Certificate</h2>
              <button
                type="button"
                onClick={() => setEmailModal(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 mb-4">
                Enter the recipient email address for{" "}
                <span className="font-semibold">{emailModal.customerName}</span>'s certificate.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
                placeholder="recipient@example.com"
                className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEmailModal(null)}
                disabled={sending}
                className="px-4 py-2 border border-gray-200 text-sm rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sending || !emailTo.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 flex items-center gap-2"
              >
                <Mail size={14} />
                {sending ? "Sending..." : "Send Certificate"}
              </button>
            </div>
          </div>
        </div>,
        document.getElementById("modal-root") ?? document.body
      )}
    </Layout>
  );
};

export default CertificationListPage;
