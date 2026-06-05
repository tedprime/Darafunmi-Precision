import { apiFetch } from "./api.jsx";

/**
 * GET /industries
 * List all industries (public).
 */
export async function getIndustries() {
  return apiFetch("/industries");
}

/**
 * GET /industries/:slug
 * Get a single industry by slug (public).
 * @param {string} slug
 */
export async function getIndustryBySlug(slug) {
  return apiFetch(`/industries/${slug}`);
}

/**
 * POST /industries
 * Create a new industry (admin). multipart/form-data.
 * @param {{ title: string, slug?: string, description?: string, content?: string, image?: File|null, status?: string }} payload
 */
export async function createIndustry({ title, slug, description, content, image, status }) {
  const token = localStorage.getItem("token");
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
    throw new Error(errBody.message || `API error: ${response.status}`);
  }
  return response.json();
}

/**
 * PATCH /industries/:id
 * Update an industry (admin). multipart/form-data.
 * @param {number|string} id
 * @param {{ title?: string, description?: string, content?: string, image?: File|null, status?: string }} payload
 */
export async function updateIndustry(id, { title, description, content, image, status }) {
  const token = localStorage.getItem("token");
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
    throw new Error(errBody.message || `API error: ${response.status}`);
  }
  return response.json();
}

/**
 * DELETE /industries/:id
 * Delete an industry (admin).
 * @param {number|string} id
 */
export async function deleteIndustry(id) {
  return apiFetch(`/industries/${id}`, { method: "DELETE" });
}