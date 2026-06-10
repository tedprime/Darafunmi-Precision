import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
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

  // Email modal state
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
    if (!confirm(`Delete certificate ${certNo}?`)) return;
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
      toast.success(`Certificate sent to ${emailTo} successfully!`);
      setEmailModal(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send email.";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const headers = ["Certificate No", "Recipient", "Equipment", "Expiry Date", "Status", "Actions"];

  const data = certs.map((cert) => [
    cert.certificateNumber,
    cert.customerName,
    // Handle different field names the list API might return
    cert.equipmentCalibrated || cert.equipment || cert.instrument || "—",
    cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : "—",
    <Badge key={`status-${cert.id}`} color={STATUS_COLOR[cert.status] ?? "gray"}>
      {cert.status}
    </Badge>,
    <div key={`actions-${cert.id}`} className="flex space-x-2">
      <button
        type="button"
        title="Preview"
        className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        onClick={(e) => { e.stopPropagation(); navigate(`/certifications/generate?id=${cert.id}&tab=preview`); }}
        disabled={actionLoading === cert.id}
      >
        <Eye size={16} />
      </button>
      <button
        type="button"
        title="Download PDF"
        className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        onClick={(e) => { e.stopPropagation(); handleDownload(cert.id); }}
        disabled={actionLoading === cert.id}
      >
        {actionLoading === cert.id ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <Download size={16} />
        )}
      </button>
      <button
        type="button"
        title={`Email PDF to ${cert.customerName}`}
        className="p-1 border border-blue-200 rounded text-blue-500 hover:bg-blue-50 disabled:opacity-40"
        onClick={(e) => { e.stopPropagation(); handleOpenEmailModal(cert.id, cert.customerName); }}
        disabled={actionLoading === cert.id}
      >
        <Mail size={16} />
      </button>
      <button
        type="button"
        title="Delete"
        className="p-1 border border-red-100 rounded text-red-500 hover:bg-red-50 disabled:opacity-40"
        onClick={(e) => { e.stopPropagation(); handleDelete(cert.id, cert.certificateNumber); }}
        disabled={actionLoading === cert.id}
      >
        <Trash2 size={16} />
      </button>
    </div>,
  ]);

  return (
    <Layout
      pageTitle="Certifications"
      pageSubtitle={`Manage all issued certificates${count ? ` (${count} total)` : ""}`}
      action={
        <Button className="flex items-center" onClick={() => navigate("/certifications/generate")}>
          <Plus size={16} className="mr-2" /> Generate Certificate
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by certificate number or customer name..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
        <Card>
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-4" />)}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, j) => <Skeleton key={j} className="h-8" />)}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-yellow-500 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load certificates</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">All Certificates</h3>
          {data.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No certificates found.</p>
          ) : (
            <Table headers={headers} data={data} />
          )}
        </Card>
      )}

      {/* Email Modal */}
      {emailModal && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 99999, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setEmailModal(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-full mx-4 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Send Certificate</h2>
              <button
                type="button"
                onClick={() => setEmailModal(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 mb-5">
                Enter the recipient email address for{" "}
                <span className="font-semibold">{emailModal.customerName}</span>'s certificate.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
                placeholder="recipient@example.com"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEmailModal(null)}
                disabled={sending}
                className="px-4 py-2 border border-gray-300 text-sm rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sending || !emailTo.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-40 flex items-center gap-2"
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