import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import ServiceForm from "./ServiceForm";
import { createService } from "../../../services/services.jsx";

const AddServicePage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (fields: { name: string; description: string; image: File | null }) => {
    setError(null);
    if (!fields.name.trim()) {
      setError("Service name is required.");
      return;
    }

    setSubmitting(true);
    try {
      await createService({
        name: fields.name.trim(),
        description: fields.description.trim(),
        image: fields.image,
      });
      navigate("/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create service.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Add Service" pageSubtitle="Populate fields to display a new core business service offering.">
      <ServiceForm submitting={submitting} error={error} onSubmit={handleSubmit} />
    </Layout>
  );
};

export default AddServicePage;