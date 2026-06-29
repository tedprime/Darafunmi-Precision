import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Search, TriangleAlert, FileCheck, Loader2, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { getCalibrations, deleteCalibration, generateCertificateFromCalibration } from "../../../services/calibration.jsx";
import { confirmDialog } from "../../components/common/confirmDialog";
import { useToast } from "../../../services/useToast";

interface Calibration {
  id: number;
  equipmentName: string;
  serialNumber: string;
  calibrationDate: string;
  nextDueDate: string;
  technician: string;
  status: "active" | "due-soon" | "expired" | string;
  serviceType?: string;
  certificateId?: number | null;
  client?: { id: number; name: string } | null;
}

const STATUS_COLOR: Record<string, "green" | "yellow" | "red" | "gray"> = {
  active:     "green",
  "due-soon": "yellow",
  expired:    "red",
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const CalibrationHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast() as { toast: { error: (m: string) => void; success: (m: string) => void; info: (m: string) => void } };

  const [calibrations, setCalibrations] = useState<Calibration[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [search,       setSearch]       = useState("");
  const [status,       setStatus]       = useState("");
  const [count,        setCount]        = useState(0);
  const [generating,   setGenerating]   = useState<number | null>(null);
  const [deleting,     setDeleting]     = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    getCalibrations({ search, status })
      .then(({ data, count }: { data: Calibration[]; count: number }) => {
        setCalibrations(data);
        setCount(count);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (cal: Calibration) => {
    if (!(await confirmDialog({
      title: "Delete calibration record?",
      description: `"${cal.equipmentName}" will be permanently removed. This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
    }))) return;
    setDeleting(cal.id);
    try {
      await deleteCalibration(cal.id);
      toast.success("Calibration record deleted.");
      setCalibrations((prev) => prev.filter((c) => c.id !== cal.id));
      setCount((n) => n - 1);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete calibration.");
    } finally {
      setDeleting(null);
    }
  };

  const handleGenerateCert = async (cal: Calibration) => {
    // If already has cert, just navigate to it
    if (cal.certificateId) {
      navigate(`/certifications?id=${cal.certificateId}&tab=preview`);
      return;
    }
    setGenerating(cal.id);
    try {
      const res: any = await generateCertificateFromCalibration(cal.id);
      const cert = res.data;
      if (res.alreadyExists) {
        toast.info("Certificate already exists — opening it.");
      } else {
        toast.success("Certificate created successfully!");
        // Update local state so the row now shows "View Certificate"
        setCalibrations((prev) =>
          prev.map((c) => (c.id === cal.id ? { ...c, certificateId: cert.id } : c))
        );
      }
      navigate(`/certifications?id=${cert.id}&tab=preview`);
    } catch {
      toast.error("Failed to generate certificate. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <Layout
      pageTitle="Calibration History"
      pageSubtitle={`All calibration records.${count ? ` (${count} total)` : ""}`}
      action={
        <Button onClick={() => navigate("/calibrations/add")}>
          <Plus size={16} /> Add Calibration
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
            placeholder="Search equipment or serial number…"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="due-soon">Due Soon</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, j) => <Skeleton key={j} className="h-8" />)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load calibration records</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button onClick={load} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Desktop Table */}
          <div className="max-md:hidden bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {calibrations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No calibration records found.</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    {["Equipment", "Serial No", "Calibrated On", "Next Due", "Technician", "Status", "Certificate", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {calibrations.map((c) => {
                    const isGenerating = generating === c.id;
                    const hasCert      = Boolean(c.certificateId);
                    return (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3.5 text-sm font-medium text-gray-900 whitespace-normal break-words max-w-[180px]">{c.equipmentName}</td>
                        <td className="px-4 py-3.5 text-sm font-mono text-gray-600">{c.serialNumber || "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{c.calibrationDate ? new Date(c.calibrationDate).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{c.nextDueDate ? new Date(c.nextDueDate).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-normal break-words max-w-[140px]">{c.technician || "—"}</td>
                        <td className="px-4 py-3.5">
                          <Badge color={STATUS_COLOR[c.status] ?? "gray"}>{c.status}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          {hasCert ? (
                            <button
                              onClick={() => navigate(`/certifications?id=${c.certificateId}&tab=preview`)}
                              className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                            >
                              <ExternalLink size={12} /> View Certificate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenerateCert(c)}
                              disabled={isGenerating}
                              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 font-medium transition-colors"
                            >
                              {isGenerating
                                ? <><Loader2 size={12} className="animate-spin" /> Generating…</>
                                : <><FileCheck size={12} /> Generate Certificate</>
                              }
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => navigate(`/calibrations/edit/${c.id}`)}
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 font-medium transition-colors"
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(c)}
                              disabled={deleting === c.id}
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 disabled:opacity-50 font-medium transition-colors"
                            >
                              {deleting === c.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {calibrations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No calibration records found.</p>
            ) : calibrations.map((c) => {
              const isGenerating = generating === c.id;
              const hasCert      = Boolean(c.certificateId);
              return (
                <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 break-words">{c.equipmentName}</p>
                      {c.serialNumber && <p className="text-xs font-mono text-gray-500 mt-0.5">{c.serialNumber}</p>}
                    </div>
                    <Badge color={STATUS_COLOR[c.status] ?? "gray"}>{c.status}</Badge>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1 mb-3">
                    {c.calibrationDate && <p>Calibrated: {new Date(c.calibrationDate).toLocaleDateString()}</p>}
                    {c.nextDueDate && <p>Next due: {new Date(c.nextDueDate).toLocaleDateString()}</p>}
                    {c.technician && <p>Technician: {c.technician}</p>}
                    {c.client?.name && <p>Client: {c.client.name}</p>}
                  </div>
                  {hasCert ? (
                    <button
                      onClick={() => navigate(`/certifications?id=${c.certificateId}&tab=preview`)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 font-medium transition-colors"
                    >
                      <ExternalLink size={12} /> View Certificate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGenerateCert(c)}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50 font-medium transition-colors"
                    >
                      {isGenerating
                        ? <><Loader2 size={12} className="animate-spin" /> Generating…</>
                        : <><FileCheck size={12} /> Generate Certificate</>
                      }
                    </button>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => navigate(`/calibrations/edit/${c.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      disabled={deleting === c.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium transition-colors"
                    >
                      {deleting === c.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Layout>
  );
};

export default CalibrationHistoryPage;
