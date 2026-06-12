import React, { useState, useRef, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Image as ImageIcon, Save, X, TriangleAlert } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getCaseStudy, updateCaseStudy } from "../../../services/caseStudy";
import { toastError } from "../../../services/useToast";

const INDUSTRIES = [
  "Manufacturing", "Oil & Gas", "Pharmaceuticals", "Food & Beverage",
  "Aerospace", "Automotive", "Energy", "Other",
] as const;

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const EditCaseStudyPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: slugParam } = useParams<{ id: string }>();

  const [studyId, setStudyId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState("draft");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slugParam) return;
    getCaseStudy(slugParam)
      .then((study) => {
        setStudyId(study.id);
        setTitle(study.title ?? "");
        setExcerpt(study.excerpt ?? "");
        setContent(study.content ?? "");
        setIndustry(study.industry ?? "");
        const statusVal =
          study.status && typeof study.status === "object" && "name" in study.status
            ? (study.status as { name: string }).name
            : (study.status ?? "draft");
        setStatus(statusVal);
        if (study.featuredImage) setImagePreview(study.featuredImage);
      })
      .catch((err: { message?: string }) => {
        toastError(err.message ?? "Failed to load case study.");
        setLoadFailed(true);
      })
      .finally(() => setLoading(false));
  }, [slugParam]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeaturedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setFeaturedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toastError("Case study title is required.");
      return;
    }
    if (!studyId) {
      toastError("Could not determine case study ID.");
      return;
    }
    setSubmitting(true);
    try {
      await updateCaseStudy(studyId, {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        industry,
        status,
        featuredImage: featuredImage ?? undefined,
      });
      navigate("/case-studies");
    } catch {
      // toastError already fired inside updateCaseStudy/apiFormData
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Edit Case Study" pageSubtitle="Update and republish your case study">

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-10 w-full" /></Card>
            <Card><Skeleton className="h-4 w-16 mb-2" /><Skeleton className="h-20 w-full" /></Card>
            <Card><Skeleton className="h-4 w-16 mb-2" /><Skeleton className="h-48 w-full" /></Card>
          </div>
          <div className="space-y-6">
            <Card><Skeleton className="h-4 w-28 mb-3" /><Skeleton className="h-40 w-full rounded-lg" /></Card>
            <Card><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-10 w-full" /></Card>
            <Card><Skeleton className="h-4 w-16 mb-2" /><Skeleton className="h-10 w-full" /></Card>
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      )}

      {!loading && loadFailed && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 mb-4 text-gray-500" />
          <p className="text-gray-700 font-medium">Failed to load case study</p>
          <p className="text-sm text-gray-400 mt-1">Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !loadFailed && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <Input
                id="title"
                label="Title"
                placeholder="Enter case study title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Make it compelling and descriptive for better SEO
              </p>
            </Card>

            <Card>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                rows={3}
                maxLength={160}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Brief summary shown in listings"
              />
              <p className="text-xs text-gray-500 mt-1">{excerpt.length}/160 characters</p>
            </Card>

            <Card>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="content"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                placeholder="Write the full case study content here..."
              />
              <p className="text-xs text-gray-500 mt-1">Supports markdown formatting</p>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Featured Image</h3>
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                  >
                    <X size={14} className="text-gray-600" />
                  </button>
                  <p className="text-xs text-gray-500 mt-2 truncate">
                    {featuredImage?.name ?? "Current image"}
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Click to upload image</p>
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
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </Card>

            <Card>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
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
              onClick={() => navigate("/case-studies")}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EditCaseStudyPage;