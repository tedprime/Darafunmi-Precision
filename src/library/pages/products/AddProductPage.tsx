import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Upload } from "lucide-react";

const AddProductPage: React.FC = () => {
  return (
    <Layout
      pageTitle="Products"
      pageSubtitle="Create and manage your products here. Add new products to keep your inventory up to date."
    >
      <form>
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Product Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <Input
              id="productName"
              label="Product Name"
              placeholder="Enter product name"
            />
            <div className="mb-4">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <select
                id="category"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option>Select category</option>
                <option value="laboratory equipment">
                  Laboratory Equipment
                </option>
                <option value="pressure instruments">
                  Pressure Instruments
                </option>
                <option value="temperature instruments">
                  Temperature Instruments
                </option>
                <option value="flow instruments">Flow Instruments</option>
                <option value="analytical instruments">
                  Analytical Instruments
                </option>
                <option value="electrical instruments">
                  Electrical Instruments
                </option>
                <option value="calibration equipment">
                  Calibration Equipment
                </option>
              </select>
            </div>
            <Input id="price" label="Price" placeholder="Enter price" />
            <Input
              id="stock"
              label="Stock Quantity"
              placeholder="Enter stock quantity"
            />
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
              placeholder="Enter product description"
            ></textarea>
          </div>
        </Card>

        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Product Image
          </h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600">
              Drag and drop your image here
            </p>
            <p className="text-xs text-gray-500 mt-1">or click to browse</p>
            <div className="mt-4 flex justify-center">
              <input
                type="file"
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        </Card>

        <div className="flex space-x-4">
          <Button type="submit">Save Product</Button>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default AddProductPage;
