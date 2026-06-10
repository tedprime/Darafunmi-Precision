// caseStudies.jsx
import { apiFetch } from "./api.jsx";
import { toastError } from "./useToast";

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

// List — public endpoint, page + limit only (no search per Swagger)
export async function getCaseStudies({ page = 1, limit = 12 } = {}) {
  return wrap("Load case studies", async () => {
    const params = new URLSearchParams({ page, limit });
    const res = await apiFetch(`/case-studies?${params.toString()}`);
    return { data: res.data ?? [], pagination: res.pagination ?? {} };
  });
}

// Single — public, fetched by slug
export async function getCaseStudy(slug) {
  return wrap("Load case study", async () => {
    const res = await apiFetch(`/case-studies/${slug}`);
    return res.data ?? res;
  });
}

// Create — admin, multipart/form-data
export async function createCaseStudy({
  title,
  slug,
  excerpt,
  content,
  industry,
  featuredImage,
  status,
}) {
  return wrap("Create case study", () => {
    const form = new FormData();
    form.append("title", title);
    if (slug) form.append("slug", slug);
    if (excerpt) form.append("excerpt", excerpt);
    if (content) form.append("content", content);
    if (industry) form.append("industry", industry);
    if (featuredImage) form.append("featuredImage", featuredImage);
    if (status) form.append("status", status);
    return apiFormData("/case-studies", "POST", form);
  });
}

// Update — admin, PATCH by id, multipart/form-data
export async function updateCaseStudy(
  id,
  { title, excerpt, content, industry, featuredImage, status }
) {
  return wrap("Update case study", () => {
    const form = new FormData();
    if (title !== undefined) form.append("title", title);
    if (excerpt !== undefined) form.append("excerpt", excerpt);
    if (content !== undefined) form.append("content", content);
    if (industry !== undefined) form.append("industry", industry);
    if (status !== undefined) form.append("status", status);
    if (featuredImage) form.append("featuredImage", featuredImage);
    return apiFormData(`/case-studies/${id}`, "PATCH", form);
  });
}

// Delete — admin, DELETE by id
export async function deleteCaseStudy(id) {
  return wrap("Delete case study", () =>
    apiFetch(`/case-studies/${id}`, { method: "DELETE" })
  );
}