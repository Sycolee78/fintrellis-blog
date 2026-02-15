import React from "react";

const containerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  marginTop: "2rem",
};

const buttonStyle = {
  padding: "0.5rem 0.875rem",
  fontSize: "0.875rem",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--border-radius)",
  backgroundColor: "var(--color-surface)",
  cursor: "pointer",
  color: "var(--color-text)",
};

const activeStyle = {
  ...buttonStyle,
  backgroundColor: "var(--color-primary)",
  color: "#fff",
  borderColor: "var(--color-primary)",
};

const disabledStyle = {
  ...buttonStyle,
  opacity: 0.4,
  cursor: "not-allowed",
};

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav aria-label="Pagination" style={containerStyle}>
      <button
        style={currentPage === 1 ? disabledStyle : buttonStyle}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      {pages.map((page) => (
        <button
          key={page}
          style={page === currentPage ? activeStyle : buttonStyle}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </button>
      ))}
      <button
        style={currentPage === totalPages ? disabledStyle : buttonStyle}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </nav>
  );
}
