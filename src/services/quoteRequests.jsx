import { apiFetch } from "./api";

export const getQuoteRequests = ({ page = 1, status = "" } = {}) => {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (status) params.set("status", status);
  const query = params.toString();
  return apiFetch(`/quote-requests${query ? `?${query}` : ""}`);
};

export const getQuoteRequest = (id) => apiFetch(`/quote-requests/${id}`);

export const updateQuoteRequestStatus = (id, status) =>
  apiFetch(`/quote-requests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const deleteQuoteRequest = (id) =>
  apiFetch(`/quote-requests/${id}`, { method: "DELETE" });
