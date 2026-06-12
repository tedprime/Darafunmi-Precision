import React, { useState, useRef } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Image as ImageIcon, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createCaseStudy } from "../../../services/caseStudy";
import { toastError } from "../../../services/useToast";

const INDUSTRIES = [
  "Manufacturing", "Oil & Gas", "Pharmaceuticals", "Food & Beverage",
  "Aerospace", "Automotive", "Energy", "Other",
] as const;

const AddCaseStudyPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [clientName, setClientName] = useState("");
  const [industry, setIndustry] = useState("");
  const [challenge, setChallenge] = useState("");
  const [solution, setSolution] = useState("");
  const [results, setResults] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slugify = (str: string) =>
    str.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug || slug === slugify(title)) setSlug(slugify(val));
  };

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
    setSubmitting(true);
    try {
      await createCaseStudy({
        title: title.trim(),
        slug: slug.trim() || undefined,
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
      // toastError already fired inside createCaseStudy
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Add Case Study" pageSubtitle="Create and publish a new case study">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          <Card>
            <Input id="title" label="Title" placeholder="Enter case study title"
              value={title} onChange={handleTitleChange} />
            <p className="text-xs text-gray-500 mt-1">Make it compelling and descriptive for better SEO</p>
          </Card>

          <Card>
            <Input id="slug" label="Slug" placeholder="auto-generated-from-title"
              value={slug} onChange={(e) => setSlug(e.target.value)} />
            <p className="text-xs text-gray-500 mt-1">URL-friendly identifier — auto-filled from title, editable</p>
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
            <p className="text-xs text-gray-500 mt-1">Enter one result per line e.g. "40% reduction in downtime"</p>
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
                <p className="text-xs text-gray-500 mt-2 truncate">{featuredImage?.name}</p>
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
            {submitting ? "Saving..." : "Save Case Study"}
          </Button>
          <Button variant="secondary" className="w-full"
            onClick={() => navigate("/case-studies")} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AddCaseStudyPage;