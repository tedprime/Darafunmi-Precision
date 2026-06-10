// useToast.jsx
// ─── Usage ────────────────────────────────────────────────────────────────────
// 1. Wrap your app (or page) with <ToastProvider>
// 2. Call const { toast } = useToast() in any component
// 3. toast.error("Something went wrong")
//    toast.success("Saved!")
//    toast.info("Loading…")
//
// The ToastContainer renders itself — no extra JSX needed in the tree.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// ── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

let _externalPush = null; // escape hatch for non-React call sites (see toastError below)

// ── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const push = useCallback((message, type = "error") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  // Register external push so api helpers can call it without hooks
  useEffect(() => {
    _externalPush = push;
    return () => { _externalPush = null; };
  }, [push]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    error:   (msg) => push(msg, "error"),
    success: (msg) => push(msg, "success"),
    info:    (msg) => push(msg, "info"),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ── Imperative helper (use in api modules / outside React) ───────────────────
export function toastError(message) {
  if (_externalPush) _externalPush(message, "error");
  else console.error("[Toast]", message); // fallback before provider mounts
}

// ── Container ────────────────────────────────────────────────────────────────
const TYPE_STYLES = {
  error:   "text-blue-600",
  success: "text-blue-600",
  info:    "text-blue-600",
};

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "1.5rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
        maxWidth: "22rem",
        width: "100%",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Tiny delay so CSS transition fires
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 250);
  };

  return (
    <div
      role="alert"
      onClick={handleDismiss}
      style={{
        pointerEvents: "all",
        cursor: "pointer",
        background: "#ffffff",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 16px rgba(0,0,0,0.13), 0 1.5px 4px rgba(0,0,0,0.08)",
        padding: "0.75rem 1rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.625rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(0.75rem)",
        transition: "opacity 0.22s ease, transform 0.22s ease",
      }}
    >
      {/* Icon */}
      <span style={{ flexShrink: 0, marginTop: "1px" }}>
        {toast.type === "error" && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7.25" stroke="#2563EB" strokeWidth="1.5"/>
            <path d="M8 4.5V8.5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="8" cy="11" r="0.75" fill="#2563EB"/>
          </svg>
        )}
        {toast.type === "success" && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7.25" stroke="#2563EB" strokeWidth="1.5"/>
            <path d="M5 8.5L7 10.5L11 6" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {toast.type === "info" && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7.25" stroke="#2563EB" strokeWidth="1.5"/>
            <path d="M8 7V11.5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="8" cy="5" r="0.75" fill="#2563EB"/>
          </svg>
        )}
      </span>

      {/* Message */}
      <span
        className={TYPE_STYLES[toast.type]}
        style={{ fontSize: "0.875rem", lineHeight: "1.45", flex: 1 }}
      >
        {toast.message}
      </span>

      {/* Dismiss × */}
      <button
        onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
        aria-label="Dismiss"
        style={{
          flexShrink: 0,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          lineHeight: 1,
          color: "#9ca3af",
          fontSize: "1rem",
          marginTop: "-1px",
        }}
      >
        ×
      </button>
    </div>
  );
}