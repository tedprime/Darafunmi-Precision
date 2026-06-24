import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/layout/Layout";
import { AlertCircle, Loader2, Save, Upload, X, TriangleAlert } from "lucide-react";
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
        setName(member.name ?? "");
        setRole((member as any).title ?? "");        // DB: title
        setBio(member.bio ?? "");
        setOrder((member as any).sortOrder != null ? String((member as any).sortOrder) : ""); // DB: sortOrder
        setIsVisible((member as any).isActive ?? true); // DB: isActive
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
    const trimmedName = (name ?? "").trim();
    const trimmedRole = (role ?? "").trim();
    const trimmedBio = (bio ?? "").trim();
    const trimmedOrder = (order ?? "").trim();

    if (!trimmedName || !trimmedRole) {
      setError("Name and Role are required.");
      return;
    }

    const fd = new FormData();
    fd.append("name", trimmedName);
    fd.append("title", trimmedRole);          // DB column: title
    if (trimmedBio) fd.append("bio", trimmedBio);
    if (trimmedOrder) fd.append("sortOrder", trimmedOrder); // DB column: sortOrder
    fd.append("isActive", String(isVisible));  // DB column: isActive
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
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <Skeleton className="h-4 w-32 mb-5" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><Skeleton className="h-3.5 w-20 mb-2" /><Skeleton className="h-10 w-full rounded-lg" /></div>
                <div><Skeleton className="h-3.5 w-20 mb-2" /><Skeleton className="h-10 w-full rounded-lg" /></div>
                <div className="sm:col-span-2"><Skeleton className="h-3.5 w-12 mb-2" /><Skeleton className="h-32 w-full rounded-lg" /></div>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"><Skeleton className="h-40 w-full rounded-xl" /></div>
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
          <button onClick={() => navigate("/team")} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 mb-5">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — fields */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">Member Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role / Title</label>
                <input
                  type="text"
                  placeholder="e.g. CEO, Lead Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                <textarea
                  rows={6}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short bio about this team member..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
                <input
                  type="number"
                  placeholder="e.g. 1, 2, 3"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
              </div>
              <div className="flex flex-col justify-center">
                <label className="block text-sm font-medium text-gray-700 mb-3">Visibility</label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`relative w-10 h-5 rounded-full transition-colors ${isVisible ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isVisible ? 'translate-x-5' : ''}`} />
                  </div>
                  <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="sr-only" />
                  <span className="text-sm text-gray-700">Visible on public site</span>
                </label>
                <p className="text-xs text-gray-400 mt-1">Hidden members won't appear on the website</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — photo + actions */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Photo</h3>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors group"
            >
              {displayImage ? (
                <div className="relative inline-block">
                  <img src={displayImage} className="h-32 w-32 object-cover rounded-lg mx-auto" alt="Preview" />
                  {imagePreview && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <Upload size={24} className="mx-auto mb-2 text-gray-300 group-hover:text-blue-400 transition-colors" />
                  <p className="text-sm text-gray-400">Click to upload image</p>
                  <p className="text-xs text-gray-300 mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
            {displayImage && !imagePreview && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs text-blue-600 hover:underline block"
              >
                Replace photo
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 size={15} className="animate-spin" />Saving...</> : <><Save size={15} />Save Changes</>}
            </button>
            <button
              type="button"
              onClick={() => navigate("/team")}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditTeamMemberPage;
