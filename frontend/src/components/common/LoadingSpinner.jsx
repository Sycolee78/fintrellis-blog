import React from "react";

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "3rem",
  gap: "1rem",
  color: "var(--color-text-secondary)",
};

const spinnerStyle = {
  width: "2rem",
  height: "2rem",
  border: "3px solid var(--color-border)",
  borderTopColor: "var(--color-primary)",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div style={containerStyle}>
      <style>
        {`@keyframes spin { to { transform: rotate(360deg); } }`}
      </style>
      <div style={spinnerStyle} />
      <span>{message}</span>
    </div>
  );
}
