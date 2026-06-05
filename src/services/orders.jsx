import { apiFetch } from "./api.jsx";

// ─── GET /orders ──────────────────────────────────────────────────────────────
// Admin: page, limit, status filter
export async function getOrders({ page = 1, limit = 20, status = "" } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set("status", status);
  const res = await apiFetch(`/orders?${params.toString()}`);
  return {
    data: res.data ?? [],
    pagination: res.pagination ?? {},
  };
}

// ─── GET /orders/{orderNumber} ────────────────────────────────────────────────
export async function getOrder(orderNumber) {
  const res = await apiFetch(`/orders/${orderNumber}`);
  return res.data ?? res;
}

// ─── PATCH /orders/{id}/status ────────────────────────────────────────────────
// status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
export async function updateOrderStatus(id, status) {
  return apiFetch(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ─── DELETE /orders/{id} ──────────────────────────────────────────────────────
export async function deleteOrder(id) {
  return apiFetch(`/orders/${id}`, { method: "DELETE" });
}

// ─── GET /cart (admin views a user's cart — session-based) ───────────────────
export async function getCart() {
  const res = await apiFetch("/cart");
  return res.data ?? res;
}

// ─── DELETE /cart (clear entire cart) ────────────────────────────────────────
export async function clearCart() {
  return apiFetch("/cart", { method: "DELETE" });
}

// ─── PATCH /cart/{id} (update item quantity) ─────────────────────────────────
export async function updateCartItem(id, quantity) {
  return apiFetch(`/cart/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

// ─── DELETE /cart/{id} (remove single item) ───────────────────────────────────
export async function removeCartItem(id) {
  return apiFetch(`/cart/${id}`, { method: "DELETE" });
}