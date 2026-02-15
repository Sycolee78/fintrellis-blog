import React from "react";

const styles = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.625rem 1.25rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    borderRadius: "var(--border-radius)",
    border: "1px solid transparent",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    lineHeight: 1.5,
    fontFamily: "inherit",
  },
  primary: {
    backgroundColor: "var(--color-primary)",
    color: "#fff",
  },
  danger: {
    backgroundColor: "var(--color-danger)",
    color: "#fff",
  },
  secondary: {
    backgroundColor: "transparent",
    color: "var(--color-text)",
    border: "1px solid var(--color-border)",
  },
  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

const Button = React.forwardRef(function Button(
  { children, variant = "primary", disabled = false, onClick, type = "button" },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.base,
        ...styles[variant],
        ...(disabled ? styles.disabled : {}),
      }}
    >
      {children}
    </button>
  );
});

export default Button;
