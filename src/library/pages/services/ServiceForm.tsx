import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Upload, X } from "lucide-react";

interface ServiceFormProps {
  initialTitle?: string;
  initialSlug?: string;
  initialDescription?: string;
  initialContent?: string;
  initialIcon?: string;
  initialImageUrl?: string;
  initialStatus?: string;
  isEdit?: boolean;
  submitting: boolean;
  error: string | null;
  onSubmit: (fields: {
    title: string;
    slug: string;
    description: string;
    content: string;
    icon: string;
    image: File | null;
    status: string;
  }) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  initialTitle = "",
  initialSlug = "",
  initialDescription = "",
  initialContent = "",
  initialIcon = "",
  initialImageUrl = "",
  initialStatus = "active",
  isEdit = false,
  submitting,
  error,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [description, setDescription] = useState(initialDescription);
  const [content, setContent] = useState(initialContent);
  const [icon, setIcon] = useState(initialIcon);
  const [status, setStatus] = useState(initialStatus);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialImageUrl);

  // Auto-generate slug from title on add
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
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
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, slug, description, content, icon, image, status });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Service Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <Input
            id="title"
            label="Title"
            placeholder="Enter service title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
          <Input
            id="slug"
            label="Slug"
            placeholder="auto-generated-from-title"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <Input
            id="icon"
            label="Icon (optional)"
            placeholder="e.g. wrench, settings"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
          <div>
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
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
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Short description of the service"
          />
        </div>

        <div className="mb-2">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Content
          </label>
          <textarea
            id="content"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Full service content / body"
          />
        </div>
      </Card>

      {/* Image Upload */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Service Image
        </h3>
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
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
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600">Drag and drop your image here</p>
            <p className="text-xs text-gray-500 mt-1">or click to browse</p>
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

      <div className="flex space-x-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Service"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/services")}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;