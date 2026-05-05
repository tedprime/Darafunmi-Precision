import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Save } from "lucide-react";

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <Layout
      pageTitle="
      Settings"
      pageSubtitle="Manage your application settings and preferences"
    >
      <div className="bg-gray-100 p-1 rounded-lg flex mb-6 max-w-3xl">
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${activeTab === "general" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("general")}
        >
          General
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${activeTab === "company" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("company")}
        >
          Company
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${activeTab === "notifications" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>
      </div>

      <Card className="w-full">
        {activeTab === "general" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              General Settings
            </h3>
            <form className="space-y-4">
              <Input
                id="appName"
                label="Application Name"
                defaultValue="DPT Admin Panel"
              />
              <Input id="timezone" label="Timezone" defaultValue="UTC" />
              <Input id="language" label="Language" defaultValue="English" />
              <Button type="submit" className="flex items-center mt-4">
                <Save size={16} className="mr-2" /> Save Changes
              </Button>
            </form>
          </div>
        )}

        {activeTab === "company" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Company Information
            </h3>
            <form className="space-y-4">
              <Input
                id="compName"
                label="Company Name"
                placeholder="Your Company Name"
              />
              <Input
                id="compEmail"
                label="Company Email"
                placeholder="info@company.com"
                type="email"
              />
              <Input
                id="compPhone"
                label="Company Phone"
                placeholder="+1 (555) 000-0000"
              />
              <Input
                id="compAddress"
                label="Address"
                placeholder="123 Main Street, City, State"
              />
              <Button type="submit" className="flex items-center mt-4">
                <Save size={16} className="mr-2" /> Save Changes
              </Button>
            </form>
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Notification Preferences
            </h3>
            <form className="space-y-6">
              <div className="flex items-start justify-between border-b border-gray-200 pb-4">
                <div>
                  <p className="font-medium text-gray-900">
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-500">
                    Receive email for important updates
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-start justify-between border-b border-gray-200 pb-4">
                <div>
                  <p className="font-medium text-gray-900">
                    Certificate Expiry Alerts
                  </p>
                  <p className="text-sm text-gray-500">
                    Get notified when certificates are about to expire
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-start justify-between border-b border-gray-200 pb-4">
                <div>
                  <p className="font-medium text-gray-900">
                    New Order Notifications
                  </p>
                  <p className="text-sm text-gray-500">
                    Get notified when new orders are received
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>

              <Button type="submit" className="flex items-center mt-4">
                <Save size={16} className="mr-2" /> Save Changes
              </Button>
            </form>
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default SettingsPage;
