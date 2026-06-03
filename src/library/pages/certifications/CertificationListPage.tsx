import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Eye, Download, Mail, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getCertifications,
  deleteCertification,
  generatePdf,
  sendCertificateEmailToClient,
} from "../../../services/certification.jsx";

interface Certificate {
  id: number;
  certificateNumber: string;
  customerName: string;
  equipmentCalibrated: string;
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

// ── Toast ─────────────────────────────────────────────────────────────────────
type ToastType = "success" | "error";
interface Toast { id: number; message: string; type: ToastType }

const ToastContainer = ({ toasts }: { toasts: Toast[] }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`px-4 py-3 rounded-lg shadow-lg text-sm text-white transition-all ${
          t.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}
      >
        {t.message}
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const CertificationListPage: React.FC = () => {
  const navigate = useNavigate();

  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [count, setCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

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
      showToast("Certificate deleted.", "success");
    } catch {
      showToast("Failed to delete certificate.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (id: number, certNo: string) => {
    try {
      setActionLoading(id);
      const blob = await generatePdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${certNo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Failed to generate PDF.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendEmail = async (id: number, customerName: string) => {
    if (!confirm(`Send certificate PDF to ${customerName}'s email on file?`)) return;
    try {
      setActionLoading(id);
      await sendCertificateEmailToClient(id);
      showToast(`Certificate sent to ${customerName} successfully!`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send email.";
      showToast(message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const headers = [
    "Certificate No",
    "Client",
    "Equipment",
    "Expiry Date",
    "Status",
    "Actions",
  ];

  const data = certs.map((cert) => [
    cert.certificateNumber,
    cert.customerName,
    cert.equipmentCalibrated,
    cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : "—",
    <Badge key={`status-${cert.id}`} color={STATUS_COLOR[cert.status] ?? "gray"}>
      {cert.status}
    </Badge>,
    <div key={`actions-${cert.id}`} className="flex space-x-2">
      <button
        title="Preview"
        className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        onClick={() => navigate(`/certifications/generate/preview?id=${cert.id}`)}
        disabled={actionLoading === cert.id}
      >
        <Eye size={16} />
      </button>
      <button
        title="Download PDF"
        className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        onClick={() => handleDownload(cert.id, cert.certificateNumber)}
        disabled={actionLoading === cert.id}
      >
        <Download size={16} />
      </button>
      <button
        title={`Email PDF to ${cert.customerName}`}
        className="p-1 border border-blue-200 rounded text-blue-500 hover:bg-blue-50 disabled:opacity-40"
        onClick={() => handleSendEmail(cert.id, cert.customerName)}
        disabled={actionLoading === cert.id}
      >
        {actionLoading === cert.id ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <Mail size={16} />
        )}
      </button>
      <button
        title="Delete"
        className="p-1 border border-red-100 rounded text-red-500 hover:bg-red-50 disabled:opacity-40"
        onClick={() => handleDelete(cert.id, cert.certificateNumber)}
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
        <Button
          className="flex items-center"
          onClick={() => navigate("/certifications/generate")}
        >
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
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-8" />
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-4">⚠️</p>
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            All Certificates
          </h3>
          {data.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No certificates found.
            </p>
          ) : (
            <Table headers={headers} data={data} />
          )}
        </Card>
      )}

      <ToastContainer toasts={toasts} />
    </Layout>
  );
};

export default CertificationListPage;