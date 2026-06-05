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
 * Toggle a site user's active status (admin).
 * @param {number|string} id
 */
export async function toggleSiteUserActive(id) {
  return apiFetch(`/site-users/${id}/toggle-active`, {
    method: "PATCH",
  });
}


// ─── Site User Auth (customer-facing, called on behalf of users) ───────────

/**
 * POST /user/auth/register
 * Register a new site user (admin can use to create accounts on behalf of customers).
 * @param {{ name: string, email: string, password: string, phone: string, company: string }} payload
 */
export async function registerSiteUser({ name, email, password, phone, company }) {
  return apiFetch("/user/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, phone, company }),
  });
}