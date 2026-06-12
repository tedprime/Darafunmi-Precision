import React, { useState, useRef } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Image as ImageIcon, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toastSuccess, toastError } from "../../../services/useToast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddTeamMemberPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [order, setOrder] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim() || !role.trim()) {
      setError("Name and Role are required.");
      return;
    }

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("role", role.trim());
    if (bio.trim()) fd.append("bio", bio.trim());
    if (order) fd.append("order", order);
    fd.append("isVisible", String(isVisible));
    if (imageFile) fd.append("image", imageFile);

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/team`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // NO Content-Type — browser sets multipart boundary automatically
        },
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Failed to add team member.");
      }

      toastSuccess("Team member added successfully.");
      navigate("/team");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add team member.";
      setError(message);
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Add Team Member" pageSubtitle="Create a new team member">
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Input
              id="name"
              label="Full Name"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Card>

          <Card>
            <Input
              id="role"
              label="Role / Title"
              placeholder="e.g. CEO, Lead Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </Card>

          <Card>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bio
            </label>
            <textarea
              id="bio"
              rows={6}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
              placeholder="Short bio about this team member..."
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Photo</h3>
            {imagePreview ? (
              <div className="relative">
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
                  {imageFile?.name}
                </p>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-900">
                  Click to upload photo
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

          <Card>
            <Input
              id="order"
              label="Display Order"
              placeholder="e.g. 1, 2, 3"
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first
            </p>
          </Card>

          <Card>
            <div className="flex items-center mb-2">
              <input
                id="isVisible"
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isVisible"
                className="ml-2 block text-sm text-gray-900"
              >
                Visible on public site
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Hidden members won't appear on the website
            </p>
          </Card>

          <Button
            className="w-full flex justify-center items-center mb-3"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Save size={16} className="mr-2" />
            {submitting ? "Saving..." : "Add Team Member"}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigate("/team")}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AddTeamMemberPage;