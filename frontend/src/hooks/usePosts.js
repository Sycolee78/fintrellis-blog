import { useState, useEffect, useCallback } from "react";
import { getPosts } from "../api/posts";

export function usePosts(params = {}) {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const serializedParams = JSON.stringify(params);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPosts(JSON.parse(serializedParams));
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [serializedParams]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { ...data, loading, error, refetch: fetchPosts };
}
