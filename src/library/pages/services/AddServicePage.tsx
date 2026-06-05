import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import ServiceForm from "./ServiceForm";
import { createService } from "../../../services/services.jsx";

const AddServicePage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async ({
    title, slug, description, content, icon, image, status,
  }: {
    title: string; slug: string; description: string;
    content: string; icon: string; image: File | null; status: string;
  }) => {
    setError(null);
    if (!title.trim()) { setError("Title is required."); return; }
    setSubmitting(true);
    try {
      await createService({ title: title.trim(), slug, description, content, icon, image, status });
      navigate("/services");
    } catch (err: unknown) {
      setError(
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to create service."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Add Service" pageSubtitle="Create a new service offering.">
      <ServiceForm submitting={submitting} error={error} onSubmit={handleSubmit} />
    </Layout>
  );
};

export default AddServicePage;