import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const AddClientPage: React.FC = () => {
  return (
    <Layout pageTitle="Add Client">
      <p className="text-gray-600 mb-6">Create a new client profile</p>

      <Card className="max-w-4xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Client Information
        </h3>

        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <Input
              id="clientName"
              label="Client Name"
              placeholder="Enter client name"
            />
            <Input
              id="email"
              label="Email"
              placeholder="Enter email address"
              type="email"
            />
            <Input id="phone" label="Phone" placeholder="Enter phone number" />
            <Input
              id="location"
              label="Location"
              placeholder="Enter location"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address
            </label>
            <textarea
              id="address"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter full address"
            ></textarea>
          </div>

          <div className="flex space-x-4">
            <Button type="submit">Save Client</Button>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
};

export default AddClientPage;
