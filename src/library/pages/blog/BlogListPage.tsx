import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Eye, Edit2, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBlogs, deleteBlog, BlogPost } from "../../../services/blog.jsx";

const BlogListPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getBlogs()
      .then(({ data }) => setBlogs(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("Failed to delete post.");
    }
  };

  const filtered = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Layout
      pageTitle="Blog Management"
      pageSubtitle="Manage all blog posts and their details here."
      action={
        <Button
          className="flex items-center"
          onClick={() => navigate("/blog/add")}
        >
          <Plus size={16} className="mr-2" /> Add Blog Post
        </Button>
      }
    >
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search posts..."
        />
      </div>

      {loading && <p className="text-sm text-gray-500">Loading posts...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-4">
        {filtered.map((blog) => (
          <Card
            key={blog.id}
            className="flex justify-between items-center py-8 px-6"
          >
            <div>
              <h4 className="text-base font-medium text-gray-900">
                {blog.title}
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                By {blog.author ?? "Unknown"} &nbsp;&nbsp; {blog.date ?? blog.createdAt}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge color={blog.status === "published" ? "blue" : "gray"}>
                {blog.status}
              </Badge>
              <div className="flex space-x-2 text-gray-400">
                <button
                  className="hover:text-gray-600"
                  onClick={() => navigate(`/blog/${blog.id}`)}
                >
                  <Eye size={18} />
                </button>
                <button
                  className="text-blue-500 hover:text-blue-600"
                  onClick={() => navigate(`/blog/edit/${blog.id}`)}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(blog.id)}
                >
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