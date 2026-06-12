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
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

// ── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

let _externalPush = null; // escape hatch for non-React call sites (see toastError below)

// ── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);
  const activeKeys = useRef(new Set());

  const push = useCallback((message, type = "error") => {
    const key = `${type}::${message}`;
    if (activeKeys.current.has(key)) return;
    activeKeys.current.add(key);

    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      activeKeys.current.delete(key);
    }, 5000);
  }, []);

  // Register external push so api helpers can call it without hooks
  useEffect(() => {
    _externalPush = push;
    return () => { _externalPush = null; };
  }, [push]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast) activeKeys.current.delete(`${toast.type}::${toast.message}`);
      return prev.filter((t) => t.id !== id);
    });
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

export function toastError(message) {
  if (_externalPush) _externalPush(message, "error");
  else console.error("[Toast]", message);
}

export function toastSuccess(message) {
  if (_externalPush) _externalPush(message, "success");
  else console.log("[Toast]", message);
}

export function toastInfo(message) {
  if (_externalPush) _externalPush(message, "info");
  else console.log("[Toast]", message);
}
// ── Container ────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
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
      <span style={{ flexShrink: 0, marginTop: "1px", display: "flex" }}>
        {toast.type === "error"   && <AlertCircle  size={16} color="#1e40af" strokeWidth={2} />}
        {toast.type === "success" && <CheckCircle  size={16} color="#1e40af" strokeWidth={2} />}
        {toast.type === "info"    && <Info         size={16} color="#1e40af" strokeWidth={2} />}
      </span>

      {/* Message */}
      <span
        style={{ fontSize: "0.875rem", lineHeight: "1.45", flex: 1, color: "#1e40af", fontWeight: 600 }}
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
          display: "flex",
          marginTop: "-1px",
        }}
      >
        <X size={14} color="#9ca3af" strokeWidth={2} />
      </button>
    </div>
  );
}