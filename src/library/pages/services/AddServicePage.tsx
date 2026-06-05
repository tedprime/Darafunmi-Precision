import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Image as ImageIcon, Save, X } from "lucide-react";
import { createService } from "../../../services/services.jsx";

const AddServicePage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [icon, setIcon] = useState("");
  const [status, setStatus] = useState("active");
  const [isFeatured, setIsFeatured] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim()) { setError("Service title is required."); return; }

    setSubmitting(true);
    try {
      await createService({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        content: content.trim(),
        icon: icon.trim(),
        image: image ?? undefined,
        isFeatured,
        status,
      });
      navigate("/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create service.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Add Service" pageSubtitle="Create a new service offering">
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Input
              id="title"
              label="Service Title"
              placeholder="e.g. Calibration Services"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </Card>

          <Card>
            <Input
              id="slug"
              label="Slug"
              placeholder="auto-generated from title"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Used in the public URL — lowercase, hyphens only</p>
          </Card>

          <Card>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Short summary shown in service listings"
            />
          </Card>

          <Card>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
              placeholder="Full service page content — supports markdown"
            />
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Image */}
          <Card>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Service Image</h3>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                >
                  <X size={14} className="text-gray-600" />
                </button>
                <p className="text-xs text-gray-500 mt-2 truncate">{image?.name}</p>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer"
              >
                <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-900">Click to upload</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleImageChange} />
          </Card>

          {/* Icon */}
          <Card>
            <Input
              id="icon"
              label="Icon"
              placeholder="e.g. wrench, gauge, award"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Icon name or class used on the frontend</p>
          </Card>

          {/* Status */}
          <Card>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">Mark as Featured</label>
            </div>
            <p className="text-xs text-gray-500">Featured services are highlighted on the homepage</p>
          </Card>

          <Button className="w-full flex justify-center items-center mb-3" onClick={handleSubmit} disabled={submitting}>
            <Save size={16} className="mr-2" />
            {submitting ? "Saving..." : "Save Service"}
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => navigate("/services")} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AddServicePage;