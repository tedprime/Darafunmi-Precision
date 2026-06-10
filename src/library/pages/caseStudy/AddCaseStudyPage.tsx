import React, { useState, useRef } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Image as ImageIcon, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createCaseStudy } from "../../../services/caseStudy";

const INDUSTRIES = [
  "Manufacturing",
  "Oil & Gas",
  "Pharmaceuticals",
  "Food & Beverage",
  "Aerospace",
  "Automotive",
  "Energy",
  "Other",
] as const;

const AddCaseStudyPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState("draft");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(val));
    }
  };

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

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

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim()) {
      setError("Case study title is required.");
      return;
    }
    setSubmitting(true);
    try {
      await createCaseStudy({
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim(),
        content: content.trim(),
        industry,
        status,
        featuredImage: featuredImage ?? undefined,
      });
      navigate("/case-studies");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create case study.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      pageTitle="Add Case Study"
      pageSubtitle="Create and publish a new case study"
    >
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
              label="Title"
              placeholder="Enter case study title"
              value={title}
              onChange={handleTitleChange}
            />
            <p className="text-xs text-gray-500 mt-1">
              Make it compelling and descriptive for better SEO
            </p>
          </Card>

          <Card>
            <Input
              id="slug"
              label="Slug"
              placeholder="auto-generated-from-title"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly identifier — auto-filled from title, editable
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
              placeholder="Brief summary shown in listings"
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
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
              placeholder="Write the full case study content here..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports markdown formatting
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
                  {featuredImage?.name}
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
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
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

          {/* Industry */}
          <Card>
            <label
              htmlFor="industry"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Industry
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
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

          <Button
            className="w-full flex justify-center items-center mb-3"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Save size={16} className="mr-2" />
            {submitting ? "Publishing..." : "Publish Case Study"}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigate("/case-studies")}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AddCaseStudyPage;