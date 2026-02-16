import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePost } from "../hooks/usePost";
import { usePostMutation } from "../hooks/usePostMutation";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../contexts/AuthContext";
import PostStatusBadge from "../components/posts/PostStatusBadge";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { formatDateTime } from "../utils/formatDate";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const { user } = useAuth();
  const { post, loading, error } = usePost(id);
  const mutation = usePostMutation();
  const [showConfirm, setShowConfirm] = useState(false);

  const canEdit =
    user && post && String(post.author) === String(user.id);

  const handleDelete = async () => {
    try {
      await mutation.remove(id);
      addToast("Post deleted successfully.", "success");
      navigate("/");
    } catch {
      addToast("Failed to delete post.", "error");
      setShowConfirm(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading post..." />;
  if (error) return <div style={styles.wrap}><Alert type="error" message={error} /></div>;
  if (!post) return <div style={styles.wrap}><Alert type="error" message="Post not found." /></div>;

  return (
    <div>
      {/* Hero image */}
      <div style={styles.heroImage}>
        <img
          src={post.thumbnail_url || post.image_url || "/fintrellis.gif"}
          alt={post.title}
          style={styles.heroImg}
          onError={(e) => { e.target.src = "/fintrellis.gif"; }}
        />
        <div style={styles.heroOverlay} />
      </div>

      <div style={styles.wrap}>
        <Link to="/" style={styles.back}>&larr; All posts</Link>

        <article>
          <header style={styles.header}>
            <div style={styles.meta}>
              <PostStatusBadge status={post.status} />
              {post.category && <span style={styles.category}>{post.category}</span>}
              <span style={styles.date}>{formatDateTime(post.published_at || post.created_at)}</span>
            </div>
            <h1 style={styles.title}>{post.title}</h1>
          </header>

          <div style={styles.content}>{post.content}</div>
        </article>

        {canEdit && (
          <div style={styles.actions}>
            <Button variant="secondary" onClick={() => navigate(`/posts/${id}/edit`)}>
              Edit Post
            </Button>
            <Button variant="danger" onClick={() => setShowConfirm(true)}>
              Delete
            </Button>
          </div>
        )}

        {mutation.error && <Alert type="error" message={mutation.error} />}

        {canEdit && (
          <ConfirmDialog
            isOpen={showConfirm}
            title="Delete Post"
            message={`Are you sure you want to delete "${post.title}"? This action cannot be undone.`}
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  heroImage: {
    position: "relative",
    width: "100%",
    maxHeight: "420px",
    overflow: "hidden",
    backgroundColor: "#0f172a",
  },
  heroImg: {
    width: "100%",
    height: "420px",
    objectFit: "cover",
    display: "block",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "120px",
    background: "linear-gradient(transparent, rgba(0,0,0,0.3))",
  },
  wrap: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem 1.5rem 3rem",
  },
  back: {
    display: "inline-block",
    marginBottom: "1.5rem",
    color: "var(--color-text-secondary)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 500,
    textDecoration: "none",
  },
  header: {
    marginBottom: "2rem",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  category: {
    padding: "0.2rem 0.625rem",
    backgroundColor: "var(--color-primary-light)",
    color: "var(--color-primary)",
    fontSize: "var(--font-size-xs)",
    fontWeight: 600,
    borderRadius: "var(--border-radius-pill)",
    textTransform: "capitalize",
  },
  date: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-tertiary)",
  },
  title: {
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
  },
  content: {
    lineHeight: 1.8,
    fontSize: "var(--font-size-lg)",
    color: "var(--color-text)",
    whiteSpace: "pre-wrap",
    marginBottom: "2rem",
  },
  actions: {
    display: "flex",
    gap: "0.75rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid var(--color-border)",
  },
};
