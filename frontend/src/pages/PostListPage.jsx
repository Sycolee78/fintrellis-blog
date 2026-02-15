import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import Hero from "../components/layout/Hero";
import PostCard from "../components/posts/PostCard";
import Pagination from "../components/common/Pagination";
import Alert from "../components/common/Alert";
import EmptyState from "../components/common/EmptyState";
import { GridSkeleton } from "../components/common/CardSkeleton";

const PAGE_SIZE = 9;

export default function PostListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const params = {
    page,
    page_size: PAGE_SIZE,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
    ...(categoryFilter && { category: categoryFilter }),
    ordering: "-created_at",
  };

  const { results, count, loading, error } = usePosts(params);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div>
      <Hero
        title="Blog"
        subtitle="Explore our latest posts, ideas, and stories"
      />

      <div style={styles.container}>
        {/* Filters bar */}
        <div style={styles.filters}>
          <input
            type="search"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={styles.searchInput}
            aria-label="Search posts"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={styles.select}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <input
            type="text"
            placeholder="Filter by category..."
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            style={styles.select}
            aria-label="Filter by category"
          />
          {(search || statusFilter || categoryFilter) && (
            <button
              onClick={() => { setSearch(""); setStatusFilter(""); setCategoryFilter(""); setPage(1); }}
              style={styles.clearBtn}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Result count */}
        {!loading && (
          <p style={styles.count}>
            {count} post{count !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Error */}
        {error && <Alert type="error" message={error} />}

        {/* Loading */}
        {loading && <GridSkeleton count={6} />}

        {/* Empty state */}
        {!loading && !error && results.length === 0 && (
          <EmptyState
            message="No posts yet. Create your first post!"
            actionLabel="Create Post"
            onAction={() => navigate("/posts/new")}
          />
        )}

        {/* Grid */}
        {!loading && results.length > 0 && (
          <>
            <div style={styles.grid}>
              {results.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "var(--max-width)",
    margin: "0 auto",
    padding: "2rem 1.5rem 3rem",
  },
  filters: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchInput: {
    flex: "1 1 240px",
    padding: "0.625rem 1rem",
    fontSize: "0.9375rem",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--border-radius)",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color var(--transition-fast)",
  },
  select: {
    padding: "0.625rem 0.75rem",
    fontSize: "0.9375rem",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--border-radius)",
    fontFamily: "inherit",
    backgroundColor: "var(--color-surface)",
    minWidth: "140px",
  },
  clearBtn: {
    padding: "0.625rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--color-text-secondary)",
    background: "none",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--border-radius)",
    cursor: "pointer",
  },
  count: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-tertiary)",
    marginBottom: "1.25rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
};
