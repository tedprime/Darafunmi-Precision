import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Table from "../../components/ui/Table";
import { Users, TrendingUp, Award, DollarSign, Mail } from "lucide-react";

const DashboardPage: React.FC = () => {
  const activityLogHeaders = ["EVENT", "CATEGORY", "STATUS", "USER", "TIME"];
  const activityLogData = [
    [
      "Order #ORD-2025-001 confirmed",
      <Badge key="order-badge" color="blue">
        Order
      </Badge>,
      <Badge key="completed-badge" color="green">
        Completed
      </Badge>,
      "System",
      "2 hours ago",
    ],
    [
      "Booking #BK-2025-045 scheduled",
      <Badge key="booking-badge" color="purple">
        Booking
      </Badge>,
      <Badge key="pending-badge" color="yellow">
        Pending
      </Badge>,
      "Admin",
      "4 hours ago",
    ],
    [
      "Quote request #QT-2025-012 received",
      <Badge key="quote-badge" color="orange">
        Quote
      </Badge>,
      <Badge key="new-badge" color="blue">
        New
      </Badge>,
      "John Doe",
      "6 hours ago",
    ],
    [
      "Contact form submission from John Doe",
      <Badge key="contact-badge" color="green">
        Contact
      </Badge>,
      <Badge key="new-badge-2" color="blue">
        New
      </Badge>,
      "John Doe",
      "8 hours ago",
    ],
    [
      "Certificate #DPT/CAL/2025-001 issued",
      <Badge key="certificate-badge" color="yellow">
        Certificate
      </Badge>,
      <Badge key="completed-badge-2" color="green">
        Completed
      </Badge>,
      "System",
      "1 day ago",
    ],
  ];

  const expiringSoonData = [
    { id: "DPT/CAL/2024-156", company: "Acme Corp", daysLeft: 17 },
    { id: "DPT/CAL/2024-142", company: "Tech Solutions Inc", daysLeft: 24 },
    { id: "DPT/CAL/2024-138", company: "Global Industries", daysLeft: 43 },
    { id: "DPT/CAL/2024-125", company: "Manufacturing Ltd", daysLeft: 10 },
  ];

  return (
    <Layout pageTitle="Dashboard">
      <p className="text-gray-600 mb-6">
        Welcome back. Here's your business overview.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900">248</p>
              <p className="text-sm text-green-500">+12%</p>
            </div>
            <Users size={48} className="text-gray-300" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Jobs</p>
              <p className="text-3xl font-bold text-gray-900">45</p>
              <p className="text-sm text-green-500">+8%</p>
            </div>
            <TrendingUp size={48} className="text-gray-300" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Certificates Issued
              </p>
              <p className="text-3xl font-bold text-gray-900">1,205</p>
              <p className="text-sm text-green-500">+24%</p>
            </div>
            <Award size={48} className="text-gray-300" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Revenue</p>
              <p className="text-3xl font-bold text-gray-900">$124,580</p>
              <p className="text-sm text-green-500">+12.5%</p>
            </div>
            <DollarSign size={48} className="text-gray-300" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Activity Log
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Recent system activities and events
          </p>
          <Table headers={activityLogHeaders} data={activityLogData} />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Expiring Soon
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Certificates expiring within 60 days
          </p>
          <ul className="space-y-4">
            {expiringSoonData.map((item, index) => (
              <li key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.id}</p>
                  <p className="text-xs text-gray-600">{item.company}</p>
                  <p
                    className={`text-xs ${item.daysLeft <= 30 ? "text-red-500" : "text-gray-500"}`}
                  >
                    {item.daysLeft} days left
                  </p>
                </div>
                <Mail size={20} className="text-gray-400" />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Layout>
  );
};

export default DashboardPage;
