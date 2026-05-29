import { apiFetch } from "./api";

export const getClients = ({
  page = 1,
  limit = 20,
  search = "",
  status = "",
} = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  return apiFetch(`/clients?${params.toString()}`).then((res) => {
    if (!res.success) throw new Error(res.message);
    return { data: res.data, count: res.count };
  });
};

export const createClient = (body) =>
  apiFetch("/clients", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateClient = (id, body) =>
  apiFetch(`/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const deleteClient = (id) =>
  apiFetch(`/clients/${id}`, { method: "DELETE" });
