import { apiFetch } from "./api";

export const getCalibrations = ({ page = 1, limit = 20, search = "", status = "" } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  return apiFetch(`/calibrations?${params.toString()}`).then((res) => {
    if (!res.success) throw new Error(res.message);
    return { data: res.data, count: res.count };
  });
};

export const createCalibration = (body) =>
  apiFetch("/calibrations", {
    method: "POST",
    body: JSON.stringify(body),
  });