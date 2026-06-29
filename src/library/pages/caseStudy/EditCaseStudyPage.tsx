import React, { useState, useRef, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { AlertCircle, Loader2, Save, Upload, X, TriangleAlert } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getCaseStudy, updateCaseStudy } from "../../../services/caseStudy";

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      .catch((err: any) => setLoadError(err?.message || "Failed to load case study."))
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
    setError(null);
    if (!title.trim()) { setError("Case study title is required."); return; }
    if (!studyId) { setError("Could not determine case study ID."); return; }
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
    } catch (err: any) {
      setError(err?.message || "Failed to update case study. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Edit Case Study" pageSubtitle="Update and republish your case study">
      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <Skeleton className="h-4 w-36 mb-5" />
              <div className="space-y-5">
                <div><Skeleton className="h-4 w-12 mb-2" /><Skeleton className="h-10 w-full" /></div>
                <div><Skeleton className="h-4 w-12 mb-2" /><Skeleton className="h-10 w-full" /></div>
                <div><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-10 w-full" /></div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <Skeleton className="h-4 w-20 mb-5" />
              <div className="space-y-5">
                <div><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-24 w-full" /></div>
                <div><Skeleton className="h-4 w-16 mb-2" /><Skeleton className="h-24 w-full" /></div>
                <div><Skeleton className="h-4 w-16 mb-2" /><Skeleton className="h-24 w-full" /></div>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <Skeleton className="h-4 w-28 mb-4" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <div className="flex items-center gap-3 mb-3"><Skeleton className="h-5 w-10 rounded-full" /><Skeleton className="h-4 w-20" /></div>
              <div className="flex items-center gap-3"><Skeleton className="h-5 w-10 rounded-full" /><Skeleton className="h-4 w-20" /></div>
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      )}

      {/* Load Error */}
      {!loading && loadError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load case study</p>
          <p className="text-sm text-gray-400 mt-1">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Edit Form */}
      {!loading && !loadError && (
        <>
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 mb-5">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-5">
              {/* Details */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">Case Study Details</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                    <input
                      type="text"
                      placeholder="Enter case study title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Nigerian Bottling Company"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">Content</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Challenge</label>
                    <textarea
                      rows={4}
                      value={challenge}
                      onChange={(e) => setChallenge(e.target.value)}
                      placeholder="What problem was the client facing?"
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Solution</label>
                    <textarea
                      rows={4}
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      placeholder="How did Darafunmi Precision solve it?"
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Results</label>
                    <textarea
                      rows={4}
                      value={results}
                      onChange={(e) => setResults(e.target.value)}
                      placeholder="What were the measurable outcomes? (one per line)"
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder-gray-400 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">Enter one result per line e.g. "40% reduction in downtime"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Featured Image */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Featured Image</h3>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors group"
                >
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} className="h-32 w-32 object-cover rounded-lg mx-auto" alt="Preview" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={24} className="mx-auto mb-2 text-gray-300 group-hover:text-blue-400 transition-colors" />
                      <p className="text-sm text-gray-400">Click to upload image</p>
                      <p className="text-xs text-gray-300 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* Publish settings */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Publish</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors appearance-none"
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                    </select>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`relative w-10 h-5 rounded-full transition-colors ${isPublished ? "bg-blue-600" : "bg-gray-200"}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublished ? "translate-x-5" : ""}`} />
                    </div>
                    <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="sr-only" />
                    <span className="text-sm text-gray-700">Published</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`relative w-10 h-5 rounded-full transition-colors ${isFeatured ? "bg-blue-600" : "bg-gray-200"}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isFeatured ? "translate-x-5" : ""}`} />
                    </div>
                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="sr-only" />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                  <p className="text-xs text-gray-400">Only published case studies appear on the site</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <><Loader2 size={15} className="animate-spin" />Saving...</>
                    : <><Save size={15} />Save Changes</>
                  }
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/case-studies")}
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default EditCaseStudyPage;
