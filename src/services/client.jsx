// client.jsx
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

export const getClients = ({ page = 1, limit = 20, search = "", status = "" } = {}) =>
  wrap("Load clients", async () => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    const res = await apiFetch(`/clients?${params.toString()}`);
    if (!res.success) {
      toastError(res.message || "Failed to load clients.");
      throw new Error(res.message);
    }
    return { data: res.data, count: res.count };
  });

export const createClient = (body) =>
  wrap("Create client", () =>
    apiFetch("/clients", {
      method: "POST",
      body: JSON.stringify(body),
    })
  );

export const updateClient = (id, body) =>
  wrap("Update client", () =>
    apiFetch(`/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
  );

export const deleteClient = (id) =>
  wrap("Delete client", () =>
    apiFetch(`/clients/${id}`, { method: "DELETE" })
  );