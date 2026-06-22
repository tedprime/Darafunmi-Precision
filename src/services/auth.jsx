// auth.jsx
import { apiFetch } from "./api.jsx";
import { toastError } from "./useToast";

const wrap = async (label, fn) => {
  try {
    return await fn();
  } catch (err) {
    // apiFetch already toasts HTTP errors; this catches anything else
    // (JSON parse failures, unexpected throws, etc.)
    if (!err?.status) toastError(`${label}: an unexpected error occurred.`);
    throw err;
  }
};

export async function login(email, password) {
  return wrap("Sign in", async () => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data?.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.data));
    }
    return data;
  });
}

export async function getMe() {
  return wrap("Load profile", () => apiFetch("/auth/me"));
}

export async function updateProfile({ name, email }) {
  return wrap("Update profile", () =>
    apiFetch("/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ name, email }),
    })
  );
}

export async function changePassword(currentPassword, newPassword) {
  return wrap("Change password", () =>
    apiFetch("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  );
}

export async function register({ name, email, role = "staff" }) {
  return wrap("Register user", () =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, role }),
    })
  );
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    toastError("Failed to read user session. Please log in again.");
    return null;
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}