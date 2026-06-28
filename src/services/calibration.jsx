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

export const getCalibration = (id) =>
  wrap("Load calibration", async () => {
    const res = await apiFetch(`/calibrations/${id}`);
    if (!res.success) {
      toastError(res.message || "Failed to load calibration.");
      throw new Error(res.message);
    }
    return res.data;
  });

export const createCalibration = (body) =>
  wrap("Create calibration", () =>
    apiFetch("/calibrations", {
      method: "POST",
      body: JSON.stringify(body),
    })
  );

export const updateCalibration = (id, body) =>
  wrap("Update calibration", () =>
    apiFetch(`/calibrations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
  );

export const deleteCalibration = (id) =>
  wrap("Delete calibration", () =>
    apiFetch(`/calibrations/${id}`, { method: "DELETE" })
  );

export const generateCertificateFromCalibration = (id) =>
  wrap("Generate certificate", async () => {
    const res = await apiFetch(`/calibrations/${id}/generate-certificate`, { method: "POST" });
    if (!res.success) {
      toastError(res.message || "Failed to generate certificate.");
      throw new Error(res.message);
    }
    return res; // includes { data: certificate, alreadyExists? }
  });
