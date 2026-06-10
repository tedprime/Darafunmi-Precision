// booking.jsx
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

export const getBookings = ({ page = 1, limit = 20, status = "" } = {}) =>
  wrap("Load bookings", async () => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append("status", status);
    const res = await apiFetch(`/bookings?${params.toString()}`);
    if (!res.success) {
      toastError(res.message || "Failed to load bookings.");
      throw new Error(res.message);
    }
    return { data: res.data, count: res.count };
  });

export const updateBookingStatus = (id, status) =>
  wrap("Update booking", () =>
    apiFetch(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  );

export const deleteBooking = (id) =>
  wrap("Delete booking", () =>
    apiFetch(`/bookings/${id}`, { method: "DELETE" })
  );