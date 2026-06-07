import { apiFetch } from "./api";

export const getQuoteRequests = async ({ page = 1, status = "" } = {}) => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (status) params.set("status", status);
  const query = params.toString();
  const res = await apiFetch(`/quote-requests${query ? `?${query}` : ""}`);
  return {
    data: res?.data ?? [],
    hasMore: res?.pagination?.hasMore ?? false,
  };
};

export const getQuoteRequest = (id) => apiFetch(`/quote-requests/${id}`);

export const updateQuoteRequestStatus = (id, status) =>
  apiFetch(`/quote-requests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const deleteQuoteRequest = (id) =>
  apiFetch(`/quote-requests/${id}`, { method: "DELETE" });