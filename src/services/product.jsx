// product.jsx
import { apiFetch } from "./api";
import { toastError } from "./useToast";

const wrap = async (label, fn) => {
  try {
    return await fn();
  } catch (err) {
    if (!err?.status) toastError(`${label}: an unexpected error occurred.`);
    throw err;
  }
};

export const getProducts = ({ page = 1, limit = 20, search = "", status = "", categoryId = "" } = {}) =>
  wrap("Load products", async () => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    if (categoryId) params.append("categoryId", categoryId);
    const res = await apiFetch(`/products?${params.toString()}`);
    if (!res.success) {
      toastError(res.message || "Failed to load products.");
      throw new Error(res.message);
    }
    return { data: res.data, count: res.count };
  });

const buildProductFormData = ({ name, categoryId, price, stock, description, image }) => {
  const formData = new FormData();
  if (name) formData.append("name", name);
  if (categoryId) formData.append("categoryId", String(categoryId));
  if (price !== undefined && price !== "") formData.append("price", String(price));
  if (stock !== undefined && stock !== "") formData.append("stock", String(stock));
  if (description) formData.append("description", description);
  formData.append("features", "[]");
  if (image) formData.append("image", image);
  return formData;
};

export const createProduct = (fields) =>
  wrap("Create product", async () => {
    const token = localStorage.getItem("token");
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: buildProductFormData(fields),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const message = errBody.message || `Failed to create product (${response.status}).`;
      toastError(message);
      throw new Error(message);
    }
    return response.json();
  });

export const updateProduct = (id, fields) =>
  wrap("Update product", async () => {
    const token = localStorage.getItem("token");
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: "PATCH",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: buildProductFormData(fields),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const message = errBody.message || `Failed to update product (${response.status}).`;
      toastError(message);
      throw new Error(message);
    }
    return response.json();
  });

export const deleteProduct = (id) =>
  wrap("Delete product", () =>
    apiFetch(`/products/${id}`, { method: "DELETE" })
  );