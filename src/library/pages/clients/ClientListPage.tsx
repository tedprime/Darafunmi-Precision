import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus } from "lucide-react";

const ClientListPage: React.FC = () => {
  const headers = ["Name", "Email", "Phone", "Location", "Status"];
  const data = [
    [
      "Acme Corporation",
      "contact@acme.com",
      "+1 (555) 123-4567",
      "New York, NY",
      <Badge key="1" color="green">
        Active
      </Badge>,
    ],
    [
      "Tech Solutions Inc",
      "info@techsol.com",
      "+1 (555) 234-5678",
      "San Francisco, CA",
      <Badge key="2" color="green">
        Active
      </Badge>,
    ],
    [
      "Global Industries",
      "hello@globalind.com",
      "+1 (555) 345-6789",
      "Chicago, IL",
      <Badge key="3" color="gray">
        Inactive
      </Badge>,
    ],
  ];

  return (
    <Layout pageTitle="Clients">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Manage all your clients and their information
        </p>
        <Button className="flex items-center">
          <Plus size={16} className="mr-2" /> Add Client
        </Button>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          All Clients
        </h3>
        <Table headers={headers} data={data} />
      </Card>
    </Layout>
  );
};

export default ClientListPage;
