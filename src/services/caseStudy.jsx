import { apiFetch } from "./api.jsx";
import { toastError, toastSuccess } from "./useToast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const wrap = async (label, fn) => {
  try {
    return await fn();
  } catch (err) {
    if (!err?.status) toastError(`${label}: an unexpected error occurred.`);
    throw err;
  }
};

async function apiFormData(endpoint, method, formData) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: formData,
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const message = errBody.message || `Request failed (${response.status}).`;
    toastError(message);
    throw { status: response.status, message };
  }
  return response.json();
}

export async function getCaseStudies({ page = 1, limit = 50 } = {}) {
  return wrap("Load case studies", async () => {
    const params = new URLSearchParams({ page, limit });
    const res = await apiFetch(`/case-studies?${params.toString()}`);
    const list = Array.isArray(res) ? res : res.data ?? [];
    return { data: list, pagination: res.pagination ?? {} };
  });
}

export async function getCaseStudy(slugOrId) {
  return wrap("Load case study", async () => {
    const res = await apiFetch(`/case-studies/${slugOrId}`);
    return res.data ?? res;
  });
}

export async function createCaseStudy({
  title, slug, clientName, industry,
  challenge, solution, results,
  featuredImage, isPublished, isFeatured,
}) {
  return wrap("Create case study", async () => {
    const form = new FormData();
    form.append("title", title);
    if (slug) form.append("slug", slug);
    if (clientName) form.append("clientName", clientName);
    if (industry) form.append("industry", industry);
    if (challenge) form.append("challenge", challenge);
    if (solution) form.append("solution", solution);
    if (results) form.append("results", results);
    if (featuredImage) form.append("featuredImage", featuredImage);
    form.append("isPublished", String(isPublished ?? false));
    form.append("isFeatured", String(isFeatured ?? false));
    const res = await apiFormData("/case-studies", "POST", form);
    toastSuccess("Case study created successfully.");
    return res;
  });
}

export async function updateCaseStudy(id, {
  title, clientName, industry,
  challenge, solution, results,
  featuredImage, isPublished, isFeatured,
}) {
  return wrap("Update case study", async () => {
    const form = new FormData();
    if (title !== undefined) form.append("title", title);
    if (clientName !== undefined) form.append("clientName", clientName);
    if (industry !== undefined) form.append("industry", industry);
    if (challenge !== undefined) form.append("challenge", challenge);
    if (solution !== undefined) form.append("solution", solution);
    if (results !== undefined) form.append("results", results);
    if (isPublished !== undefined) form.append("isPublished", String(isPublished));
    if (isFeatured !== undefined) form.append("isFeatured", String(isFeatured));
    if (featuredImage) form.append("featuredImage", featuredImage);
    const res = await apiFormData(`/case-studies/${id}`, "PATCH", form);
    toastSuccess("Case study updated successfully.");
    return res;
  });
}

export async function deleteCaseStudy(id) {
  return wrap("Delete case study", async () => {
    const res = await apiFetch(`/case-studies/${id}`, { method: "DELETE" });
    toastSuccess("Case study deleted.");
    return res;
  });
}