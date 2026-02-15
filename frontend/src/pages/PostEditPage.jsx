import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePost } from "../hooks/usePost";
import { usePostMutation } from "../hooks/usePostMutation";
import { useToast } from "../hooks/useToast";
import PostForm from "../components/posts/PostForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";

export default function PostEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const { post, loading: postLoading, error: postError } = usePost(id);
  const { loading, error, fieldErrors, update } = usePostMutation();

  const handleSubmit = async (values) => {
    try {
      await update(id, values);
      addToast("Post updated successfully!", "success");
      navigate(`/posts/${id}`);
    } catch {
      addToast("Failed to update post.", "error");
    }
  };

  if (postLoading) return <LoadingSpinner message="Loading post..." />;
  if (postError) return <div style={{ padding: "2rem" }}><Alert type="error" message={postError} /></div>;
  if (!post) return <div style={{ padding: "2rem" }}><Alert type="error" message="Post not found." /></div>;

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <Link to={`/posts/${id}`} style={styles.back}>&larr; Back to post</Link>
        <h1 style={styles.title}>Edit Post</h1>
        <p style={styles.subtitle}>Update the details of your blog post.</p>
        <PostForm
          initialData={{
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            category: post.category || "",
            status: post.status,
            thumbnail_url: post.thumbnail_url,
            id: post.id,
          }}
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
