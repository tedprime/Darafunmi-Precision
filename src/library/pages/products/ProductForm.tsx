import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Upload, X } from "lucide-react";
import { getCategories } from "../../../services/categories";

interface Category {
  id: number;
  name: string;
  status: string;
}

interface ProductFormProps {
  initialName?: string;
  initialCategoryId?: string;
  initialPrice?: string;
  initialStock?: string;
  initialDescription?: string;
  initialImageUrl?: string;
  initialStatus?: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (fields: {
    name: string;
    categoryId: string;
    price: string;
    stock: string;
    description: string;
    image: File | null;
    status: string;
  }) => void;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const ProductForm: React.FC<ProductFormProps> = ({
  initialName = "",
  initialCategoryId = "",
  initialPrice = "",
  initialStock = "",
  initialDescription = "",
  initialImageUrl = "",
  initialStatus = "active",
  submitting,
  error,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialName);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [price, setPrice] = useState(initialPrice);
  const [stock, setStock] = useState(initialStock);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState(initialStatus);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialImageUrl);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data))
      .catch(() => {})
      .finally(() => setCategoriesLoading(false));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, categoryId, price, stock, description, image, status });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Product Details Card */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Product Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <Input
            id="productName"
            label="Product Name"
            placeholder="Enter product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            {categoriesLoading ? (
              <Skeleton className="h-10 w-full mt-1" />
            ) : (
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <Input
            id="price"
            label="Price"
            placeholder="Enter price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Input
            id="stock"
            label="Stock Quantity"
            placeholder="Enter stock quantity"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="low-stock">Low Stock</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter product description"
          />
        </div>
      </Card>

      {/* Product Image Card */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Product Image
        </h3>
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
            >
              <X size={14} className="text-gray-600" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600">
              Drag and drop your image here
            </p>
            <p className="text-xs text-gray-500 mt-1">or click to browse</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={handleImageChange}
        />
      </Card>

      <div className="flex space-x-4">
        <Button type="submit" disabled={submitting || categoriesLoading}>
          {submitting ? "Saving..." : "Save Product"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/products")}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;