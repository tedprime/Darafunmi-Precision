// api.jsx
import { toastError } from "./useToast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getFriendlyErrorMessage = (status) => {
  const errorMessages = {
    400: "The request was invalid. Please check your input and try again.",
    401: "Your session has expired. Redirecting to login…",
    403: "You don't have permission to access this resource.",
    404: "The requested information could not be found.",
    408: "Connection timed out. Please check your internet connection.",
    409: "This action conflicts with an existing record.",
    422: "The data you submitted could not be processed.",
    429: "Too many requests — please wait a moment and try again.",
    500: "A server error occurred. Please try again in a few minutes.",
    502: "The server returned an unexpected response.",
    503: "The service is temporarily unavailable. We're working on it.",
  };
  return errorMessages[status] || "Something went wrong. Please try again.";
};

export async function apiFetch(endpoint, options = {}, retries = 3) {
  const token = localStorage.getItem("token");

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...options,
      });

      clearTimeout(timeout);

      if (response.status === 401) {
        localStorage.removeItem("token");
        toastError(getFriendlyErrorMessage(401));
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const message = getFriendlyErrorMessage(response.status);
        toastError(message);
        throw { status: response.status, message };
      }
const body = await response.text();
console.error(`[API ${response.status}]`, endpoint, body);
      return await response.json();
    } catch (err) {
      // Don't double-toast — only fire on the last attempt, and only if
      // it's a network/timeout error (HTTP errors are already toasted above).
      const isTimeout = err.name === "AbortError";
      const isNetworkError = !err.status; // no status = not an HTTP error object

      const cleanError = isTimeout
        ? { status: 408, message: getFriendlyErrorMessage(408) }
        : isNetworkError
        ? { status: 0, message: "Network error. Unable to connect to the server." }
        : err; // already has status + message from the block above

      const isLast = attempt === retries;

      if (isLast) {
        // Toast network/timeout errors here (HTTP errors already toasted above)
        if (isTimeout || isNetworkError) {
          toastError(cleanError.message);
        }
        throw cleanError;
      }

      await new Promise((res) => setTimeout(res, attempt * 1000));
    }
  }
}