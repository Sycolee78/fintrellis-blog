import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formatDate";
import { truncateText } from "../../utils/truncateText";

const DEFAULT_IMAGE = "/fintrellis.gif";

export default function PostCard({ post }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      style={{
        ...styles.card,
        ...(hovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/posts/${post.id}`} style={styles.link}>
        <div style={styles.imageWrap}>
          <img
            src={post.thumbnail_url || post.image_url || DEFAULT_IMAGE}
            alt={post.title}
            style={{
              ...styles.image,
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
            onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
          />
          {post.category && (
            <span style={styles.pill}>{post.category}</span>
          )}
        </div>
        <div style={styles.body}>
          <time style={styles.date}>
            {formatDate(post.published_at || post.created_at)}
          </time>
          <h3 style={styles.title}>{post.title}</h3>
          <p style={styles.excerpt}>{truncateText(post.excerpt, 120)}</p>
          <span style={styles.cta}>Read more &rarr;</span>
        </div>
      </Link>
    </article>
  );
}

const styles = {
  card: {
    borderRadius: "var(--border-radius-lg)",
    overflow: "hidden",
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    transition: "box-shadow var(--transition-base), transform var(--transition-base)",
    cursor: "pointer",
  },
  cardHover: {
    boxShadow: "var(--shadow-xl)",
    transform: "translateY(-4px)",
  },
  link: {
    textDecoration: "none",
    color: "inherit",
    display: "block",
  },
  imageWrap: {
    position: "relative",
    overflow: "hidden",
    paddingTop: "60%",
    backgroundColor: "#e2e8f0",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform var(--transition-base)",
  },
  pill: {
    position: "absolute",
    top: "0.75rem",
    right: "0.75rem",
    padding: "0.25rem 0.75rem",
    backgroundColor: "rgba(99, 102, 241, 0.9)",
    color: "#ffffff",
    fontSize: "0.75rem",
    fontWeight: 600,
    borderRadius: "var(--border-radius-pill)",
    letterSpacing: "0.02em",
    textTransform: "capitalize",
  },
  body: {
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  date: {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-tertiary)",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  title: {
    fontSize: "var(--font-size-lg)",
    fontWeight: 600,
    color: "var(--color-text)",
    lineHeight: 1.3,
    margin: 0,
  },
  excerpt: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-secondary)",
    lineHeight: 1.6,
    margin: 0,
  },
  cta: {
    marginTop: "0.5rem",
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    color: "var(--color-primary)",
  },
};
