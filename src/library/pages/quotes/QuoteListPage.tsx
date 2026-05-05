import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuoteListPage: React.FC = () => {
  const navigate = useNavigate();
  const headers = [
    "Quote No",
    "Client",
    "Amount",
    "Status",
    "Date",
    "Notes",
    "Actions",
  ];

  const renderActions = () => (
    <button className="text-gray-500 hover:text-gray-600">
      <Eye size={16} />
    </button>
  );

  const data = [
    [
      "QT-2025-001",
      "Acme Corp",
      "$5,000.00",
      <Badge key="1" color="yellow">
        pending
      </Badge>,
      "2025-04-20",
      "Awaiting customer review",
      renderActions(),
    ],
    [
      "QT-2025-002",
      "Tech Solutions",
      "$8,500.00",
      <Badge key="2" color="green">
        accepted
      </Badge>,
      "2025-04-18",
      "Customer accepted",
      renderActions(),
    ],
    [
      "QT-2025-003",
      "Global Industries",
      "$3,200.00",
      <Badge key="3" color="red">
        rejected
      </Badge>,
      "2025-04-15",
      "Customer declined",
      renderActions(),
    ],
  ];

  return (
    <Layout
      pageTitle="Quotes"
      pageSubtitle="Manage all quotes and their details here."
      action={
        <Button
          className="flex items-center"
          onClick={() => navigate("/quotes/add")}
        >
          <Plus size={16} className="mr-2" /> Add Quotes
        </Button>
      }
    >
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search quotations..."
        />
      </div>

      <Card>
        <Table headers={headers} data={data} />
      </Card>
    </Layout>
  );
};

export default QuoteListPage;
