import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import { createTeamMember } from "../../../services/team.jsx";
import { useToast } from "../../../services/useToast";

const AddTeamMemberPage: React.FC = () => {
  const { toast } = useToast() as {
    toast: {
      success: (msg: string) => void;
      error: (msg: string) => void;
      info: (msg: string) => void;
    };
  };
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    role: "",
    bio: "",
    order: "",
    isVisible: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.role) {
      toast.error("Name and Role are required.");
      return;
    }
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("role", form.role);
    if (form.bio) fd.append("bio", form.bio);
    if (form.order) fd.append("order", form.order);
    fd.append("isVisible", String(form.isVisible));
    if (imageFile) fd.append("image", imageFile);

    setSubmitting(true);
    try {
      await createTeamMember(fd);
      toast.success("Team member added successfully.");
      navigate("/team");
    } catch {
      toast.error("Failed to add team member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Add Team Member" pageSubtitle="Create a new team member.">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Full name"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. CEO, Engineer"
            />
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              placeholder="Short bio..."
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              name="order"
              type="number"
              value={form.order}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="1, 2, 3…"
            />
          </div>

          {/* isVisible */}
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="isVisible"
              name="isVisible"
              checked={form.isVisible}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="isVisible" className="text-sm font-medium text-gray-700">
              Visible on public site
            </label>
          </div>

          {/* Image */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-3 w-24 h-24 rounded-full object-cover border border-gray-200"
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Saving…" : "Add Member"}
          </button>
          <button
            onClick={() => navigate("/team")}
            className="px-5 py-2 border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </Card>
    </Layout>
  );
};

export default AddTeamMemberPage;