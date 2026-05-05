import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const AddCalibrationPage: React.FC = () => {
  return (
    <Layout
      pageTitle="Add Calibration"
      pageSubtitle="Record a new calibration entry."
    >
      <Card className="w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Calibration Details
        </h3>

        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <Input
              id="equipmentName"
              label="Equipment Name"
              placeholder="Enter equipment name"
            />
            <Input
              id="serialNumber"
              label="Serial Number"
              placeholder="Enter serial number"
            />
            <Input
              id="calibrationDate"
              label="Calibration Date"
              placeholder="YYYY-MM-DD"
              type="date"
            />
            <Input
              id="nextDueDate"
              label="Next Due Date"
              placeholder="YYYY-MM-DD"
              type="date"
            />
            <Input
              id="technician"
              label="Technician"
              placeholder="Enter technician name"
            />
            <Input
              id="location"
              label="Location"
              placeholder="Enter location"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter any additional notes"
            />
          </div>

          <div className="flex space-x-4">
            <Button type="submit">Save Calibration</Button>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
};

export default AddCalibrationPage;
