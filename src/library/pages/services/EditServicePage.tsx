import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Image as ImageIcon, Save, X, TriangleAlert } from "lucide-react";
import { updateService } from "../../../services/services.jsx";
import { apiFetch } from "../../../services/api";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const EditServicePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("active");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch(`/services/${id}`)
      .then((res: { data: { title: string; description?: string; content?: string; status?: string; image?: string } }) => {
        const s = res.data ?? res;
        setTitle(s.title ?? "");
        setDescription(s.description ?? "");
        setContent(s.content ?? "");
        setStatus(s.status ?? "active");
        if (s.image) setImagePreview(s.image);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

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
      await updateService(id, {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        image: image ?? undefined,
        status,
      });
      navigate("/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update service.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Edit Service" pageSubtitle="Loading...">
        <Card className="w-full">
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-10 w-full" /></div>
            ))}
          </div>
        </Card>
      </Layout>
    );
  }

  if (error && !submitting) {
    return (
      <Layout pageTitle="Edit Service" pageSubtitle="">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load service</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Edit Service" pageSubtitle="Update this service offering">
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Input id="title" label="Service Title" placeholder="e.g. Calibration Services" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Card>

          <Card>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
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
          <Card>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Service Image</h3>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                <button onClick={removeImage} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100">
                  <X size={14} className="text-gray-600" />
                </button>
                <p className="text-xs text-gray-500 mt-2 truncate">{image?.name ?? "Current image"}</p>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer">
                <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-900">Click to upload</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleImageChange} />
          </Card>

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

          <Button className="w-full flex justify-center items-center mb-3" onClick={handleSubmit} disabled={submitting}>
            <Save size={16} className="mr-2" />
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => navigate("/services")} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default EditServicePage;