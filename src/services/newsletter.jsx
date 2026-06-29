// newsletter.jsx
import { apiFetch } from "./api.jsx";
import { toastError, toastSuccess } from "./useToast";

const wrap = async (label, fn) => {
  try {
    return await fn();
  } catch (err) {
    if (!err?.status) toastError(`${label}: an unexpected error occurred.`);
    throw err;
  }
};

/**
 * @param {{ page?: number, limit?: number, search?: string, isActive?: boolean }} [opts]
 */
export async function getNewsletterSubscribers({ page = 1, limit = 20, search = "", isActive } = {}) {
  return wrap("Load subscribers", () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (isActive !== undefined) params.set("isActive", String(isActive));
    return apiFetch(`/newsletter?${params.toString()}`);
  });
}

export async function unsubscribeNewsletter(email) {
  return wrap("Unsubscribe", () =>
    apiFetch("/newsletter/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  );
}

/* ── Campaigns ─────────────────────────────────────────────────────── */

/**
 * @param {{ page?: number, limit?: number }} [opts]
 */
export async function getCampaigns({ page = 1, limit = 20 } = {}) {
  return wrap("Load campaigns", () => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiFetch(`/newsletter/campaigns?${params}`);
  });
}

export async function getCampaign(id) {
  return wrap("Load campaign", () => apiFetch(`/newsletter/campaigns/${id}`));
}

/**
 * @param {{ subject: string, preheader?: string, content: string }} data
 */
export async function createCampaign(data) {
  return wrap("Create campaign", async () => {
    const res = await apiFetch("/newsletter/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    });
    toastSuccess("Draft saved.");
    return res;
  });
}

/**
 * @param {number} id
 * @param {{ subject?: string, preheader?: string, content?: string }} data
 */
export async function updateCampaign(id, data) {
  return wrap("Update campaign", async () => {
    const res = await apiFetch(`/newsletter/campaigns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    toastSuccess("Draft saved.");
    return res;
  });
}

export async function deleteCampaign(id) {
  return wrap("Delete campaign", async () => {
    const res = await apiFetch(`/newsletter/campaigns/${id}`, { method: "DELETE" });
    toastSuccess("Campaign deleted.");
    return res;
  });
}

export async function sendCampaign(id) {
  return wrap("Send campaign", () =>
    apiFetch(`/newsletter/campaigns/${id}/send`, { method: "POST" })
  );
}