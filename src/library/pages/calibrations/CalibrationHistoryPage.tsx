import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Search } from "lucide-react";
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

  const headers = [
    "Equipment",
    "Serial No",
    "Calibrated On",
    "Next Due",
    "Technician",
    "Status",
  ];

  const data = calibrations.map((c) => [
    c.equipmentName,
    c.serialNumber,
    new Date(c.calibrationDate).toLocaleDateString(),
    new Date(c.nextDueDate).toLocaleDateString(),
    c.technician,
    <Badge key={c.id} color={STATUS_COLOR[c.status] ?? "gray"}>
      {c.status}
    </Badge>,
  ]);

  return (
    <Layout
      pageTitle="Calibration History"
      pageSubtitle={`View all past calibration records. ${count ? `(${count} total)` : ""}`}
      action={
        <Button
          className="flex items-center"
          onClick={() => navigate("/calibrations/add")}
        >
          <Plus size={16} className="mr-2" /> Add Calibration
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
            placeholder="Search equipment or serial number..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="passed">Passed</option>
          <option value="due-soon">Due Soon</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading records...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <Card>
          {data.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No calibration records found.
            </p>
          ) : (
            <Table headers={headers} data={data} />
          )}
        </Card>
      )}
    </Layout>
  );
};

export default CalibrationHistoryPage;
