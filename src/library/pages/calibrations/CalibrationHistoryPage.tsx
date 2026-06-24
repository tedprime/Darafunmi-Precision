import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Search, TriangleAlert } from "lucide-react";
import { getCalibrations } from "../../../services/calibration.jsx";

interface Calibration {
  id: number;
  equipmentName: string;
  serialNumber: string;
  calibrationDate: string;
  nextDueDate: string;
  technician: string;
  status: "passed" | "due-soon" | "overdue" | string;
}

const STATUS_COLOR: Record<string, "green" | "yellow" | "red" | "gray"> = {
  passed: "green",
  "due-soon": "yellow",
  overdue: "red",
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const CalibrationHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  const [calibrations, setCalibrations] = useState<Calibration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    getCalibrations({ search, status })
      .then(({ data, count }) => {
        setCalibrations(data);
        setCount(count);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, status]);

  return (
    <Layout
      pageTitle="Calibration History"
      pageSubtitle={`View all past calibration records. ${count ? `(${count} total)` : ""}`}
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
            placeholder="Search equipment or serial number..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="passed">Passed</option>
          <option value="due-soon">Due Soon</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-8" />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load calibration records</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
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
                    {["Equipment", "Serial No", "Calibrated On", "Next Due", "Technician", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {calibrations.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-900 whitespace-normal break-words">{c.equipmentName}</td>
                      <td className="px-4 py-3.5 text-sm font-mono text-gray-600">{c.serialNumber}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{new Date(c.calibrationDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{new Date(c.nextDueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-normal break-words">{c.technician}</td>
                      <td className="px-4 py-3.5">
                        <Badge color={STATUS_COLOR[c.status] ?? "gray"}>{c.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {calibrations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No calibration records found.</p>
            ) : calibrations.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 break-words">{c.equipmentName}</p>
                    <p className="text-xs font-mono text-gray-500 mt-0.5">{c.serialNumber}</p>
                  </div>
                  <Badge color={STATUS_COLOR[c.status] ?? "gray"}>{c.status}</Badge>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Calibrated: {new Date(c.calibrationDate).toLocaleDateString()}</p>
                  <p>Next due: {new Date(c.nextDueDate).toLocaleDateString()}</p>
                  <p>Technician: {c.technician}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
};

export default CalibrationHistoryPage;
