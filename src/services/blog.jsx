import Cookies from "js-cookie";
// blog.jsx
import { apiFetch } from "./api.jsx";
import { toastError } from "./useToast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const wrap = async (label, fn) => {
  try {
    return await fn();
  } catch (err) {
    if (!err?.status) toastError(`${label}: an unexpected error occurred.`);
    throw err;
  }
};

async function apiFormData(endpoint, method, formData) {
  const token = Cookies.get("token");
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: formData,
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const message = errBody.message || `Request failed (${response.status}).`;
    toastError(message);
    throw { status: response.status, message };
  }
  return response.json();
}

export async function getBlogs({ page = 1, limit = 20, search = "", status = "" } = {}) {
  return wrap("Load posts", async () => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await apiFetch(`/blog?${params.toString()}`);
    return { data: res.data ?? [], pagination: res.pagination ?? {} };
  });
}

export async function getBlog(id) {
  return wrap("Load post", async () => {
    const res = await apiFetch(`/blog/${id}`);
    return res.data;
  });
}

export async function createBlog({ title, excerpt, content, category, status, isFeatured, featuredImage, tags }) {
  return wrap("Create post", () => {
    const form = new FormData();
    form.append("title", title);
    if (excerpt) form.append("excerpt", excerpt);
    if (content) form.append("content", content);
    if (category) form.append("category", category);
    if (status) form.append("status", status);
    form.append("isFeatured", String(isFeatured ?? false));
    if (featuredImage) form.append("featuredImage", featuredImage);
    if (tags?.length) tags.forEach((tag) => form.append("tags[]", tag));
    return apiFormData("/blog", "POST", form);
  });
}

export async function updateBlog(id, { title, excerpt, content, category, status, isFeatured, featuredImage, tags }) {
  return wrap("Update post", () => {
    const form = new FormData();
    if (title !== undefined) form.append("title", title);
    if (excerpt !== undefined) form.append("excerpt", excerpt);
    if (content !== undefined) form.append("content", content);
    if (category !== undefined) form.append("category", category);
    if (status !== undefined) form.append("status", status);
    if (isFeatured !== undefined) form.append("isFeatured", String(isFeatured));
    if (featuredImage) form.append("featuredImage", featuredImage);
    if (tags?.length) tags.forEach((tag) => form.append("tags[]", tag));
    return apiFormData(`/blog/${id}`, "PATCH", form);
  });
}

export async function deleteBlog(id) {
  return wrap("Delete post", () =>
    apiFetch(`/blog/${id}`, { method: "DELETE" })
  );
}