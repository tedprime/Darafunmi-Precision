import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import ProductForm from "./ProductForm";
import { createProduct } from "../../../services/product.jsx";

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async ({ name, categoryId, price, stock, description, image, status }: {
    name: string; categoryId: string; price: string; stock: string;
    description: string; image: File | null; status: string;
  }) => {
    setError(null);
    if (!name.trim()) { setError("Product name is required."); return; }
    setSubmitting(true);
    try {
      await createProduct({ name: name.trim(), categoryId, price, stock, description: description.trim(), image, status });
      navigate("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Add Product" pageSubtitle="Create and manage your products here.">
      <ProductForm submitting={submitting} error={error} onSubmit={handleSubmit} />
    </Layout>
  );
};

export default AddProductPage;