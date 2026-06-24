import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { confirmDialog } from "../../components/common/confirmDialog";
import { Plus, Edit2, Trash2, Search, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBlogs, deleteBlog, type BlogPost } from "../../../services/blog";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setLoading(true);
  };

  const handleDelete = async (id: number) => {
    if (!(await confirmDialog({
      title: "Delete post?",
      description: "Delete this post?",
      confirmLabel: "Delete",
    }))) return;
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
        <Button onClick={() => navigate("/blog/add")}>
          <Plus size={16} /> Add Blog Post
        </Button>
      }
    >
      {/* Search */}
      <div className="mb-5 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
          placeholder="Search posts..."
        />
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex justify-between items-center">
              <div className="flex-1">
                <Skeleton className="h-5 w-64 mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error View */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load blog posts</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Blog List */}
      {!loading && !error && (
        <div className="space-y-3">
          {blogs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">No blog posts found.</p>
          ) : (
            blogs.map((blog) => {
              const authorName = getAuthorName(blog.author);
              const statusText = getStatusName(blog.status);

              return (
                <div
                  key={blog.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 break-words">
                      {blog.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      By {authorName} &nbsp;·&nbsp; {blog.date ?? blog.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge color={statusText === "published" ? "blue" : "gray"}>
                      {statusText}
                    </Badge>
                    <div className="flex gap-1.5">
                      <button
                        className="p-1.5 border border-blue-200 rounded-md text-blue-500 hover:bg-blue-50 transition-colors"
                        onClick={() => navigate(`/blog/edit/${blog.id}`)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="p-1.5 border border-red-100 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => handleDelete(blog.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </Layout>
  );
};

export default BlogListPage;
