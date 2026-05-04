import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus } from "lucide-react";

const ProductListPage: React.FC = () => {
  const headers = ["Name", "Category", "Price", "Stock", "Status"];
  const data = [
    [
      "Pressure Gauge",
      "Instruments",
      "$299.99",
      "45",
      <Badge key="1" color="green">
        Active
      </Badge>,
    ],
    [
      "Temperature Sensor",
      "Sensors",
      "$149.99",
      "120",
      <Badge key="2" color="green">
        Active
      </Badge>,
    ],
    [
      "Flow Meter",
      "Instruments",
      "$499.99",
      "12",
      <Badge key="3" color="yellow">
        Low Stock
      </Badge>,
    ],
  ];

  return (
    <Layout pageTitle="Products">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Manage your product catalog</p>
        <Button className="flex items-center">
          <Plus size={16} className="mr-2" /> Add Product
        </Button>
      </div>

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
