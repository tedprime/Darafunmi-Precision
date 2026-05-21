
import { apiFetch } from "./api";

export const getBlogs = () =>
  apiFetch("/blog").then((res) => {
    if (!res.success) throw new Error(res.message);
    return res.data;
  });

export const deleteBlog = (id) => apiFetch(`/blog/${id}`, { method: "DELETE" });
