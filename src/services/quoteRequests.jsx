// quoteRequests.jsx
import { apiFetch } from "./api";
import { toastError } from "./useToast";

const wrap = async (label, fn) => {
  try {
    return await fn();
  } catch (err) {
    if (!err?.status) toastError(`${label}: an unexpected error occurred.`);
    throw err;
  }
};

export const getQuoteRequests = ({ page = 1, status = "" } = {}) =>
  wrap("Load quote requests", async () => {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (status) params.set("status", status);
    const query = params.toString();
    const res = await apiFetch(`/quote-requests${query ? `?${query}` : ""}`);
    return {
      data: res?.data ?? [],
      hasMore: res?.pagination?.hasMore ?? false,
    };
  });

export const getQuoteRequest = (id) =>
  wrap("Load quote request", () => apiFetch(`/quote-requests/${id}`));

export const updateQuoteRequestStatus = (id, status) =>
  wrap("Update quote request", () =>
    apiFetch(`/quote-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  );

export const deleteQuoteRequest = (id) =>
  wrap("Delete quote request", () =>
    apiFetch(`/quote-requests/${id}`, { method: "DELETE" })
  );

export const declineQuoteRequest = (id, reason = "") =>
  wrap("Decline quote request", () =>
    apiFetch(`/quote-requests/${id}/decline`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    })
  );