// services.jsx
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
  const token = localStorage.getItem("token");
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

// GET /services - list all services (public, no params)
export async function getServices() {
  return wrap("Load services", async () => {
    const res = await apiFetch(`/services`);
    return res.data ?? [];
  });
}

// GET /services/{slug} - get a single service by slug (public)
export async function getServiceBySlug(slug) {
  return wrap("Load service", async () => {
    const res = await apiFetch(`/services/${slug}`);
    return res.data;
  });
}

// No GET /services/{id} exists in the API — for edit pages that load by
// numeric id, fetch the full list and find the match client-side.
export async function getServiceById(id) {
  return wrap("Load service", async () => {
    const services = await getServices();
    const match = services.find((s) => String(s.id) === String(id));
    if (!match) throw { status: 404, message: "Service not found." };
    return match;
  });
}

// POST /services - create a service (admin, multipart/form-data)
export async function createService({ title, slug, description, content, icon, image, isFeatured, status }) {
  return wrap("Create service", () => {
    const form = new FormData();
    form.append("title", title);
    if (slug) form.append("slug", slug);
    if (description) form.append("description", description);
    if (content) form.append("content", content);
    if (icon) form.append("icon", icon);
    if (status) form.append("status", status);
    form.append("isFeatured", String(isFeatured ?? false));
    if (image) form.append("image", image);
    return apiFormData("/services", "POST", form);
  });
}

// PATCH /services/{id} - update a service (admin, multipart/form-data)
// Per the documented API, only title, description, content, image and status
// are accepted here — slug, icon and isFeatured can't be changed via this endpoint.
export async function updateService(id, { title, description, content, image, status }) {
  return wrap("Update service", () => {
    const form = new FormData();
    if (title !== undefined) form.append("title", title);
    if (description !== undefined) form.append("description", description);
    if (content !== undefined) form.append("content", content);
    if (status !== undefined) form.append("status", status);
    if (image) form.append("image", image);
    return apiFormData(`/services/${id}`, "PATCH", form);
  });
}

// DELETE /services/{id} - delete a service (admin)
export async function deleteService(id) {
  return wrap("Delete service", () =>
    apiFetch(`/services/${id}`, { method: "DELETE" })
  );
}