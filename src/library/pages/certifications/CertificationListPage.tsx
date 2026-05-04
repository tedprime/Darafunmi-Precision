import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Eye, Download, Mail } from "lucide-react";

const CertificationListPage: React.FC = () => {
  const headers = [
    "Certificate No",
    "Client",
    "Equipment",
    "Expiry Date",
    "Status",
    "Actions",
  ];

  const renderActions = () => (
    <div className="flex space-x-2">
      <button className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">
        <Eye size={16} />
      </button>
      <button className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">
        <Download size={16} />
      </button>
      <button className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">
        <Mail size={16} />
      </button>
    </div>
  );

  const renderStatus = (status: string, days: string) => {
    let color: "yellow" | "green" | "red" = "green";
    if (status === "Expiring Soon") color = "yellow";
    if (status === "Expired") color = "red";

    return (
      <div className="flex items-center space-x-2">
        <Badge color={color}>{status}</Badge>
        {days && <span className="text-xs text-gray-500">{days}</span>}
      </div>
    );
  };

  const data = [
    [
      "DPT/CAL/2024-156",
      "Acme Corp",
      "Pressure Gauge",
      "2025-05-15",
      renderStatus("Expiring Soon", "17 days"),
      renderActions(),
    ],
    [
      "DPT/CAL/2024-142",
      "Tech Solutions Inc",
      "Temperature Sensor",
      "2025-05-22",
      renderStatus("Expiring Soon", "24 days"),
      renderActions(),
    ],
    [
      "DPT/CAL/2024-138",
      "Global Industries",
      "Flow Meter",
      "2025-06-10",
      renderStatus("Active", "43 days"),
      renderActions(),
    ],
    [
      "DPT/CAL/2024-125",
      "Manufacturing Ltd",
      "Pressure Gauge",
      "2025-05-08",
      renderStatus("Expiring Soon", "10 days"),
      renderActions(),
    ],
    [
      "DPT/CAL/2024-100",
      "Industrial Corp",
      "Calibration Block",
      "2025-03-15",
      renderStatus("Expired", ""),
      renderActions(),
    ],
  ];

  return (
    <Layout pageTitle="Certifications">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Manage all issued certificates</p>
        <Button className="flex items-center">
          <Plus size={16} className="mr-2" /> Generate Certificate
        </Button>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          All Certificates
        </h3>
        <Table headers={headers} data={data} />
      </Card>
    </Layout>
  );
};

export default CertificationListPage;
