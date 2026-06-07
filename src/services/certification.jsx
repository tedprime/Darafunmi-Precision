import { apiFetch } from "./api.jsx";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── GET /certifications ──────────────────────────────────────────────────────
export async function getCertifications({ page = 1, limit = 20, search = "", status = "" } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const res = await apiFetch(`/certifications?${params.toString()}`);
  return {
    data: res.data ?? [],
    count: res.count ?? 0,
  };
}

// ─── GET /certifications/{id} ─────────────────────────────────────────────────
export async function getCertification(id) {
  const res = await apiFetch(`/certifications/${id}`);
  return res.data ?? res;
}

// ─── POST /certifications ─────────────────────────────────────────────────────
export async function createCertification(payload) {
  return apiFetch("/certifications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── PATCH /certifications/{id} ───────────────────────────────────────────────
export async function updateCertification(id, payload) {
  return apiFetch(`/certifications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ─── DELETE /certifications/{id} ──────────────────────────────────────────────
export async function deleteCertification(id) {
  return apiFetch(`/certifications/${id}`, { method: "DELETE" });
}

// ─── POST /certifications/{id}/generate-pdf ───────────────────────────────────
// Streams application/pdf — must use fetch + blob(), NOT apiFetch which calls .json()
export async function generatePdf(id) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/certifications/${id}/generate-pdf`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to generate PDF: ${response.status}`);
  }

  // Returns a Blob — caller creates an object URL and triggers download
  return response.blob();
}

// ─── POST /certifications/{id}/send-email ─────────────────────────────────────
// Requires { to: "email@example.com" } in body
// Generates the PDF if it doesn't exist, then sends via SMTP
export async function sendCertificateEmail(id, toEmail) {
  return apiFetch(`/certifications/${id}/send-email`, {
    method: "POST",
    body: JSON.stringify({ to: toEmail }),
  });
}

// Legacy alias — kept so existing imports don't break
export const sendCertificateEmailToClient = sendCertificateEmail;