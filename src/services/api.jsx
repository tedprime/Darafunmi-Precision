// apiFetch.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Translates technical HTTP status codes into friendly user messages.
 */
const getFriendlyErrorMessage = (status) => {
  const errorMessages = {
    400: "The request was invalid. Please check your input and try again.",
    401: "Your session has expired. Redirecting to login...",
    403: "You do not have permission to access this resource.",
    404: "The requested information could not be found.",
    429: "Too many requests! Please slow down and try again in a bit.",
    500: "Our servers are having a moment. Please try again in a few minutes.",
    503: "The service is temporarily unavailable. We're working on it!",
  };

  return errorMessages[status] || "Something went wrong. Please try again.";
};

export async function apiFetch(endpoint, options = {}, retries = 3) {
  const token = localStorage.getItem("token");

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...options,
      });

      clearTimeout(timeout);

      // Handle unauthorized session expiration immediately
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return; 
      }

      // If response is not 2xx, throw a structured error object
      if (!response.ok) {
        throw {
          status: response.status,
          message: getFriendlyErrorMessage(response.status),
        };
      }

      return await response.json();

    } catch (err) {
      const isTimeout = err.name === "AbortError";
      
      // Standardize the error structure whether it's an API, network, or timeout failure
      const cleanError = isTimeout
        ? { status: 408, message: "Connection timed out. Please check your internet link." }
        : err.message
        ? err
        : { status: 500, message: "Network error. Unable to connect to the server." };

      const isLast = attempt === retries;
      if (isLast) throw cleanError; // Reject with the formatted error object on final failure

      // Exponential backoff delay (1s, 2s, etc.) before retrying
      await new Promise((res) => setTimeout(res, attempt * 1000));
    }
  }
}