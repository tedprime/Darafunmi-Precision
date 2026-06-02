import { apiFetch } from "./api";

export const getQuotes = ({
  page = 1,
  limit = 20,
  search = "",
  status = "",
} = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  return apiFetch(`/quotes?${params.toString()}`).then((res) => {
    if (!res.success) throw new Error(res.message);
    return { data: res.data, count: res.count };
  });
};

export const createQuote = (body) =>
  apiFetch("/quotes", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateQuote = (id, body) =>
  apiFetch(`/quotes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const deleteQuote = (id) =>
  apiFetch(`/quotes/${id}`, { method: "DELETE" });

export const getQuoteById = (id) =>
  apiFetch(`/quotes/${id}`).then((res) => {
    if (!res.success) throw new Error(res.message);
    return res.data;
  });
