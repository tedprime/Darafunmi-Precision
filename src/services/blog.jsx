import { apiFetch } from "./api.jsx";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Shared helper for multipart/form-data requests (file uploads).
 * Does NOT set Content-Type — the browser sets it with the boundary automatically.
 */
async function apiFormData(endpoint, method, formData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

// ─── GET /blog ────────────────────────────────────────────────────────────────
// Supports: page, limit, search, status query params
export async function getBlogs({
  page = 1,
  limit = 20,
  search = "",
  status = "",
} = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set("search", search);
  if (status) params.set("status", status);

  const res = await apiFetch(`/blog?${params.toString()}`);
  // res shape: { success: true, data: [...], pagination: {...} }
  return {
    data: res.data ?? [],
    pagination: res.pagination ?? {},
  };
}

// ─── GET /blog/{id} ───────────────────────────────────────────────────────────
export async function getBlog(id) {
  const res = await apiFetch(`/blog/${id}`);
  return res.data;
}

// ─── POST /blog ───────────────────────────────────────────────────────────────
// multipart/form-data — includes optional featuredImage file
export async function createBlog({
  title,
  excerpt,
  content,
  category,
  status,
  isFeatured,
  featuredImage,
  tags,
}) {
  const form = new FormData();
  form.append("title", title);
  if (excerpt) form.append("excerpt", excerpt);
  if (content) form.append("content", content);
  if (category) form.append("category", category);
  if (status) form.append("status", status);
  form.append("isFeatured", String(isFeatured ?? false));
  if (featuredImage) form.append("featuredImage", featuredImage);
  if (tags && tags.length > 0) {
    tags.forEach((tag) => form.append("tags[]", tag));
  }

  return apiFormData("/blog", "POST", form);
}

// ─── PATCH /blog/{id} ─────────────────────────────────────────────────────────
// multipart/form-data — same fields, all optional
export async function updateBlog(
  id,
  {
    title,
    excerpt,
    content,
    category,
    status,
    isFeatured,
    featuredImage,
    tags,
  },
) {
  const form = new FormData();
  if (title !== undefined) form.append("title", title);
  if (excerpt !== undefined) form.append("excerpt", excerpt);
  if (content !== undefined) form.append("content", content);
  if (category !== undefined) form.append("category", category);
  if (status !== undefined) form.append("status", status);
  if (isFeatured !== undefined) form.append("isFeatured", String(isFeatured));
  if (featuredImage) form.append("featuredImage", featuredImage);
  if (tags && tags.length > 0) {
    tags.forEach((tag) => form.append("tags[]", tag));
  }

  return apiFormData(`/blog/${id}`, "PATCH", form);
}

// ─── DELETE /blog/{id} ────────────────────────────────────────────────────────
export async function deleteBlog(id) {
  return apiFetch(`/blog/${id}`, { method: "DELETE" });
}
