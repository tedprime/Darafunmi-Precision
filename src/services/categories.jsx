import { apiFetch } from "./api";

export const getCategories = ({ search = "", page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append("search", search);
  return apiFetch(`/categories?${params.toString()}`).then((res) => {
    if (!res.success) throw new Error(res.message);
    return { data: res.data, count: res.count };
  });
};

export const createCategory = (body) =>
  apiFetch("/categories", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateCategory = (id, body) =>
  apiFetch(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const deleteCategory = (id) =>
  apiFetch(`/categories/${id}`, { method: "DELETE" });
