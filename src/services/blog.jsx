import { apiFetch } from "./api";

export const getBlogs = () =>
  apiFetch("/blog").then((res) => {
    if (!res.success) throw new Error(res.message);
    return res.data;
  });

export const deleteBlog = (id) => apiFetch(`/blog/${id}`, { method: "DELETE" });

export async function createBlog({
  title,
  excerpt,
  content,
  category,
  status,
  isFeatured,
  featuredImage,
}) {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const formData = new FormData();
  formData.append("title", title);
  if (excerpt) formData.append("excerpt", excerpt);
  if (content) formData.append("content", content);
  if (category) formData.append("category", category);
  if (status) formData.append("status", status);
  formData.append("isFeatured", String(isFeatured));
  formData.append("tags", "[]");
  if (featuredImage) formData.append("featuredImage", featuredImage);

  const response = await fetch(`${BASE_URL}/blog`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    console.log("API error body:", errBody);
    throw new Error(errBody.message || `API error: ${response.status}`);
  }

  return response.json();
}
