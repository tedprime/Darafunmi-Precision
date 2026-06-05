import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Card from "../../components/common/Card";
import ServiceForm from "./ServiceForm";
import { updateService } from "../../../services/services.jsx";
import { apiFetch } from "../../../services/api";
import { TriangleAlert } from "lucide-react";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

interface InitialData {
  name: string;
  description: string;
  imageUrl: string;
}

const EditServicePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [initial, setInitial] = useState<InitialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/services/${id}`)
      .then((res) => {
        setInitial({
          name: res.data.name ?? "",
          description: res.data.description ?? "",
          imageUrl: res.data.imageUrl ?? "",
        });
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (fields: { name: string; description: string; image: File | null }) => {
    setError(null);
    if (!fields.name.trim()) {
      setError("Service name is required.");
      return;
    }

    setSubmitting(true);
    try {
      await updateService(id!, {
        name: fields.name.trim(),
        description: fields.description.trim(),
        image: fields.image,
      });
      navigate("/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update service.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Edit Service" pageSubtitle="Modify parameter arrays, textual briefs, or associated assets.">
      {loading && (
        <div className="max-w-3xl space-y-6">
          <Card className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-28 w-full" />
          </Card>
          <Card><Skeleton className="h-32 w-full" /></Card>
        </div>
      )}

      {!loading && error && !initial && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TriangleAlert className="w-8 h-8 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load service item parameters</p>
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
          initialName={initial.name}
          initialDescription={initial.description}
          initialImageUrl={initial.imageUrl}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
        />
      )}
    </Layout>
  );
};

export default EditServicePage;