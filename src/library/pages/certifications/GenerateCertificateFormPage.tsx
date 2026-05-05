import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Plus, Trash2, Download } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const GenerateCertificateFormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Layout
      pageTitle="Generate Certificate"
      pageSubtitle="Create a new calibration certificate."
    >
      <div className="flex items-center mb-6">
        <span
          onClick={() => navigate("/certifications/generate")}
          className={`font-medium pb-1 mr-4 cursor-pointer ${
            location.pathname === "/certifications/generate"
              ? "text-gray-800 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
        >
          Form
        </span>
        <span
          onClick={() => navigate("/certifications/generate/preview")}
          className={`font-medium pb-1 cursor-pointer ${
            location.pathname === "/certifications/generate/preview"
              ? "text-gray-800 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
        >
          Preview
        </span>
      </div>

      <form className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Certificate Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="certNo"
              label="Certificate Number"
              placeholder="e.g., DPT/CAL/2025/001"
            />
            <Input id="calDate" label="Calibration Date" type="date" />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="custName"
              label="Customer Name"
              placeholder="Enter customer name"
            />
            <Input
              id="custAddress"
              label="Customer Address"
              placeholder="Enter customer address"
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Instrument Description
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="equipCalibrated"
              label="Equipment Calibrated"
              placeholder="e.g., Stainless Steel Ruler"
            />
            <Input
              id="equipLocation"
              label="Equipment Location"
              placeholder="e.g., Laboratory"
            />
            <Input
              id="idNo"
              label="Identification No."
              placeholder="e.g., N/A"
            />
            <Input id="scale" label="Scale" placeholder="e.g., cm/inch" />
            <Input
              id="scaleRange"
              label="Scale Range"
              placeholder="e.g., 30cm"
            />
            <Input
              id="scaleDiv"
              label="Scale Division"
              placeholder="e.g., 1mm"
            />
            <Input
              id="maxError"
              label="Max Scale Error Permitted"
              placeholder="e.g., 0.1mm"
            />
            <Input
              id="refInst"
              label="Reference Instrument"
              placeholder="e.g., Standard Meter Rule"
            />
            <Input
              id="refInstSn"
              label="Reference Instrument S/N"
              placeholder="e.g., 22708"
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Environmental Conditions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="temp"
              label="Temperature"
              placeholder="e.g., 23°C ± 2°C"
            />
            <Input
              id="humidity"
              label="Relative Humidity"
              placeholder="e.g., 50% ± 10%"
            />
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Calibration Results
            </h3>
            <Button
              type="button"
              variant="secondary"
              className="text-xs py-1 px-2 flex items-center"
            >
              <Plus size={14} className="mr-1" /> Add Row
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Standard Value (cm)
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Measured Value (cm)
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Deviation (cm)
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[1, 2, 3].map(row => (
                  <tr key={row}>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-2 text-red-500">
                      <button type="button">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Additional Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Physical Examination Notes
              </label>
              <textarea
                rows={2}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter examination notes..."
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments
              </label>
              <textarea
                rows={2}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter comments..."
              ></textarea>
            </div>
            <Input
              id="perfBy"
              label="Performed By"
              placeholder="Engineer name"
            />
            <Input
              id="perfTitle"
              label="Performed By Title"
              placeholder="e.g., Chief Engineer"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="recDate"
                label="Recommended Recalibration Date"
                type="date"
              />
              <Input id="expDate" label="Expiry Date" type="date" />
            </div>
          </div>
        </Card>

        <div className="flex space-x-4">
          <Button type="submit" className="flex items-center">
            <Download size={16} className="mr-2" /> Generate & Download PDF
          </Button>
          <Button type="button" variant="secondary">
            Save as Draft
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default GenerateCertificateFormPage;
