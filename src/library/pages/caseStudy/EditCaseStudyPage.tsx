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
  const [clientName, setClientName] = useState("");
  const [industry, setIndustry] = useState("");
  const [challenge, setChallenge] = useState("");
  const [solution, setSolution] = useState("");
  const [results, setResults] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
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
        setClientName(study.clientName ?? "");
        setIndustry(study.industry ?? "");
        setChallenge(study.challenge ?? "");
        setSolution(study.solution ?? "");
        setResults(study.results ?? "");
        setIsPublished(study.isPublished ?? false);
        setIsFeatured(study.isFeatured ?? false);
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
    if (!title.trim()) { toastError("Case study title is required."); return; }
    if (!studyId) { toastError("Could not determine case study ID."); return; }
    setSubmitting(true);
    try {
      await updateCaseStudy(studyId, {
        title: title.trim(),
        clientName: clientName.trim(),
        industry,
        challenge: challenge.trim(),
        solution: solution.trim(),
        results: results.trim(),
        isPublished,
        isFeatured,
        featuredImage: featuredImage ?? undefined,
      });
      navigate("/case-studies");
    } catch {
      // toastError already fired inside updateCaseStudy
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Edit Case Study" pageSubtitle="Update and republish your case study">
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i}><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-20 w-full" /></Card>
            ))}
          </div>
          <div className="space-y-6">
            <Card><Skeleton className="h-40 w-full rounded-lg" /></Card>
            <Card><Skeleton className="h-10 w-full" /></Card>
            <Card><Skeleton className="h-16 w-full" /></Card>
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      )}

      {!loading && loadFailed && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 mb-4 text-gray-500" />
          <p className="text-gray-700 font-medium">Failed to load case study</p>
          <button onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Retry
          </button>
        </div>
      )}

      {!loading && !loadFailed && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            <Card>
              <Input id="title" label="Title" placeholder="Enter case study title"
                value={title} onChange={(e) => setTitle(e.target.value)} />
            </Card>

            <Card>
              <Input id="clientName" label="Client Name" placeholder="e.g. Nigerian Bottling Company"
                value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </Card>

            <Card>
              <label htmlFor="challenge" className="block text-sm font-medium text-gray-700 mb-1">Challenge</label>
              <textarea id="challenge" rows={4} value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="What problem was the client facing?" />
            </Card>

            <Card>
              <label htmlFor="solution" className="block text-sm font-medium text-gray-700 mb-1">Solution</label>
              <textarea id="solution" rows={4} value={solution}
                onChange={(e) => setSolution(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="How did Darafunmi solve it?" />
            </Card>

            <Card>
              <label htmlFor="results" className="block text-sm font-medium text-gray-700 mb-1">Results</label>
              <textarea id="results" rows={4} value={results}
                onChange={(e) => setResults(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="What were the measurable outcomes? (one per line)" />
              <p className="text-xs text-gray-500 mt-1">Enter one result per line</p>
            </Card>

          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Featured Image</h3>
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  <button onClick={removeImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100">
                    <X size={14} className="text-gray-600" />
                  </button>
                  <p className="text-xs text-gray-500 mt-2 truncate">{featuredImage?.name ?? "Current image"}</p>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Click to upload image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg"
                className="hidden" onChange={handleImageChange} />
            </Card>

            <Card>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                <option value="">Select industry</option>
                {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </Card>

            <Card>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input id="isPublished" type="checkbox" checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">Published</label>
                </div>
                <div className="flex items-center">
                  <input id="isFeatured" type="checkbox" checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">Featured</label>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Only published case studies appear on the site</p>
            </Card>

            <Button className="w-full flex justify-center items-center mb-3"
              onClick={handleSubmit} disabled={submitting}>
              <Save size={16} className="mr-2" />
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="secondary" className="w-full"
              onClick={() => navigate("/case-studies")} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EditCaseStudyPage;