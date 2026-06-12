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

const multipartFetch = async (endpoint, method, formData) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw { status: res.status, message: data?.message ?? "Request failed" };
  }
  return res.json();
};

export async function getTeamMembers() {
  return wrap("Load team", () => apiFetch("/team/admin"));
}

export async function createTeamMember(formData) {
  return wrap("Create member", () => multipartFetch("/team", "POST", formData));
}

export async function updateTeamMember(id, formData) {
  return wrap("Update member", () => multipartFetch(`/team/${id}`, "PATCH", formData));
}

export async function deleteTeamMember(id) {
  return wrap("Delete member", () =>
    apiFetch(`/team/${id}`, { method: "DELETE" })
  );
}