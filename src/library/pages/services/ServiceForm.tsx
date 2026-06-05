import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Upload, X } from "lucide-react";

interface ServiceFormProps {
  initialName?: string;
  initialDescription?: string;
  initialImageUrl?: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (fields: {
    name: string;
    description: string;
    image: File | null;
  }) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  initialName = "",
  initialDescription = "",
  initialImageUrl = "",
  submitting,
  error,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      image,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <Card className="space-y-4">
        <Input
          id="name"
          label="Service Name"
          placeholder="e.g., Temperature Calibration"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
            placeholder="Provide a comprehensive operational breakdown..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Service Banner Image</h4>
        {previewUrl ? (
          <div className="relative w-full max-h-64 rounded-lg overflow-hidden border border-gray-200">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-gray-50" />
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
            <p className="text-sm text-gray-600">Click or drop here to upload service artwork</p>
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