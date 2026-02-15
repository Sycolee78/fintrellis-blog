import React, { useEffect } from "react";

const baseStyle = {
  padding: "0.75rem 1.25rem",
  borderRadius: "var(--border-radius)",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  boxShadow: "var(--shadow-lg)",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  minWidth: "280px",
  animation: "slideIn 0.3s ease",
};

const variants = {
  success: {
    backgroundColor: "#065f46",
    color: "#ffffff",
  },
  error: {
    backgroundColor: "#991b1b",
    color: "#ffffff",
  },
  info: {
    backgroundColor: "#1e40af",
    color: "#ffffff",
  },
};

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ ...baseStyle, ...variants[type] }}
    >
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }`}</style>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          fontSize: "1.25rem",
          lineHeight: 1,
          opacity: 0.7,
        }}
      >
        &times;
      </button>
    </div>
  );
}
