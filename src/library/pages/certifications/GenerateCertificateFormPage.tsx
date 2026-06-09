import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Plus, Trash2, Download, Eye } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { createCertification } from "../../../services/certification.jsx";

type TableType = "3col" | "4col";

interface CalibrationRow {
  standardValue: string;
  measuredValue: string;
  asFoundValue: string;
  asLeftValue: string;
  deviation: string;
}

const emptyRow = (): CalibrationRow => ({
  standardValue: "",
  measuredValue: "",
  asFoundValue: "",
  asLeftValue: "",
  deviation: "",
});

const GenerateCertificateFormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [certNo, setCertNo] = useState("");
  const [calDate, setCalDate] = useState("");
  const [custName, setCustName] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [equipCalibrated, setEquipCalibrated] = useState("");
  const [equipLocation, setEquipLocation] = useState("");
  const [idNo, setIdNo] = useState("");
  const [scale, setScale] = useState("");
  const [scaleRange, setScaleRange] = useState("");
  const [scaleDiv, setScaleDiv] = useState("");
  const [maxError, setMaxError] = useState("");
  const [refInst, setRefInst] = useState("");
  const [refInstSn, setRefInstSn] = useState("");
  const [temp, setTemp] = useState("");
  const [humidity, setHumidity] = useState("");
  const [physExam, setPhysExam] = useState(
    "An examination of this Measuring Instrument mentioned above showed no visually apparent flaw and it was suitable for calibration.",
  );
  const [tableType, setTableType] = useState<TableType>("3col");
  const [tableUnit, setTableUnit] = useState("cm");
  const [rows, setRows] = useState<CalibrationRow[]>([
    emptyRow(),
    emptyRow(),
    emptyRow(),
  ]);
  const [comments, setComments] = useState("Certified Okay");
  const [sonLabRef, setSonLabRef] = useState("");
  const [wmvCertNo, setWmvCertNo] = useState("WMV25054");
  const [perfBy, setPerfBy] = useState("Daranijo Funminiyi A.");
  const [perfTitle, setPerfTitle] = useState("Chief Engineer");
  const [recDate, setRecDate] = useState("");
  const [expDate, setExpDate] = useState("");
  const [status, setStatus] = useState("draft");
  const [clientId, setClientId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRow = () => setRows((r) => [...r, emptyRow()]);
  const removeRow = (i: number) =>
    setRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof CalibrationRow, val: string) =>
    setRows((r) =>
      r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)),
    );

  const tab = (p: string) =>
    `font-medium pb-1 cursor-pointer mr-4 ${
      location.pathname === p
        ? "text-gray-800 border-b-2 border-blue-600"
        : "text-gray-500 hover:text-gray-700"
    }`;

  const buildCalibrationResults = () =>
    rows
      .filter((r) => r.standardValue || r.measuredValue || r.deviation)
      .map((r) => ({
        standardValue: r.standardValue,
        measuredValue: r.measuredValue,
        asFoundValue: r.asFoundValue,
        asLeftValue: r.asLeftValue,
        deviation: r.deviation,
      }));

  // Collect all current form values into a preview-ready object
  const buildPreviewData = () => ({
    certificateNumber: certNo,
    calibrationDate: calDate,
    recommendedRecalibDate: recDate,
    customerName: custName,
    customerAddress: custAddress,
    equipCalibrated,
    equipmentLocation: equipLocation,
    identificationNo: idNo,
    scale,
    scaleRange,
    scaleDivision: scaleDiv,
    maxScaleError: maxError,
    referenceInstrument: refInst,
    referenceInstrumentSN: refInstSn,
    temperature: temp,
    humidity,
    physicalExamText: physExam,
    tableType,
    tableUnit,
    calibrationResults: buildCalibrationResults(),
    comments,
    sonLabRef,
    wmvCertNo,
    performedBy: perfBy,
    performedByTitle: perfTitle,
    expiryDate: expDate,
    status,
  });

  const handlePreview = () => {
    navigate("/certifications/generate/preview", {
      state: { previewData: buildPreviewData() },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!certNo.trim()) {
      setError("Certificate number is required.");
      return;
    }

    setSubmitting(true);
    try {
      await createCertification({
        certificateNumber: certNo.trim(),
        ...(clientId && { clientId: Number(clientId) }),
        customerName: custName.trim(),
        customerAddress: custAddress.trim(),
        equipmentCalibrated: equipCalibrated.trim(),
        equipmentLocation: equipLocation.trim(),
        identificationNo: idNo.trim(),
        scale: scale.trim(),
        scaleRange: scaleRange.trim(),
        scaleDivision: scaleDiv.trim(),
        maxScaleError: maxError.trim(),
        referenceInstrument: refInst.trim(),
        referenceInstrumentSN: refInstSn.trim(),
        temperature: temp.trim(),
        humidity: humidity.trim(),
        tableType,
        tableUnit,
        physicalExamText: physExam.trim(),
        sonLabRef: sonLabRef.trim(),
        wmvCertNo: wmvCertNo.trim(),
        comments: comments.trim(),
        performedBy: perfBy.trim(),
        performedByTitle: perfTitle.trim(),
        calibrationDate: calDate,
        recommendedRecalibDate: recDate,
        expiryDate: expDate,
        status,
        calibrationResults: buildCalibrationResults(),
      });
      navigate("/certifications");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create certificate.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

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
          onClick={handlePreview}
        >
          Preview
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Certificate Information */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Certificate Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="certNo"
              label="Certificate Number"
              placeholder="e.g., DPT/CAL/2025/001"
              value={certNo}
              onChange={(e) => setCertNo(e.target.value)}
            />
            <Input
              id="calDate"
              label="Calibration Date"
              type="date"
              value={calDate}
              onChange={(e) => setCalDate(e.target.value)}
            />
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
            <Input
              id="clientId"
              label="Client ID (optional)"
              placeholder="e.g., 12"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </div>
        </Card>

        {/* Customer Information */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="custName"
              label="Customer Name"
              placeholder="Enter customer name"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
            />
            <Input
              id="custAddress"
              label="Customer Address"
              placeholder="Enter customer address"
              value={custAddress}
              onChange={(e) => setCustAddress(e.target.value)}
            />
          </div>
        </Card>

        {/* Instrument Description */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Instrument Description
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="equipCalibrated"
              label="Equipment Calibrated"
              placeholder="e.g., Vernier Caliper"
              value={equipCalibrated}
              onChange={(e) => setEquipCalibrated(e.target.value)}
            />
            <Input
              id="equipLocation"
              label="Equipment Location"
              placeholder="e.g., Lab A"
              value={equipLocation}
              onChange={(e) => setEquipLocation(e.target.value)}
            />
            <Input
              id="idNo"
              label="ID No."
              placeholder="e.g., DPT-001"
              value={idNo}
              onChange={(e) => setIdNo(e.target.value)}
            />
            <Input
              id="scale"
              label="Scale"
              placeholder="e.g., Metric"
              value={scale}
              onChange={(e) => setScale(e.target.value)}
            />
            <Input
              id="scaleRange"
              label="Scale Range"
              placeholder="e.g., 0 - 150mm"
              value={scaleRange}
              onChange={(e) => setScaleRange(e.target.value)}
            />
            <Input
              id="scaleDiv"
              label="Scale Division"
              placeholder="e.g., 0.02mm"
              value={scaleDiv}
              onChange={(e) => setScaleDiv(e.target.value)}
            />
            <Input
              id="maxError"
              label="Max Scale Error Permitted"
              placeholder="e.g., ±0.05mm"
              value={maxError}
              onChange={(e) => setMaxError(e.target.value)}
            />
            <Input
              id="refInst"
              label="Reference Instrument"
              placeholder="e.g., Gauge Block Set"
              value={refInst}
              onChange={(e) => setRefInst(e.target.value)}
            />
            <Input
              id="refInstSn"
              label="Reference Instrument S/N"
              placeholder="e.g., SN-20210045"
              value={refInstSn}
              onChange={(e) => setRefInstSn(e.target.value)}
            />
          </div>
        </Card>

        {/* Environmental Conditions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Environmental Conditions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="temp"
              label="Temperature"
              placeholder="e.g., 25°C"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
            />
            <Input
              id="humidity"
              label="Relative Humidity"
              placeholder="e.g., 60%"
              value={humidity}
              onChange={(e) => setHumidity(e.target.value)}
            />
          </div>
        </Card>

        {/* Physical Examination */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Physical Examination
          </h3>
          <textarea
            id="physExam"
            rows={3}
            value={physExam}
            onChange={(e) => setPhysExam(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </Card>

        {/* Calibration Results Table */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Calibration Results
          </h3>
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table Type
              </label>
              <select
                value={tableType}
                onChange={(e) => setTableType(e.target.value as TableType)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="3col">3 Column</option>
                <option value="4col">4 Column</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={tableUnit}
                onChange={(e) => setTableUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-24"
                placeholder="cm"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-center font-semibold text-gray-700 border border-gray-300">
                    Standard Value ({tableUnit})
                  </th>
                  {tableType === "3col" ? (
                    <th className="px-4 py-2 text-center font-semibold text-gray-700 border border-gray-300">
                      Measured Value ({tableUnit})
                    </th>
                  ) : (
                    <>
                      <th className="px-4 py-2 text-center font-semibold text-gray-700 border border-gray-300">
                        As Found Value ({tableUnit})
                      </th>
                      <th className="px-4 py-2 text-center font-semibold text-gray-700 border border-gray-300">
                        As Left Value ({tableUnit})
                      </th>
                    </>
                  )}
                  <th className="px-4 py-2 text-center font-semibold text-gray-700 border border-gray-300">
                    Deviation ({tableUnit})
                  </th>
                  <th className="px-4 py-2 w-10 border border-gray-300"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="text"
                        value={row.standardValue}
                        onChange={(e) => updateRow(i, "standardValue", e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-center focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </td>
                    {tableType === "3col" ? (
                      <td className="px-3 py-2 border border-gray-200">
                        <input
                          type="text"
                          value={row.measuredValue}
                          onChange={(e) => updateRow(i, "measuredValue", e.target.value)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-center focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </td>
                    ) : (
                      <>
                        <td className="px-3 py-2 border border-gray-200">
                          <input
                            type="text"
                            value={row.asFoundValue}
                            onChange={(e) => updateRow(i, "asFoundValue", e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-center focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-3 py-2 border border-gray-200">
                          <input
                            type="text"
                            value={row.asLeftValue}
                            onChange={(e) => updateRow(i, "asLeftValue", e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-center focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </td>
                      </>
                    )}
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="text"
                        value={row.deviation}
                        onChange={(e) => updateRow(i, "deviation", e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-center focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-3 py-2 text-center border border-gray-200">
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={15} /> Add Row
          </button>
        </Card>

        {/* Additional Information */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Additional Information
          </h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="comments"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Comments
              </label>
              <input
                type="text"
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Certified Okay"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="sonLabRef"
                label="SON Lab Reference No."
                placeholder="e.g., SON/NMI/L/2019/002"
                value={sonLabRef}
                onChange={(e) => setSonLabRef(e.target.value)}
              />
              <Input
                id="wmvCertNo"
                label="WMV Certificate No."
                placeholder="e.g., WMV25054"
                value={wmvCertNo}
                onChange={(e) => setWmvCertNo(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="perfBy"
                label="Performed By"
                placeholder="Engineer name"
                value={perfBy}
                onChange={(e) => setPerfBy(e.target.value)}
              />
              <Input
                id="perfTitle"
                label="Title"
                placeholder="e.g., Chief Engineer"
                value={perfTitle}
                onChange={(e) => setPerfTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="recDate"
                label="Recommended Recalibration Date"
                type="date"
                value={recDate}
                onChange={(e) => setRecDate(e.target.value)}
              />
              <Input
                id="expDate"
                label="Expiry Date"
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <div className="flex space-x-4">
          <Button type="submit" className="flex items-center" disabled={submitting}>
            <Download size={16} className="mr-2" />
            {submitting ? "Saving..." : "Save Certificate"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex items-center"
            onClick={handlePreview}
            disabled={submitting}
          >
            <Eye size={16} className="mr-2" /> Preview
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/certifications")}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default GenerateCertificateFormPage;