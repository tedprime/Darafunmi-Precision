import { apiFetch } from "./api";

export const getBookings = ({ page = 1, limit = 20, status = "" } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.append("status", status);
  return apiFetch(`/bookings?${params.toString()}`).then((res) => {
    if (!res.success) throw new Error(res.message);
    return { data: res.data, count: res.count };
  });
};

export const updateBookingStatus = (id, status) =>
  apiFetch(`/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const deleteBooking = (id) =>
  apiFetch(`/bookings/${id}`, { method: "DELETE" });
