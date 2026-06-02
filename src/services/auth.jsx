import { apiFetch } from "./api.jsx";

/**
 * POST /auth/login
 * Sends credentials, stores the JWT token, and returns user data.
 */
export async function login(email, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // data shape: { success: true, token: "...", data: { id, name, email, role } }
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.data));
  }

  return data;
}

/**
 * GET /auth/me
 * Returns the currently authenticated user profile.
 */
export async function getMe() {
  return apiFetch("/auth/me");
}

/**
 * PATCH /auth/me
 * Updates the current user's name or email.
 */
export async function updateProfile({ name, email }) {
  return apiFetch("/auth/me", {
    method: "PATCH",
    body: JSON.stringify({ name, email }),
  });
}

/**
 * PATCH /auth/change-password
 * Changes the current user's password.
 */
export async function changePassword(currentPassword, newPassword) {
  return apiFetch("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

/**
 * POST /auth/register
 * Creates a new admin user. Use this via Swagger or a seeding script
 * to provision production credentials — NOT exposed in the UI.
 */
export async function register({ name, email, password, role = "admin" }) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
}

/**
 * Clears auth state (client-side logout).
 */
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/**
 * Returns the stored user object (or null if not logged in).
 */
export function getStoredUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

/**
 * Returns true if a token is present in localStorage.
 */
export function isAuthenticated() {
  return !!localStorage.getItem("token");
}
