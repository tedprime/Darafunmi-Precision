import { apiFetch } from "./api.jsx";

/**
 * GET /services
 * List all services (public).
 */
export async function getServices() {
  return apiFetch("/services");
}

/**
 * GET /services/:slug
 * Get a single service by slug (public).
 * @param {string} slug
 */
export async function getServiceBySlug(slug) {
  return apiFetch(`/services/${slug}`);
}

/**
 * POST /services
 * Create a new service (admin). multipart/form-data.
 * DB columns: name, slug, short_description, description, icon, image
 * @param {{ name: string, slug?: string, shortDescription?: string, description?: string, icon?: string, image?: File|null, status?: string }} payload
 */
export async function createService({ name, slug, shortDescription, description, icon, image, status }) {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const form = new FormData();
  form.append("name", name);
  if (slug) form.append("slug", slug);
  if (shortDescription) form.append("short_description", shortDescription);
  if (description) form.append("description", description);
  if (icon) form.append("icon", icon);
  if (image) form.append("image", image);
  if (status) form.append("status", status);

  const response = await fetch(`${BASE_URL}/services`, {
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
 * PATCH /services/:id
 * Update a service (admin). multipart/form-data.
 * @param {number|string} id
 * @param {{ name?: string, shortDescription?: string, description?: string, icon?: string, image?: File|null, status?: string }} payload
 */
export async function updateService(id, { name, shortDescription, description, icon, image, status }) {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const form = new FormData();
  if (name) form.append("name", name);
  if (shortDescription) form.append("short_description", shortDescription);
  if (description) form.append("description", description);
  if (icon) form.append("icon", icon);
  if (image) form.append("image", image);
  if (status) form.append("status", status);

  const response = await fetch(`${BASE_URL}/services/${id}`, {
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
 * DELETE /services/:id
 * Delete a service (admin).
 * @param {number|string} id
 */
export async function deleteService(id) {
  return apiFetch(`/services/${id}`, { method: "DELETE" });
}