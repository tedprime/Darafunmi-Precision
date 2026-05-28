import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { createCalibration } from "../../../services/calibration.jsx";

const AddCalibrationPage: React.FC = () => {
  const navigate = useNavigate();

  const [equipmentName, setEquipmentName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [calibrationDate, setCalibrationDate] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [technician, setTechnician] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [clientId, setClientId] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!equipmentName.trim()) {
      setError("Equipment name is required.");
      return;
    }

    setSubmitting(true);
    try {
      await createCalibration({
        equipmentName: equipmentName.trim(),
        serialNumber: serialNumber.trim(),
        calibrationDate,
        nextDueDate,
        technician: technician.trim(),
        location: location.trim(),
        notes: notes.trim(),
        ...(clientId && { clientId: Number(clientId) }),
      });
      navigate("/calibrations/history");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save calibration.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      pageTitle="Add Calibration"
      pageSubtitle="Record a new calibration entry."
    >
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card className="w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Calibration Details
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <Input
              id="equipmentName"
              label="Equipment Name"
              placeholder="Enter equipment name"
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
            />
            <Input
              id="serialNumber"
              label="Serial Number"
              placeholder="Enter serial number"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
            <Input
              id="calibrationDate"
              label="Calibration Date"
              type="date"
              value={calibrationDate}
              onChange={(e) => setCalibrationDate(e.target.value)}
            />
            <Input
              id="nextDueDate"
              label="Next Due Date"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
            />
            <Input
              id="technician"
              label="Technician"
              placeholder="Enter technician name"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
            />
            <Input
              id="location"
              label="Location"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              id="clientId"
              label="Client ID (optional)"
              placeholder="Enter client ID"
              type="number"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter any additional notes"
            />
          </div>

          <div className="flex space-x-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Calibration"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/calibrations/history")}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
};

export default AddCalibrationPage;