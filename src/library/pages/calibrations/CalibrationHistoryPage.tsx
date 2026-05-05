import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";

const CalibrationHistoryPage: React.FC = () => {
  const headers = [
    "Equipment",
    "Serial No",
    "Calibrated On",
    "Next Due",
    "Technician",
    "Status",
  ];

  const data = [
    [
      "Pressure Gauge A",
      "SN-001",
      "2025-01-10",
      "2026-01-10",
      "Emeka Obi",
      <Badge key="1" color="green">
        Passed
      </Badge>,
    ],
    [
      "Flow Meter B",
      "SN-002",
      "2025-02-14",
      "2026-02-14",
      "Tunde Adeyemi",
      <Badge key="2" color="green">
        Passed
      </Badge>,
    ],
    [
      "Thermometer C",
      "SN-003",
      "2025-03-05",
      "2025-09-05",
      "Chidi Nwosu",
      <Badge key="3" color="yellow">
        Due Soon
      </Badge>,
    ],
    [
      "Voltage Tester D",
      "SN-004",
      "2024-11-20",
      "2025-05-20",
      "Bola Fashola",
      <Badge key="4" color="red">
        Overdue
      </Badge>,
    ],
    [
      "Level Sensor E",
      "SN-005",
      "2025-04-01",
      "2026-04-01",
      "Ngozi Eze",
      <Badge key="5" color="green">
        Passed
      </Badge>,
    ],
  ];

  return (
    <Layout
      pageTitle="Calibration History"
      pageSubtitle="View all past calibration records."
    >
      <Card>
        <Table headers={headers} data={data} />
      </Card>
    </Layout>
  );
};

export default CalibrationHistoryPage;
