// orders.jsx
import { apiFetch } from "./api.jsx";
import { toastError } from "./useToast";

const wrap = async (label, fn) => {
  try {
    return await fn();
  } catch (err) {
    if (!err?.status) toastError(`${label}: an unexpected error occurred.`);
    throw err;
  }
};

export async function getOrders({ page = 1, limit = 20, status = "" } = {}) {
  return wrap("Load orders", async () => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set("status", status);
    const res = await apiFetch(`/orders?${params}`);
    const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    const total = res?.count ?? res?.total ?? data.length;
    const totalPages = Math.ceil(total / limit) || 1;
    return { data, pagination: { page: Number(page), total, totalPages } };
  });
}

export async function getOrder(orderNumber) {
  return wrap("Load order", async () => {
    const res = await apiFetch(`/orders/${orderNumber}`);
    return res?.data ?? res;
  });
}

export async function updateOrderStatus(id, status) {
  return wrap("Update order", async () => {
    const res = await apiFetch(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return res?.data ?? res;
  });
}

export async function deleteOrder(id) {
  return wrap("Delete order", async () => {
    const res = await apiFetch(`/orders/${id}`, { method: "DELETE" });
    return res?.data ?? res;
  });
}
