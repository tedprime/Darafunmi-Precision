// categories.jsx
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

export const getCategories = ({ search = "", page = 1, limit = 50 } = {}) =>
  wrap("Load categories", async () => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append("search", search);
    const res = await apiFetch(`/categories?${params.toString()}`);
    if (!res.success) {
      toastError(res.message || "Failed to load categories.");
      throw new Error(res.message);
    }
    return { data: res.data, count: res.count };
  });

export const createCategory = (body) =>
  wrap("Create category", () =>
    apiFetch("/categories", {
      method: "POST",
      body: JSON.stringify(body),
    })
  );

export const updateCategory = (id, body) =>
  wrap("Update category", () =>
    apiFetch(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
  );

export const deleteCategory = (id) =>
  wrap("Delete category", () =>
    apiFetch(`/categories/${id}`, { method: "DELETE" })
  );