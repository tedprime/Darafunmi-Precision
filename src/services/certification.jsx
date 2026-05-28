import { apiFetch } from "./api";

export const getCertifications = ({
  page = 1,
  limit = 20,
  search = "",
  status = "",
} = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  return apiFetch(`/certifications?${params.toString()}`).then((res) => {
    if (!res.success) throw new Error(res.message);
    return { data: res.data, count: res.count };
  });
};

export const createCertification = (body) =>
  apiFetch("/certifications", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const deleteCertification = (id) =>
  apiFetch(`/certifications/${id}`, { method: "DELETE" });

export const generatePdf = async (id) => {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(
    `${BASE_URL}/certifications/${id}/generate-pdf`,
    {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    },
  );
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.blob();
};

export const sendCertificateEmail = (id, to) =>
  apiFetch(`/certifications/${id}/send-email`, {
    method: "POST",
    body: JSON.stringify({ to }),
  });
