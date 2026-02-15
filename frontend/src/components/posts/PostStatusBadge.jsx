import React from "react";

const baseStyle = {
  display: "inline-block",
  padding: "0.125rem 0.625rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  borderRadius: "9999px",
  textTransform: "capitalize",
};

const variants = {
  published: {
    backgroundColor: "var(--color-success-bg)",
    color: "var(--color-success-text)",
  },
  draft: {
    backgroundColor: "#f1f5f9",
    color: "var(--color-text-secondary)",
  },
};

export default function PostStatusBadge({ status }) {
  return (
    <span style={{ ...baseStyle, ...variants[status] }}>
      {status}
    </span>
  );
}
