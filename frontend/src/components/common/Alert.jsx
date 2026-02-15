import React from "react";

const baseStyle = {
  padding: "0.75rem 1rem",
  borderRadius: "var(--border-radius)",
  marginBottom: "1rem",
  fontSize: "0.875rem",
  lineHeight: 1.5,
};

const variants = {
  error: {
    backgroundColor: "var(--color-error-bg)",
    color: "var(--color-error-text)",
    border: "1px solid #fecaca",
  },
  success: {
    backgroundColor: "var(--color-success-bg)",
    color: "var(--color-success-text)",
    border: "1px solid #bbf7d0",
  },
  warning: {
    backgroundColor: "#fffbeb",
    color: "#92400e",
    border: "1px solid #fde68a",
  },
};

export default function Alert({ type = "error", message, children }) {
  if (!message && !children) return null;
  return (
    <div role="alert" style={{ ...baseStyle, ...variants[type] }}>
      {message || children}
    </div>
  );
}
