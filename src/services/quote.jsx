// quote.jsx
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

export const getQuotes = ({ page = 1, limit = 20, search = "", status = "" } = {}) =>
  wrap("Load quotes", async () => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    const res = await apiFetch(`/quotes?${params.toString()}`);
    if (!res.success) {
      toastError(res.message || "Failed to load quotes.");
      throw new Error(res.message);
    }
    return { data: res.data, count: res.count };
  });

export const createQuote = (body) =>
  wrap("Create quote", () =>
    apiFetch("/quotes", { method: "POST", body: JSON.stringify(body) })
  );

export const updateQuote = (id, body) =>
  wrap("Update quote", () =>
    apiFetch(`/quotes/${id}`, { method: "PATCH", body: JSON.stringify(body) })
  );

export const deleteQuote = (id) =>
  wrap("Delete quote", () =>
    apiFetch(`/quotes/${id}`, { method: "DELETE" })
  );

export const getQuoteById = (id) =>
  wrap("Load quote", async () => {
    const res = await apiFetch(`/quotes/${id}`);
    if (!res.success) {
      toastError(res.message || "Failed to load quote.");
      throw new Error(res.message);
    }
    return res.data;
  });

export const dispatchQuote = (id) =>
  wrap("Dispatch quote", () =>
    apiFetch(`/quotes/${id}/dispatch`, { method: "POST" })
  );

export const convertQuoteToOrder = (id) =>
  wrap("Convert quote to order", () =>
    apiFetch(`/quotes/${id}/convert-to-order`, { method: "POST" })
  );