import React from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Eye, Edit2, Trash2, Search } from "lucide-react";

const BlogListPage: React.FC = () => {
  const blogs = [
    {
      title: "Importance of Equipment Calibration",
      author: "Admin",
      date: "2025-02-20",
      status: "published",
    },
    {
      title: "Best Practices in Precision Measurement",
      author: "Admin",
      date: "2025-02-18",
      status: "draft",
    },
    {
      title: "Industry Standards Update",
      author: "Admin",
      date: "2025-02-15",
      status: "published",
    },
  ];

  return (
    <Layout pageTitle="Blog Management">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Create and manage blog posts.</p>
        <Button className="flex items-center">
          <Plus size={16} className="mr-2" /> New Post
        </Button>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search posts..."
        />
      </div>

      <div className="space-y-4">
        {blogs.map((blog, index) => (
          <Card key={index} className="flex justify-between items-center py-4">
            <div>
              <h4 className="text-base font-medium text-gray-900">
                {blog.title}
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                By {blog.author} &nbsp;&nbsp; {blog.date}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge color={blog.status === "published" ? "blue" : "gray"}>
                {blog.status}
              </Badge>
              <div className="flex space-x-2 text-gray-400">
                <button className="hover:text-gray-600">
                  <Eye size={18} />
                </button>
                <button className="hover:text-blue-600">
                  <Edit2 size={18} />
                </button>
                <button className="hover:text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default BlogListPage;
