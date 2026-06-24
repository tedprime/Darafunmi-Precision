// siteUsers.jsx
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

export async function getSiteUsers({ search = "", page = 1, limit = 20 } = {}) {
  return wrap("Load users", () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", String(limit));
    return apiFetch(`/site-users?${params.toString()}`);
  });
}

export async function getSiteUser(id) {
  return wrap("Load user", () => apiFetch(`/site-users/${id}`));
}

export async function toggleSiteUserActive(id) {
  return wrap("Toggle user status", () =>
    apiFetch(`/site-users/${id}/toggle-active`, { method: "PATCH" })
  );
}
