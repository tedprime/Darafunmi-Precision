import Cookies from "js-cookie";
// industries.jsx
import { apiFetch } from "./api.jsx";
import { toastError } from "./useToast";

const wrap = async (label, fn) => {
  try {
    return await fn();
  } catch (err) {
    if (!err?.status) toastError(`${label}: an unexpected error occurred.`);
    throw err;
  }
};

export async function getIndustries() {
  return wrap("Load industries", () => apiFetch("/industries"));
}

export async function getIndustryBySlug(slug) {
  return wrap("Load industry", () => apiFetch(`/industries/${slug}`));
}

export async function createIndustry({ title, slug, description, content, image, status }) {
  return wrap("Create industry", async () => {
    const token = Cookies.get("token");
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const form = new FormData();
    form.append("title", title);
    if (slug) form.append("slug", slug);
    if (description) form.append("description", description);
    if (content) form.append("content", content);
    if (image) form.append("image", image);
    if (status) form.append("status", status);

    const response = await fetch(`${BASE_URL}/industries`, {
      method: "POST",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: form,
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const message = errBody.message || `Failed to create industry (${response.status}).`;
      toastError(message);
      throw new Error(message);
    }
    return response.json();
  });
}

export async function updateIndustry(id, { title, description, content, image, status }) {
  return wrap("Update industry", async () => {
    const token = Cookies.get("token");
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const form = new FormData();
    if (title) form.append("title", title);
    if (description) form.append("description", description);
    if (content) form.append("content", content);
    if (image) form.append("image", image);
    if (status) form.append("status", status);

    const response = await fetch(`${BASE_URL}/industries/${id}`, {
      method: "PATCH",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: form,
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const message = errBody.message || `Failed to update industry (${response.status}).`;
      toastError(message);
      throw new Error(message);
    }
    return response.json();
  });
}

export async function deleteIndustry(id) {
  return wrap("Delete industry", () =>
    apiFetch(`/industries/${id}`, { method: "DELETE" })
  );
}