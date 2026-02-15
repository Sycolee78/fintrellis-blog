import React from "react";

const fieldStyle = {
  marginBottom: "1rem",
};

const labelStyle = {
  display: "block",
  marginBottom: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-text)",
};

const inputStyle = {
  width: "100%",
  padding: "0.625rem 0.75rem",
  fontSize: "1rem",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--border-radius)",
  outline: "none",
  transition: "border-color 0.15s",
  fontFamily: "inherit",
};

const inputErrorStyle = {
  ...inputStyle,
  borderColor: "var(--color-danger)",
};

const errorStyle = {
  marginTop: "0.25rem",
  fontSize: "0.8125rem",
  color: "var(--color-danger)",
};

export default function Input({ label, error, id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div style={fieldStyle}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={error ? inputErrorStyle : inputStyle}
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} style={errorStyle} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
