import { apiFetch } from "./api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

export const getCertification = (id) =>
  apiFetch(`/certifications/${id}`).then((res) => {
    if (!res.success) throw new Error(res.message);
    return res.data;
  });

export const createCertification = async (body) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/certifications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `API error: ${response.status}`);
  return data;
};

export const deleteCertification = (id) =>
  apiFetch(`/certifications/${id}`, { method: "DELETE" });

export const generatePdf = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/certifications/${id}/generate-pdf`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.blob();
};

// Sends to a manually provided email address
export const sendCertificateEmail = (id, to) =>
  apiFetch(`/certifications/${id}/send-email`, {
    method: "POST",
    body: JSON.stringify({ to }),
  });

export const sendCertificateEmailToClient = async (certId) => {
  // Step 1: get the certificate to find clientId
  const cert = await getCertification(certId);

  if (!cert.clientId) {
    throw new Error("This certificate has no linked client.");
  }

  // Step 2: get the client to find their email
  const clientRes = await apiFetch(`/clients/${cert.clientId}`);
  if (!clientRes.success) throw new Error("Client not found.");

  const email = clientRes.data?.email;
  if (!email) {
    throw new Error(`Client "${cert.customerName}" has no email address on file.`);
  }

  // Step 3: send the email
  return sendCertificateEmail(certId, email);
};