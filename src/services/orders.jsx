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

export async function updateOrderStatus(id, status, adminNotes = "") {
  return wrap("Update order", async () => {
    const body = { status };
    if (adminNotes.trim()) body.adminNotes = adminNotes.trim();
    const res = await apiFetch(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(body),
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

export async function getOrderById(id) {
  return wrap("Load order details", async () => {
    const res = await apiFetch(`/orders/id/${id}`);
    return res?.data ?? res;
  });
}

export async function generateInvoice(id, { lpoNumber = "", tinNumber = "", send = false } = {}) {
  return wrap("Generate invoice", async () => {
    const token = (await import("js-cookie")).default.get("token");
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const response = await fetch(`${BASE_URL}/orders/${id}/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ lpoNumber, tinNumber, send }),
    });

    if (!response.ok) {
      throw { status: response.status, message: `Invoice generation failed (${response.status})` };
    }

    const contentType = response.headers.get("content-type") ?? "";

    // PDF response — trigger browser download
    if (contentType.includes("application/pdf")) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-order-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      return { success: true };
    }

    // JSON response (e.g. send=true just emails it)
    return await response.json();
  });
}
