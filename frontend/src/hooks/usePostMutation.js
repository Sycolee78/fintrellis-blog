import { useState } from "react";
import { createPost, updatePost, deletePost } from "../api/posts";

export function usePostMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const resetErrors = () => {
    setError(null);
    setFieldErrors({});
  };

  const execute = async (action, ...args) => {
    setLoading(true);
    resetErrors();
    try {
      const response = await action(...args);
      return response.data;
    } catch (err) {
      setError(err.message);
      if (err.details) {
        setFieldErrors(err.details);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fieldErrors,
    resetErrors,
    create: (data) => execute(createPost, data),
    update: (id, data) => execute(updatePost, id, data),
    remove: (id) => execute(deletePost, id),
  };
}
