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

export async function getServices() {
  return wrap("Load services", async () => {
    const res = await apiFetch("/services");
    const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    return { data };
  });
}

export async function createService({ title, slug, description, content, icon, image, isFeatured, status }) {
  return wrap("Create service", () => {
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
  });
}

export async function updateService(id, { title, description, content, image, status }) {
  return wrap("Update service", () => {
    const form = new FormData();
    if (title !== undefined) form.append("title", title);
    if (description !== undefined) form.append("description", description);
    if (content !== undefined) form.append("content", content);
    if (image) form.append("image", image);
    if (status !== undefined) form.append("status", status);
    return apiFormData(`/services/${id}`, "PATCH", form);
  });
}

export async function deleteService(id) {
  return wrap("Delete service", () =>
    apiFetch(`/services/${id}`, { method: "DELETE" })
  );
}