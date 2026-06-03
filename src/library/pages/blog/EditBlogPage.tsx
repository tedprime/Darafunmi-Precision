import React, { useState, useRef, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Image as ImageIcon, Save, X, Plus, TriangleAlert } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getBlog, updateBlog } from "../../../services/blog";
import { getCategories } from "../../../services/categories";

interface Category {
  id: number;
  name: string;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const EditBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getBlog(id), getCategories({ limit: 100 })])
      .then(([blog, { data: cats }]) => {
        setTitle(blog.title ?? "");
        setExcerpt(blog.excerpt ?? "");
        setContent(blog.content ?? "");
        setCategory(blog.category ?? "");
        setStatus(blog.status ?? "draft");
        setIsFeatured(blog.isFeatured ?? false);
        setTags(blog.tags ?? []);
        if (blog.featuredImage) setImagePreview(blog.featuredImage);
        setCategories(cats);
      })
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeaturedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setFeaturedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) setTags((prev) => [...prev, tag]);
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    setTags((prev) => prev.filter((t) => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim()) {
      setError("Blog title is required.");
      return;
    }
    if (!id) return;
    setSubmitting(true);
    try {
      await updateBlog(id, {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        category,
        status,
        isFeatured,
        featuredImage: featuredImage ?? undefined,
        tags,
      });
      navigate("/blog");
    } catch {
      setError("Failed to update blog post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      pageTitle="Edit Blog Post"
      pageSubtitle="Update and republish your blog post"
    >
      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </Card>
            <Card>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-20 w-full" />
            </Card>
            <Card>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-48 w-full" />
            </Card>
            <Card>
              <Skeleton className="h-4 w-12 mb-3" />
              <Skeleton className="h-10 w-full mb-3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </Card>
          </div>

          {/* Right column skeleton */}
          <div className="space-y-6">
            <Card>
              <Skeleton className="h-4 w-28 mb-3" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </Card>
            <Card>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </Card>
            <Card>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </Card>
            <Card>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
            </Card>
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      )}

      {/* Load Error State */}
      {!loading && loadError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-4"><TriangleAlert className="w-8 h-8"/></p>
          <p className="text-gray-700 font-medium">Failed to load blog post</p>
          <p className="text-sm text-gray-400 mt-1">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Edit Form */}
      {!loading && !loadError && (
        <>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <Input
                  id="title"
                  label="Blog Title"
                  placeholder="Enter blog post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  maxLength={160}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Brief summary of the blog post (shown in listings)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {excerpt.length}/160 characters
                </p>
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
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                  placeholder="Write your blog post content here..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports markdown formatting
                </p>
              </Card>

              {/* Tags */}
              <Card>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-blue-900"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter or click + to add a tag
                </p>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Featured Image */}
              <Card>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Featured Image
                </h3>
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    >
                      <X size={14} className="text-gray-600" />
                    </button>
                    <p className="text-xs text-gray-500 mt-2 truncate">
                      {featuredImage?.name ?? "Current image"}
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900">
                      Click to upload image
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </Card>

              {/* Category */}
              <Card>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </Card>

              {/* Status */}
              <Card>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Card>

              {/* Featured */}
              <Card>
                <div className="flex items-center mb-2">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
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

              <Button
                className="w-full flex justify-center items-center mb-3"
                onClick={handleSubmit}
                disabled={submitting}
              >
                <Save size={16} className="mr-2" />
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate("/blog")}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default EditBlogPage;