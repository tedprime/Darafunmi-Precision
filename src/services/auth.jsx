// auth.jsx
import Cookies from "js-cookie";
import { apiFetch } from "./api.jsx";
import { toastError } from "./useToast";

const COOKIE_OPTIONS = {
  // 7-day expiry, strict same-site, secure in production
  expires: 7,
  sameSite: "strict",
  secure: import.meta.env.PROD,
};

const wrap = async (label, fn) => {
  try {
    return await fn();
  } catch (err) {
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
      Cookies.set("token", data.token, COOKIE_OPTIONS);
      Cookies.set("user", JSON.stringify(data.data), COOKIE_OPTIONS);
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

/** Clears cookies — call this from AuthContext.logout(), not directly. */
export function clearSession() {
  Cookies.remove("token");
  Cookies.remove("user");
}

export function getStoredUser() {
  try {
    const raw = Cookies.get("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    toastError("Failed to read user session. Please log in again.");
    return null;
  }
}

/** Decodes the JWT and checks the exp claim — not just cookie existence. */
export function isAuthenticated() {
  const token = Cookies.get("token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
