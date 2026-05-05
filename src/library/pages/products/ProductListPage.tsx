import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const renderActions = () => (
    <div className="flex space-x-3">
      <button className="text-blue-500 hover:text-blue-600">
        <Edit2 size={16} />
      </button>
      <button className="text-red-500 hover:text-red-600">
        <Trash2 size={16} />
      </button>
    </div>
  );
  const headers = ["Name", "Category", "Price", "Stock", "Status", "Actions"];
  const data = [
    [
      "Pressure Gauge",
      "Instruments",
      "$299.99",
      "45",
      <Badge key="1" color="green">
        Active
      </Badge>,
      renderActions(),
    ],
    [
      "Temperature Sensor",
      "Sensors",
      "$149.99",
      "120",
      <Badge key="2" color="green">
        Active
      </Badge>,
      renderActions(),
    ],
    [
      "Flow Meter",
      "Instruments",
      "$499.99",
      "12",
      <Badge key="3" color="yellow">
        Low Stock
      </Badge>,
      renderActions(),
    ],
  ];

  return (
    <Layout
      pageTitle="Products"
      pageSubtitle="Manage all your products and their details here."
      action={
        <Button
          className="flex items-center"
          onClick={() => navigate("/products/add")}
        >
          <Plus size={16} className="mr-2" /> Add Products
        </Button>
      }
    >
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          All Products
        </h3>
        <Table headers={headers} data={data} />
      </Card>
    </Layout>
  );
};

export default ProductListPage;
