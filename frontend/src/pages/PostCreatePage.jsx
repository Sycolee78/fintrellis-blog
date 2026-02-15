import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePostMutation } from "../hooks/usePostMutation";
import { useToast } from "../hooks/useToast";
import PostForm from "../components/posts/PostForm";

export default function PostCreatePage() {
  const navigate = useNavigate();
  const addToast = useToast();
  const { loading, error, fieldErrors, create } = usePostMutation();

  const handleSubmit = async (values) => {
    try {
      const post = await create(values);
      addToast("Post created successfully!", "success");
      navigate(`/posts/${post.id}`);
    } catch {
      addToast("Failed to create post.", "error");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <Link to="/" style={styles.back}>&larr; Back to posts</Link>
        <h1 style={styles.title}>Create New Post</h1>
        <p style={styles.subtitle}>Fill in the details below to publish a new blog post.</p>
        <PostForm
          onSubmit={handleSubmit}
          isLoading={loading}
          serverError={error}
          fieldErrors={fieldErrors}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "2.5rem 1.5rem 3rem",
  },
  inner: {
    maxWidth: "680px",
    margin: "0 auto",
  },
  back: {
    display: "inline-block",
    marginBottom: "1.5rem",
    color: "var(--color-text-secondary)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 500,
    textDecoration: "none",
  },
  title: {
    fontSize: "var(--font-size-3xl)",
    fontWeight: 800,
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "var(--color-text-secondary)",
    marginBottom: "2rem",
  },
};
