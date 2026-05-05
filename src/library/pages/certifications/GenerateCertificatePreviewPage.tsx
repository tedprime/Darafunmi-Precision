import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Table from "../../components/ui/Table";
import { useNavigate, useLocation } from "react-router-dom";

const GenerateCertificatePreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const calibrationResultsHeaders = [
    "Standard Value (cm)",
    "Measured Value (cm)",
    "Deviation (cm)",
  ];
  const calibrationResultsData = [
    ["0.00", "0.00", "0.00"],
    ["10.00", "10.00", "0.00"],
  ];

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

      <Card className="max-w-3xl mx-auto p-8 border border-gray-200">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="bg-blue-600 text-white p-2 rounded-md inline-block font-bold text-lg mb-2">
              DPT
            </div>
            <p className="text-sm text-gray-700">
              Darafunmi Precision Technologies Ltd.
            </p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>RC: 650820</p>
            <p>17, Isheri Road, Suite 9</p>
            <p>Avis Bus-Stop, Aguda-Ogba</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-center mb-8">
          Certificate of Calibration
        </h3>

        <div className="mb-6">
          <p className="font-semibold text-gray-800 mb-2">
            CUSTOMER INFORMATION:
          </p>
          <p className="text-sm text-gray-700">ABVEE INDUSTRIES LTD.</p>
          <p className="text-sm text-gray-700">KM 1, IJOKO ROAD,</p>
          <p className="text-sm text-gray-700">SANGO – OTTA, OGUN STATE</p>
          <p className="text-sm text-gray-700">NIGERIA.</p>
        </div>

        <div className="mb-6">
          <p className="font-semibold text-gray-800 mb-2">
            CERTIFICATE NO.: DPT/CAL/2025/001
          </p>
          <p className="font-semibold text-gray-800 mb-2">
            INSTRUMENT DESCRIPTION:
          </p>
          <p className="text-sm text-gray-700">
            EQUIPMENT CALIBRATED: STAINLESS STEEL RULER
          </p>
          <p className="text-sm text-gray-700">
            EQUIPMENT LOCATION: LABORATORY
          </p>
        </div>

        <div className="mb-6">
          <p className="font-semibold text-gray-800 mb-2">
            RESULTS OF CALIBRATION
          </p>
          <Table
            headers={calibrationResultsHeaders}
            data={calibrationResultsData}
            className="w-full"
          />
        </div>

        <div className="mb-8">
          <p className="font-semibold text-gray-800 mb-2">Calibration Date:</p>
          <p className="text-sm text-gray-700">29 – 09- 2025</p>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Calibration, Laboratory/Medical Equipment, Process Analytical
          Instrument Services
        </p>
      </Card>

      <div className="flex justify-center mt-6 space-x-4">
        <Button
          variant="secondary"
          onClick={() => navigate("/certifications/generate")}
        >
          Back to Form
        </Button>
        <Button>Generate Certificate</Button>
      </div>
    </Layout>
  );
};

export default GenerateCertificatePreviewPage;
