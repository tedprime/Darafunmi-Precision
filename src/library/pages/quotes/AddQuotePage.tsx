import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const AddQuotePage: React.FC = () => {
  return (
    <Layout pageTitle="Add Quote">
      <p className="text-gray-600 mb-6">Create a new quotation</p>

      <form>
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quote Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <Input
              id="quoteNumber"
              label="Quote Number"
              placeholder="e.g., QT-2025-001"
            />
            <div className="mb-4">
              <label
                htmlFor="client"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Client
              </label>
              <select
                id="client"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option>Select client</option>
              </select>
            </div>
            <Input id="amount" label="Amount" placeholder="Enter amount" />
            <Input id="date" label="Date" type="date" />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter quote description"
            ></textarea>
          </div>
        </Card>

        <div className="flex space-x-4">
          <Button type="submit">Save Quote</Button>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default AddQuotePage;
