import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Plus, Edit2, Trash2, Search, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBlogs, deleteBlog, type BlogPost } from "../../../services/blog";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

// Type guard helpers for nested structures
const getAuthorName = (author: BlogPost["author"]): string => {
  if (author && typeof author === "object" && "name" in author) {
    return (author as { name: string }).name;
  }
  if (typeof author === "string") return author;
  return "Unknown";
};

const getStatusName = (status: BlogPost["status"]): string => {
  if (status && typeof status === "object" && "name" in status) {
    return (status as { name: string }).name;
  }
  if (typeof status === "string") return status;
  return "draft";
};

const BlogListPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Fetch blogs when component mounts or search query changes
  useEffect(() => {
    let isMounted = true;

    getBlogs({ search, limit: 50 })
      .then(({ data }) => {
        if (isMounted) {
          setBlogs(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setLoading(true); // Set loading here instead of in effect
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("Failed to delete post.");
    }
  };

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
      {/* Search Input Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search posts..."
        />
      </div>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="flex justify-between items-center py-8 px-6">
              <div className="flex-1">
                <Skeleton className="h-5 w-64 mb-3" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="flex space-x-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-5 rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error View State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-4"><TriangleAlert className="w-8 h-8"/></p>
          <p className="text-gray-700 font-medium">Failed to load blog posts</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Blog List Content */}
      {!loading && !error && (
        <div className="space-y-4">
          {blogs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No blog posts found.
            </p>
          ) : (
            blogs.map((blog) => {
              const authorName = getAuthorName(blog.author);
              const statusText = getStatusName(blog.status);

              return (
                <Card
                  key={blog.id}
                  className="flex justify-between items-center py-8 px-6"
                >
                  <div>
                    <h4 className="text-base font-medium text-gray-900">
                      {blog.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      By {authorName} &nbsp;&nbsp;{" "}
                      {blog.date ?? blog.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge color={statusText === "published" ? "blue" : "gray"}>
                      {statusText}
                    </Badge>
                    <div className="flex space-x-4 text-gray-400">
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
              );
            })
          )}
        </div>
      )}
    </Layout>
  );
};

export default BlogListPage;