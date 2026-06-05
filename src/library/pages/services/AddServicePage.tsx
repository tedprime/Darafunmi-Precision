import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Upload, X, TriangleAlert } from "lucide-react";
import { apiFetch } from "../../../services/api";

const AddServicePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("active");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Service title is required.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("slug", slug.trim());
    formData.append("description", description.trim());
    formData.append("content", content.trim());
    formData.append("status", status);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await apiFetch("/services", {
        method: "POST",
        body: formData,
      });
      navigate("/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create service.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Add Service" pageSubtitle="Create and configure a new service package.">
      <form onSubmit={handleSubmit} className="max-w-5xl space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-center gap-2">
            <TriangleAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Info Blocks Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-2">
                Service Specifications
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="title"
                  label="Title *"
                  placeholder="e.g. Calibration Services"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Input
                  id="slug"
                  label="Slug"
                  placeholder="e.g. calibration-services"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <Input
                id="description"
                label="Short Description"
                placeholder="Brief text summary of the service..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Content</label>
                <textarea
                  id="content"
                  rows={6}
                  placeholder="Elaborate service parameters, process guidelines, details..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </Card>
          </div>

          {/* Configuration and Media Sidebar Column */}
          <div className="space-y-6">
            <Card className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-2">
                Visibility Status
              </h3>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </Card>

            {/* Reuses your product media block layout rules completely */}
            <Card className="space-y-2">
              <h3 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-2">
                Featured Cover Media
              </h3>
              {previewUrl ? (
                <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 h-48 flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                  >
                    <X size={14} className="text-gray-600" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-600 font-medium">Click to select an image file</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, or WEBP formats</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </Card>
          </div>
        </div>

        {/* Standard Actions Control Bar */}
        <div className="flex space-x-4 pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Service"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/services")}>
            Cancel
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default AddServicePage;