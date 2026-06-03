import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import ProductForm from "./ProductForm";
import { updateProduct } from "../../../services/product.jsx";
import { apiFetch } from "../../../services/api";
import { TriangleAlert } from "lucide-react";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

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
    } catch {
      setError("Failed to update product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Edit Product" pageSubtitle="Update product details.">

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          {/* Image upload placeholder */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-40 w-full mb-6" />

            {/* Two column fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>

            {/* Description textarea */}
            <div className="mb-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-24 w-full" />
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>
      )}

      {/* Error State — only for load errors */}
      {!loading && !initial && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-4"><TriangleAlert className="w-8 h-8"/></p>
          <p className="text-gray-700 font-medium">Failed to load product</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Product Form */}
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