import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { AlertCircle, ImageIcon, Loader2, Package, Save, Upload, X } from "lucide-react";
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
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

const ProductForm = ({
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
}: ProductFormProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialName);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [price, setPrice] = useState(initialPrice);
  const [stock, setStock] = useState(initialStock);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState(initialStatus);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialImageUrl);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data ?? []))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ name, categoryId, price, stock, description, image, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Package size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Product details</h3>
                <p className="text-xs text-gray-500">Core information shown in the product catalog.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="productName" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Product Name
                </label>
                <input
                  id="productName"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter product name"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Category
                </label>
                {categoriesLoading ? (
                  <Skeleton className="h-10 w-full rounded-lg" />
                ) : (
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={String(category.id)}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="0.00"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="stock" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Stock Quantity
                </label>
                <input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                  placeholder="0"
                  className={fieldClass}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Enter product description"
                  className={`${fieldClass} resize-none leading-6`}
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-gray-50 p-2 text-gray-600">
                <ImageIcon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Product image</h3>
                <p className="text-xs text-gray-500">PNG or JPG image for this product.</p>
              </div>
            </div>

            {imagePreview ? (
              <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                <img src={imagePreview} alt="Product preview" className="aspect-[4/3] w-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-gray-600 shadow hover:bg-gray-100"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/40"
              >
                <Upload className="mb-3 h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Upload image</span>
                <span className="mt-1 text-xs text-gray-400">Click to browse files</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleImageChange}
            />

            {imagePreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Replace image
              </button>
            )}
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Publishing</h3>
            <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className={fieldClass}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="low-stock">Low Stock</option>
            </select>
          </section>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={submitting || categoriesLoading}>
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save Product
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/products")}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
};

export default ProductForm;
