import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { ArrowLeft, Image as ImageIcon, Save } from "lucide-react";

const AddBlogPage: React.FC = () => {
  return (
    <Layout pageTitle="Create New Blog Post">
      <div className="flex items-center mb-6">
        <button className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <p className="text-gray-600">Write and publish a new article</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Input
              id="title"
              label="Blog Title"
              placeholder="Enter blog post title"
            />
            <p className="text-xs text-gray-500 mt-1">
              Make it compelling and descriptive for better SEO
            </p>
          </Card>

          <Card>
            <label
              htmlFor="excerpt"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Excerpt
            </label>
            <textarea
              id="excerpt"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Brief summary of the blog post (shown in listings)"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">0/160 characters</p>
          </Card>

          <Card>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Content
            </label>
            <textarea
              id="content"
              rows={10}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
              placeholder="Write your blog post content here..."
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              Supports markdown formatting
            </p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Featured Image
            </h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
              <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-900">
                Click to upload image
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
            </div>
          </Card>

          <Card>
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
                <option>Calibration</option>
              </select>
            </div>
          </Card>

          <Card>
            <div className="mb-4">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option>Draft</option>
                <option>Published</option>
              </select>
            </div>
          </Card>

          <Card>
            <div className="flex items-center mb-2">
              <input
                id="featured"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="featured"
                className="ml-2 block text-sm text-gray-900"
              >
                Mark as Featured
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Featured posts appear prominently on the blog homepage
            </p>
          </Card>

          <Button className="w-full flex justify-center items-center mb-3">
            <Save size={16} className="mr-2" /> Publish Blog Post
          </Button>
          <Button variant="secondary" className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AddBlogPage;
