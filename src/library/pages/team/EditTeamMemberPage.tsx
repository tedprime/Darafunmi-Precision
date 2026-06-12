import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Image as ImageIcon, Save, X, TriangleAlert } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getTeamMembers, updateTeamMember } from "../../../services/team.jsx";
import { toastSuccess } from "../../../services/useToast";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio?: string | null;
  imageUrl?: string | null;
  order?: number | null;
  isVisible: boolean;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const EditTeamMemberPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [order, setOrder] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTeamMembers()
      .then((res) => {
        const all: TeamMember[] = res.data ?? res;
        const member = all.find((m) => m.id === Number(id));
        if (!member) {
          setFetchError("Team member not found.");
          return;
        }
        setName(member.name);
        setRole(member.role);
        setBio(member.bio ?? "");
        setOrder(member.order != null ? String(member.order) : "");
        setIsVisible(member.isVisible);
        setExistingImageUrl(member.imageUrl ?? null);
      })
      .catch((err) => setFetchError(err.message ?? "Failed to load member."))
      .finally(() => setLoading(false));
  }, [id]);

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
    fd.append("bio", bio.trim());
    if (order) fd.append("order", order);
    fd.append("isVisible", String(isVisible));
    if (imageFile) fd.append("image", imageFile);

    setSubmitting(true);
    try {
      await updateTeamMember(Number(id), fd);
      toastSuccess("Team member updated successfully.");
      navigate("/team");
    } catch {
      setError("Failed to update team member.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Edit Team Member" pageSubtitle="Update team member details">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card><Skeleton className="h-10 w-full" /></Card>
            <Card><Skeleton className="h-10 w-full" /></Card>
            <Card><Skeleton className="h-32 w-full" /></Card>
          </div>
          <div className="space-y-6">
            <Card><Skeleton className="h-40 w-full" /></Card>
            <Card><Skeleton className="h-10 w-full" /></Card>
            <Card><Skeleton className="h-10 w-full" /></Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (fetchError) {
    return (
      <Layout pageTitle="Edit Team Member" pageSubtitle="Update team member details">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">{fetchError}</p>
          <button
            onClick={() => navigate("/team")}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Team
          </button>
        </div>
      </Layout>
    );
  }

  const displayImage = imagePreview ?? existingImageUrl;

  return (
    <Layout pageTitle="Edit Team Member" pageSubtitle="Update team member details">
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

        {/* Right column */}
        <div className="space-y-6">
          {/* Photo */}
          <Card>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Photo</h3>
            {displayImage ? (
              <div className="relative">
                <img
                  src={displayImage}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
                {imagePreview && (
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                  >
                    <X size={14} className="text-gray-600" />
                  </button>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {imageFile ? imageFile.name : "Current photo"}
                </p>
                {!imagePreview && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-xs text-blue-600 hover:underline"
                  >
                    Replace photo
                  </button>
                )}
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

          {/* Display Order */}
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

          {/* Visibility */}
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
            {submitting ? "Saving..." : "Save Changes"}
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

export default EditTeamMemberPage;