// calibration.jsx
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

export const getCalibrations = ({ page = 1, limit = 20, search = "", status = "" } = {}) =>
  wrap("Load calibrations", async () => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    const res = await apiFetch(`/calibrations?${params.toString()}`);
    if (!res.success) {
      toastError(res.message || "Failed to load calibrations.");
      throw new Error(res.message);
    }
    return { data: res.data, count: res.count };
  });

export const createCalibration = (body) =>
  wrap("Create calibration", () =>
    apiFetch("/calibrations", {
      method: "POST",
      body: JSON.stringify(body),
    })
  );