import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import ProductForm from "./ProductForm";
import { updateProduct } from "../../../services/product.jsx";
import { apiFetch } from "../../../services/api";

const EditProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [initial, setInitial] = useState<{
    name: string; categoryId: string; price: string;
    stock: string; description: string; imageUrl: string; status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/products/${id}`)
      .then((res: { data: { name: string; categoryId: number; price: number; stock: number; description: string; imageUrl: string; status: string } }) => {
        const p = res.data;
        setInitial({
          name: p.name ?? "",
          categoryId: p.categoryId ? String(p.categoryId) : "",
          price: p.price !== undefined ? String(p.price) : "",
          stock: p.stock !== undefined ? String(p.stock) : "",
          description: p.description ?? "",
          imageUrl: p.imageUrl ?? "",
          status: p.status ?? "active",
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async ({ name, categoryId, price, stock, description, image, status }: {
    name: string; categoryId: string; price: string; stock: string;
    description: string; image: File | null; status: string;
  }) => {
    setError(null);
    if (!name.trim()) { setError("Product name is required."); return; }
    setSubmitting(true);
    try {
      await updateProduct(id, { name: name.trim(), categoryId, price, stock, description: description.trim(), image, status });
      navigate("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Edit Product" pageSubtitle="Update product details.">
      {loading && <p className="text-sm text-gray-500">Loading product...</p>}
      {!loading && initial && (
        <ProductForm
          initialName={initial.name}
          initialCategoryId={initial.categoryId}
          initialPrice={initial.price}
          initialStock={initial.stock}
          initialDescription={initial.description}
          initialImageUrl={initial.imageUrl}
          initialStatus={initial.status}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
        />
      )}
    </Layout>
  );
};

export default EditProductPage;