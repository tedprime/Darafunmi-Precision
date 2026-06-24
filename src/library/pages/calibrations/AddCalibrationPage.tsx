import React, { useState, useEffect } from "react";
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
  AlertCircle,
  Loader2,
  Save,
  Wrench,
  CalendarClock,
  StickyNote,
  User,
  CalendarCheck,
  CalendarX,
} from "lucide-react";
import { createCalibration } from "../../../services/calibration.jsx";
import { getClients } from "../../../services/client.jsx";

interface Client { id: number; name: string; }

const inputCls =
  "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors";

const todayISO = () => new Date().toISOString().split("T")[0];


const AddCalibrationPage: React.FC = () => {
  const navigate = useNavigate();

  const [equipmentName,   setEquipmentName]   = useState("");
  const [serialNumber,    setSerialNumber]     = useState("");
  const [calibrationDate, setCalibrationDate] = useState(todayISO());
  const [nextDueDate,     setNextDueDate]      = useState("");
  const [technician,      setTechnician]       = useState("");
  const [location,        setLocation]         = useState("");
  const [notes,           setNotes]            = useState("");
  const [clientId,        setClientId]         = useState("");

  const [clients,    setClients]    = useState<Client[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    getClients({ limit: 100 }).catch(() => ({ data: [] })).then((res: any) => {
      setClients(res.data ?? []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!equipmentName.trim()) {
      setError("Equipment name is required.");
      return;
    }
    if (!calibrationDate) {
      setError("Calibration date is required.");
      return;
    }

    setSubmitting(true);
    try {
      await createCalibration({
        equipmentName:   equipmentName.trim(),
        serialNumber:    serialNumber.trim() || undefined,
        calibrationDate,
        nextDueDate:     nextDueDate || undefined,
        technician:      technician.trim() || undefined,
        location:        location.trim() || undefined,
        notes:           notes.trim() || undefined,
        ...(clientId && { clientId: Number(clientId) }),
      });
      navigate("/calibrations/history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save calibration.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Add Calibration" pageSubtitle="Record a new calibration entry.">
      <form onSubmit={handleSubmit}>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── Main column ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Equipment details */}
            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Wrench size={14} className="text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">Equipment Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Equipment name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Equipment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pressure Gauge, Digital Multimeter"
                    value={equipmentName}
                    onChange={(e) => setEquipmentName(e.target.value)}
                    className={inputCls}
                    autoFocus
                  />
                </div>

                {/* Serial number */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Serial Number
                    <span className="text-gray-400 font-normal ml-1">— optional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SN-2024-00123"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {/* Technician */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Technician
                    <span className="text-gray-400 font-normal ml-1">— optional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Engr. Adebayo"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Location
                    <span className="text-gray-400 font-normal ml-1">— optional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lab A, Site B"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {/* Client */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <User size={11} className="text-gray-400" />
                    Client
                    <span className="text-gray-400 font-normal ml-0.5">— optional</span>
                  </label>
                  <Select
                    value={clientId || "none"}
                    onValueChange={(v) => setClientId(v === "none" ? "" : v)}
                  >
                    <SelectTrigger className="w-full h-10 text-sm border-gray-200 rounded-lg">
                      <SelectValue placeholder="Select client…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No client</SelectItem>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <StickyNote size={14} className="text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">Notes</h3>
                <span className="text-xs text-gray-400 font-normal ml-0.5">— optional</span>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observations, conditions, standards used, remarks…"
                className="resize-none text-sm min-h-[100px]"
              />
            </section>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5 lg:sticky lg:top-6">

            {/* Schedule card */}
            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <CalendarClock size={14} className="text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">Schedule</h3>
              </div>

              <div className="space-y-4">
                {/* Calibration date */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                      <CalendarCheck size={11} className="text-gray-400" />
                      Calibration Date <span className="text-red-500">*</span>
                    </label>
                    {calibrationDate !== todayISO() && (
                      <button
                        type="button"
                        onClick={() => setCalibrationDate(todayISO())}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                      >
                        Today
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={calibrationDate}
                    onChange={(e) => setCalibrationDate(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {/* Next due date */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <CalendarX size={11} className="text-gray-400" />
                    Next Due Date
                    <span className="text-gray-400 font-normal ml-0.5">— optional</span>
                  </label>
                  <input
                    type="date"
                    value={nextDueDate}
                    min={calibrationDate || undefined}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {/* Status note */}
                <p className="text-xs text-gray-400 pt-1">
                  Status is set automatically — <span className="font-medium text-gray-500">Passed</span>, <span className="font-medium text-gray-500">Due Soon</span> (≤ 30 days), or <span className="font-medium text-gray-500">Overdue</span> — based on the next due date.
                </p>
              </div>
            </section>

            {/* Actions */}
            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {submitting
                  ? <><Loader2 size={15} className="animate-spin" />Saving…</>
                  : <><Save size={15} />Save Calibration</>
                }
              </button>
              <button
                type="button"
                onClick={() => navigate("/calibrations/history")}
                disabled={submitting}
                className="w-full px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </section>
          </div>
        </div>
      </form>
    </Layout>
  );
};

export default AddCalibrationPage;
