import { apiFetch } from "./api.jsx";

// ─── Orders ───────────────────────────────────────────────────────

/**
 * GET /orders?page=1&limit=20&status=pending
 * Returns { data: Order[], pagination: { page, total, totalPages } }
 */
export async function getOrders({ page = 1, limit = 20, status = "" } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set("status", status);

  const res = await apiFetch(`/orders?${params}`);

  // Normalise — backend returns { success, count, data: [] }
  const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  const total = res?.count ?? res?.total ?? data.length;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    pagination: { page: Number(page), total, totalPages },
  };
}

/**
 * GET /orders/:orderNumber
 * Returns the order object directly
 */
export async function getOrder(orderNumber) {
  const res = await apiFetch(`/orders/${orderNumber}`);
  return res?.data ?? res;
}

/**
 * PATCH /orders/:id/status  —  { status }
 */
export async function updateOrderStatus(id, status) {
  const res = await apiFetch(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return res?.data ?? res;
}

/**
 * DELETE /orders/:id
 */
export async function deleteOrder(id) {
  const res = await apiFetch(`/orders/${id}`, { method: "DELETE" });
  return res?.data ?? res;
}

// ─── Cart ─────────────────────────────────────────────────────────

/**
 * GET /cart
 * Returns { items: CartItem[] } or CartItem[]
 */
export async function getCart() {
  const res = await apiFetch("/cart");
  // Normalise: backend may return { success, data: [...] } or the array directly
  if (Array.isArray(res)) return { items: res };
  if (Array.isArray(res?.data)) return { items: res.data };
  if (Array.isArray(res?.items)) return res;
  return { items: [] };
}

/**
 * PATCH /cart/:id  —  { quantity }
 */
export async function updateCartItem(id, quantity) {
  const res = await apiFetch(`/cart/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
  return res?.data ?? res;
}

/**
 * DELETE /cart/:id
 */
export async function removeCartItem(id) {
  const res = await apiFetch(`/cart/${id}`, { method: "DELETE" });
  return res?.data ?? res;
}

/**
 * DELETE /cart
 */
export async function clearCart() {
  const res = await apiFetch("/cart", { method: "DELETE" });
  return res?.data ?? res;
}