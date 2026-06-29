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