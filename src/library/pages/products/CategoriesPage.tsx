import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Button from "../../components/common/Button";
import { Plus, Edit2, Trash2, Search } from "lucide-react";

const CategoriesPage: React.FC = () => {
  const headers = ["Category Name", "Products", "Status", "Actions"];

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

  const data = [
    ["Laboratory Equipment", "12", "active", renderActions()],
    ["Pressure Instruments", "8", "active", renderActions()],
    ["Temperature Instruments", "5", "active", renderActions()],
    ["Flow Instruments", "6", "active", renderActions()],
    ["Analytical Instruments", "9", "active", renderActions()],
    ["Electrical Instruments", "7", "active", renderActions()],
    ["Calibration Standards", "4", "active", renderActions()],
  ];

  return (
    <Layout pageTitle="Categories">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Manage product categories.</p>
        <Button className="flex items-center">
          <Plus size={16} className="mr-2" /> Add Category
        </Button>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search categories..."
        />
      </div>

      <Card>
        <Table headers={headers} data={data} />
      </Card>
    </Layout>
  );
};

export default CategoriesPage;
