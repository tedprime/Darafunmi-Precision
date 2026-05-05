import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ClientListPage: React.FC = () => {
  const navigate = useNavigate();
  const headers = ["Name", "Email", "Phone", "Location", "Status"];
  const data = [
    [
      "Dangote Industries Ltd",
      "info@dangote.com",
      "+234 (801) 234-5678",
      "Lagos, Lagos",
      <Badge key="1" color="green">
        Active
      </Badge>,
    ],
    [
      "MTN Nigeria Plc",
      "contact@mtn.com.ng",
      "+234 (802) 345-6789",
      "Lagos, Lagos",
      <Badge key="2" color="green">
        Active
      </Badge>,
    ],
    [
      "Zenith Bank Plc",
      "info@zenithbank.com",
      "+234 (803) 456-7890",
      "Lagos, Lagos",
      <Badge key="3" color="green">
        Active
      </Badge>,
    ],
    [
      "Flour Mills of Nigeria",
      "hello@flourmills.com.ng",
      "+234 (804) 567-8901",
      "Lagos, Lagos",
      <Badge key="4" color="gray">
        Inactive
      </Badge>,
    ],
    [
      "Julius Berger Nigeria",
      "contact@juliusberger.com",
      "+234 (805) 678-9012",
      "Abuja, FCT",
      <Badge key="5" color="green">
        Active
      </Badge>,
    ],
    [
      "Nestlé Nigeria Plc",
      "info@nestle.com.ng",
      "+234 (806) 789-0123",
      "Ikeja, Lagos",
      <Badge key="6" color="green">
        Active
      </Badge>,
    ],
    [
      "Nigerian Breweries Plc",
      "hello@nbplc.com",
      "+234 (807) 890-1234",
      "Ibadan, Oyo",
      <Badge key="7" color="gray">
        Inactive
      </Badge>,
    ],
  ];

  return (
    <Layout
      pageTitle="Clients"
      pageSubtitle="Manage all your clients and their information here."
      action={
        <Button
          className="flex items-center"
          onClick={() => navigate("/clients/add")}
        >
          <Plus size={16} className="mr-2" /> Add Client
        </Button>
      }
    >
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
