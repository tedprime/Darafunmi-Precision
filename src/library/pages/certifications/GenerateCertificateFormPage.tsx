import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Plus, Trash2, Download, Eye } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

type TableType = "3col" | "4col";

interface CalibrationRow {
  standardValue: string;
  measuredValue: string;
  asFoundValue: string;
  asLeftValue: string;
  deviation: string;
}

const emptyRow = (): CalibrationRow => ({
  standardValue: "", measuredValue: "", asFoundValue: "", asLeftValue: "", deviation: "",
});

const GenerateCertificateFormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tableType, setTableType] = useState<TableType>("3col");
  const [tableUnit, setTableUnit] = useState("cm");
  const [rows, setRows] = useState<CalibrationRow[]>([emptyRow(), emptyRow(), emptyRow()]);

  const addRow = () => setRows(r => [...r, emptyRow()]);
  const removeRow = (i: number) => setRows(r => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof CalibrationRow, val: string) =>
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  const tab = (p: string) =>
    `font-medium pb-1 cursor-pointer mr-4 ${location.pathname === p
      ? "text-gray-800 border-b-2 border-blue-600"
      : "text-gray-500 hover:text-gray-700"}`;

  return (
    <Layout pageTitle="Generate Certificate" pageSubtitle="Create a new calibration certificate.">
      <div className="flex items-center mb-6">
        <span className={tab("/certifications/generate")} onClick={() => navigate("/certifications/generate")}>Form</span>
        <span className={tab("/certifications/generate/preview")} onClick={() => navigate("/certifications/generate/preview")}>Preview</span>
      </div>

      <form className="space-y-6">

        {/* Certificate Information */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Certificate Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input id="certNo" label="Certificate Number" placeholder="e.g., DPT/CAL/2025/001" />
            <Input id="calDate" label="Calibration Date" type="date" />
          </div>
        </Card>

        {/* Customer Information */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input id="custName" label="Customer Name" placeholder="Enter company name" />
            <div>
              <label htmlFor="custAddress" className="block text-sm font-medium text-gray-700 mb-1">Customer Address</label>
              <textarea id="custAddress" rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="KM 1, Ijoko Road, Sango - Otta, Ogun State, Nigeria." />
            </div>
          </div>
        </Card>

        {/* Instrument Description */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Instrument Description</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input id="equipCalibrated" label="Equipment Calibrated" placeholder="e.g., STAINLESS STEEL RULER" />
            <Input id="equipLocation" label="Equipment Location" placeholder="e.g., LABORATORY" />
            <Input id="idNo" label="Identification No." placeholder="e.g., N/A" />
            <Input id="scale" label="Scale" placeholder="e.g., cm/Inch or Kilogramme (Kg)" />
            <Input id="scaleRange" label="Scale Range" placeholder="e.g., 30cm or 2tons" />
            <Input id="scaleDiv" label="Scale Division" placeholder="e.g., 1mm or 350kg" />
            <Input id="maxError" label="Maximum Scale Error Permitted" placeholder="e.g., 0.1mm or 200g" />
            <Input id="refInst" label="Reference Instrument Used" placeholder="e.g., STANDARD METER RULE" />
            <Input id="refInstSn" label="Reference Instrument S/N" placeholder="e.g., 22708" />
          </div>
        </Card>

        {/* Environmental Conditions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Laboratory Environmental Conditions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input id="temp" label="Temperature" placeholder="e.g., 23°C ± 2°C" />
            <Input id="humidity" label="Relative Humidity" placeholder="e.g., 50% ± 10%" />
          </div>
        </Card>

        {/* Physical Examination */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Results of Physical Examination</h3>
          <textarea id="physExam" rows={3}
            defaultValue="An examination of this Measuring Instrument mentioned above showed no visually apparent flaw and it was suitable for calibration."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </Card>

        {/* Calibration Results */}
        <Card>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h3 className="text-lg font-semibold text-gray-800">Results of Calibration</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Columns:</label>
                <select value={tableType} onChange={e => setTableType(e.target.value as TableType)}
                  className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                  <option value="3col">3-col (Standard / Measured / Deviation)</option>
                  <option value="4col">4-col (Standard / As Found / As Left / Deviation)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Unit:</label>
                <input type="text" value={tableUnit} onChange={e => setTableUnit(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1.5 text-sm w-20 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="cm" />
              </div>
              <Button type="button" variant="secondary" className="text-xs py-1 px-3 flex items-center" onClick={addRow}>
                <Plus size={14} className="mr-1" /> Add Row
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-md text-sm">
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
                      <input type="text" value={row.standardValue}
                        onChange={e => updateRow(i, "standardValue", e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-center focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00" />
                    </td>
                    {tableType === "3col" ? (
                      <td className="px-3 py-2 border border-gray-200">
                        <input type="text" value={row.measuredValue}
                          onChange={e => updateRow(i, "measuredValue", e.target.value)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-center focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00" />
                      </td>
                    ) : (
                      <>
                        <td className="px-3 py-2 border border-gray-200">
                          <input type="text" value={row.asFoundValue}
                            onChange={e => updateRow(i, "asFoundValue", e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-center focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00" />
                        </td>
                        <td className="px-3 py-2 border border-gray-200">
                          <input type="text" value={row.asLeftValue}
                            onChange={e => updateRow(i, "asLeftValue", e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-center focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00" />
                        </td>
                      </>
                    )}
                    <td className="px-3 py-2 border border-gray-200">
                      <input type="text" value={row.deviation}
                        onChange={e => updateRow(i, "deviation", e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-center focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00" />
                    </td>
                    <td className="px-3 py-2 text-center border border-gray-200">
                      <button type="button" onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Additional Information */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <input type="text" id="comments" defaultValue="Certified Okay"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Certified Okay" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input id="sonLabRef" label="SON Lab Reference No." placeholder="e.g., SON/NMI/L/2019/002" />
              <Input id="wmvCertNo" label="WMV Certificate No." defaultValue="WMV25054" placeholder="e.g., WMV25054" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input id="perfBy" label="Performed By" defaultValue="Daranijo Funminiyi A." placeholder="Engineer name" />
              <Input id="perfTitle" label="Title" defaultValue="Chief Engineer" placeholder="e.g., Chief Engineer" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input id="recDate" label="Recommended Recalibration Date" type="date" />
              <Input id="expDate" label="Expiry Date" type="date" />
            </div>
          </div>
        </Card>

        <div className="flex space-x-4">
          <Button type="submit" className="flex items-center">
            <Download size={16} className="mr-2" /> Generate &amp; Download PDF
          </Button>
          <Button type="button" variant="secondary" className="flex items-center"
                  onClick={() => navigate("/certifications/generate/preview")}>
            <Eye size={16} className="mr-2" /> Preview
          </Button>
          <Button type="button" variant="secondary">Save as Draft</Button>
        </div>
      </form>
    </Layout>
  );
};

export default GenerateCertificateFormPage;
