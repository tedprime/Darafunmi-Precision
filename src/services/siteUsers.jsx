import { apiFetch } from "./api.jsx";

/**
 * GET /site-users
 * List all registered site users (admin).
 * @param {Object} params
 * @param {string} [params.search] - Filter by email
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 */
export async function getSiteUsers({ search = "", page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", String(page));
  params.set("limit", String(limit));
  return apiFetch(`/site-users?${params.toString()}`);
}

/**
 * GET /site-users/:id
 * Get a single site user (admin).
 * @param {number|string} id
 */
export async function getSiteUser(id) {
  return apiFetch(`/site-users/${id}`);
}

/**
 * PATCH /site-users/:id/toggle-active
 Toggle a site user's active status (admin).
 * @param {number|string} id
 */
export async function toggleSiteUserActive(id) {
  return apiFetch(`/site-users/${id}/toggle-active`, {
    method: "PATCH",
  });
}