import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Upload, X, TriangleAlert } from "lucide-react";

interface ServiceFormProps {
  initialTitle?: string;
  initialSlug?: string;
  initialDescription?: string;
  initialContent?: string;
  initialStatus?: string;
  initialImageUrl?: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (fields: {
    title: string;
    slug: string;
    description: string;
    content: string;
    status: string;
    image: File | null;
  }) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  initialTitle = "",
  initialSlug = "",
  initialDescription = "",
  initialContent = "",
  initialStatus = "active",
  initialImageUrl = "",
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
  const [status, setStatus] = useState(initialStatus);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialImageUrl);

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
    onSubmit({ title, slug, description, content, status, image });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2">
          <TriangleAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Service Details Card */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Service Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <Input
            id="serviceTitle"
            label="Service Title"
            placeholder="Enter service title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            id="serviceSlug"
            label="Slug"
            placeholder="enter-service-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
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
          <Input
            id="description"
            label="Short Description"
            placeholder="Enter brief service summary"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Detailed Content
          </label>
          <textarea
            id="content"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter comprehensive service description and specifications"
          />
        </div>
      </Card>

      {/* Service Cover Image Card */}
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
            <p className="text-sm text-gray-600">
              Drag and drop your image here
            </p>
            <p className="text-xs text-gray-500 mt-1">or click to browse</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleImageChange}
        />
      </Card>

      {/* Action Buttons */}
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