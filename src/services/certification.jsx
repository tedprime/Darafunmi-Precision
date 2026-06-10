// certification.jsx
import { apiFetch } from "./api.jsx";
import { toastError } from "./useToast";

const wrap = async (label, fn) => {
  try {
    return await fn();
  } catch (err) {
    if (!err?.status) toastError(`${label}: an unexpected error occurred.`);
    throw err;
  }
};

export async function getCertifications({ page = 1, limit = 20, search = "", status = "" } = {}) {
  return wrap("Load certifications", async () => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await apiFetch(`/certifications?${params.toString()}`);
    return { data: res.data ?? [], count: res.count ?? 0 };
  });
}

export async function getCertification(id) {
  return wrap("Load certification", async () => {
    const res = await apiFetch(`/certifications/${id}`);
    return res.data ?? res;
  });
}

export async function createCertification(payload) {
  return wrap("Create certification", () => {
    console.log("[createCertification] payload:", JSON.stringify(payload, null, 2));
    return apiFetch("/certifications", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  });
}

export async function updateCertification(id, payload) {
  return wrap("Update certification", () =>
    apiFetch(`/certifications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  );
}

export async function deleteCertification(id) {
  return wrap("Delete certification", () =>
    apiFetch(`/certifications/${id}`, { method: "DELETE" })
  );
}

export async function generatePdf(id) {
  return wrap("Generate PDF", async () => {
    const res = await apiFetch(`/certifications/${id}/generate-pdf`, {
      method: "POST",
    });
    if (!res.success && !res.pdfUrl) {
      const message = res.message || "Failed to generate PDF.";
      toastError(message);
      throw new Error(message);
    }
    return res;
  });
}

export async function sendCertificateEmail(id, toEmail) {
  return wrap("Send certificate email", () =>
    apiFetch(`/certifications/${id}/send-email`, {
      method: "POST",
      body: JSON.stringify({ to: toEmail }),
    })
  );
}

// Legacy alias — kept so existing imports don't break
export const sendCertificateEmailToClient = sendCertificateEmail;