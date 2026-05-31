import { apiFetch } from "./api";

export const getProducts = ({
  page = 1,
  limit = 20,
  search = "",
  status = "",
  categoryId = "",
} = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  if (categoryId) params.append("categoryId", categoryId);
  return apiFetch(`/products?${params.toString()}`).then((res) => {
    if (!res.success) throw new Error(res.message);
    return { data: res.data, count: res.count };
  });
};

const buildProductFormData = ({
  name,
  categoryId,
  price,
  stock,
  description,
  image,
}) => {
  const formData = new FormData();
  if (name) formData.append("name", name);
  if (categoryId) formData.append("categoryId", String(categoryId));
  if (price !== undefined && price !== "")
    formData.append("price", String(price));
  if (stock !== undefined && stock !== "")
    formData.append("stock", String(stock));
  if (description) formData.append("description", description);
  formData.append("features", "[]");
  if (image) formData.append("image", image);
  return formData;
};

export const createProduct = async (fields) => {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: buildProductFormData(fields),
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || `API error: ${response.status}`);
  }
  return response.json();
};

export const updateProduct = async (id, fields) => {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PATCH",
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: buildProductFormData(fields),
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || `API error: ${response.status}`);
  }
  return response.json();
};

export const deleteProduct = (id) =>
  apiFetch(`/products/${id}`, { method: "DELETE" });
