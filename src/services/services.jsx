import { apiFetch } from "./api.jsx";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiFormData(endpoint, method, formData) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });
  if (!response.ok) throw { status: response.status, message: `API error: ${response.status}` };
  return response.json();
}

// ─── GET /services ────────────────────────────────────────────────────────────
export async function getServices() {
  const res = await apiFetch("/services");
  // Handle both { data: [...] } and direct array responses
  const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
  return { data };
}

// ─── POST /services ───────────────────────────────────────────────────────────
export async function createService({ title, slug, description, content, icon, image, isFeatured, status }) {
  const form = new FormData();
  form.append("title", title);
  if (slug) form.append("slug", slug);
  if (description) form.append("description", description);
  if (content) form.append("content", content);
  if (icon) form.append("icon", icon);
  if (image) form.append("image", image);
  form.append("isFeatured", String(isFeatured ?? false));
  if (status) form.append("status", status);
  return apiFormData("/services", "POST", form);
}

// ─── PATCH /services/{id} ─────────────────────────────────────────────────────
export async function updateService(id, { title, description, content, image, status }) {
  const form = new FormData();
  if (title !== undefined) form.append("title", title);
  if (description !== undefined) form.append("description", description);
  if (content !== undefined) form.append("content", content);
  if (image) form.append("image", image);
  if (status !== undefined) form.append("status", status);
  return apiFormData(`/services/${id}`, "PATCH", form);
}

// ─── DELETE /services/{id} ────────────────────────────────────────────────────
export async function deleteService(id) {
  return apiFetch(`/services/${id}`, { method: "DELETE" });
}