import { apiFetch } from "./api.jsx";

export const getServices = ({ page = 1, limit = 20, search = "" } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append("search", search);
  return apiFetch(`/services?${params.toString()}`).then((res) => {
    if (!res.success) throw new Error(res.message);
    return { data: res.data, count: res.count };
  });
};

const buildServiceFormData = ({ name, description, image }) => {
  const formData = new FormData();
  if (name) formData.append("name", name);
  if (description) formData.append("description", description);
  if (image) formData.append("image", image);
  return formData;
};

export const createService = async (fields) => {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${BASE_URL}/services`, {
    method: "POST",
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: buildServiceFormData(fields),
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || `API error: ${response.status}`);
  }
  return response.json();
};

export const updateService = async (id, fields) => {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${BASE_URL}/services/${id}`, {
    method: "PATCH",
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: buildServiceFormData(fields),
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || `API error: ${response.status}`);
  }
  return response.json();
};

export const deleteService = (id) =>
  apiFetch(`/services/${id}`, { method: "DELETE" });