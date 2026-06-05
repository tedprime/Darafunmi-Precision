import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import ServiceForm from "./ServiceForm";
import { updateService } from "../../../services/services.jsx";
import { apiFetch } from "../../../services/api.jsx";
import { TriangleAlert } from "lucide-react";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const EditServicePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [initial, setInitial] = useState<{
    title: string; slug: string; description: string;
    content: string; icon: string; imageUrl: string; status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/services/${id!}`)
      .then((res: { data: { title: string; slug: string; description: string; content: string; icon: string; imageUrl: string; status: string } }) => {
        const s = res.data ?? res;
        setInitial({
          title: s.title ?? "",
          slug: s.slug ?? "",
          description: s.description ?? "",
          content: s.content ?? "",
          icon: s.icon ?? "",
          imageUrl: s.imageUrl ?? "",
          status: s.status ?? "active",
        });
      })
      .catch((err: { message: string }) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async ({
    title, description, content, image, status,
  }: {
    title: string; slug: string; description: string;
    content: string; icon: string; image: File | null; status: string;
  }) => {
    setError(null);
    if (!title.trim()) { setError("Title is required."); return; }
    setSubmitting(true);
    try {
      await updateService(id!, { title: title.trim(), description, content, image, status });
      navigate("/services");
    } catch {
      setError("Failed to update service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Edit Service" pageSubtitle="Update service details.">
      {loading && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-32 w-full mb-6" />
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>
      )}

      {!loading && !initial && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load service</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && initial && (
        <ServiceForm
          initialTitle={initial.title}
          initialSlug={initial.slug}
          initialDescription={initial.description}
          initialContent={initial.content}
          initialIcon={initial.icon}
          initialImageUrl={initial.imageUrl}
          initialStatus={initial.status}
          isEdit
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
        />
      )}
    </Layout>
  );
};

export default EditServicePage;