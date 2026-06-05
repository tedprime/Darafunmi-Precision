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
 * @param {{ title: string, slug?: string, description?: string, content?: string, icon?: string, image?: File|null, status?: string }} payload
 */
export async function createService({ title, slug, description, content, icon, image, status }) {
  const form = new FormData();
  form.append("title", title);
  if (slug) form.append("slug", slug);
  if (description) form.append("description", description);
  if (content) form.append("content", content);
  if (icon) form.append("icon", icon);
  if (image) form.append("image", image);
  if (status) form.append("status", status);

  return apiFetch("/services", {
    method: "POST",
    body: form,
    headers: {}, // let browser set Content-Type with boundary
  });
}

/**
 * PATCH /services/:id
 * Update a service (admin). multipart/form-data.
 * @param {number|string} id
 * @param {{ title?: string, description?: string, content?: string, image?: File|null, status?: string }} payload
 */
export async function updateService(id, { title, description, content, image, status }) {
  const form = new FormData();
  if (title) form.append("title", title);
  if (description) form.append("description", description);
  if (content) form.append("content", content);
  if (image) form.append("image", image);
  if (status) form.append("status", status);

  return apiFetch(`/services/${id}`, {
    method: "PATCH",
    body: form,
    headers: {}, // let browser set Content-Type with boundary
  });
}

/**
 * DELETE /services/:id
 * Delete a service (admin).
 * @param {number|string} id
 */
export async function deleteService(id) {
  return apiFetch(`/services/${id}`, { method: "DELETE" });
}