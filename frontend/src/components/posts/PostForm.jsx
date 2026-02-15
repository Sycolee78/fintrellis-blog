import React, { useState, useEffect, useRef } from "react";
import Input from "../common/Input";
import TextArea from "../common/TextArea";
import Button from "../common/Button";
import Alert from "../common/Alert";
import { validatePostForm } from "../../utils/validation";

export default function PostForm({
  initialData = {},
  onSubmit,
  isLoading = false,
  serverError = null,
  fieldErrors = {},
}) {
  const [values, setValues] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    status: "draft",
    thumbnail: null,
    ...initialData,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [thumbnailPreview, setThumbnailPreview] = useState(
    initialData.thumbnail_url || null
  );
  const fileRef = useRef(null);

  useEffect(() => {
    if (initialData && initialData.id) {
      setValues((prev) => ({ ...prev, ...initialData }));
      if (initialData.thumbnail_url) {
        setThumbnailPreview(initialData.thumbnail_url);
      }
    }
  }, [initialData.id]); // Only re-run when the post ID changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const formErrors = validatePostForm({ ...values, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: formErrors[name] || null }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const formErrors = validatePostForm(values);
    setErrors((prev) => ({ ...prev, [name]: formErrors[name] || null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newValues = { ...values, thumbnail: file };
    setValues(newValues);

    const formErrors = validatePostForm(newValues);
    if (formErrors.thumbnail) {
      setErrors((prev) => ({ ...prev, thumbnail: formErrors.thumbnail }));
      setThumbnailPreview(null);
    } else {
      setErrors((prev) => ({ ...prev, thumbnail: null }));
      const reader = new FileReader();
      reader.onload = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setValues((prev) => ({ ...prev, thumbnail: null }));
    setThumbnailPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validatePostForm(values);
    setErrors(formErrors);
    setTouched({ title: true, content: true, excerpt: true, category: true });

    if (Object.keys(formErrors).length === 0) {
      const { thumbnail_url, id, ...submitData } = values;
      onSubmit(submitData);
    }
  };

  const getError = (field) => errors[field] || fieldErrors[field]?.[0] || null;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <Alert type="error" message={serverError} />}

      <Input
        label="Title"
        name="title"
        value={values.title}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getError("title")}
        placeholder="Enter post title"
        autoFocus
      />

      <Input
        label="Category (optional)"
        name="category"
        value={values.category}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getError("category")}
        placeholder="e.g. Technology, Design, Travel"
      />

      {/* Thumbnail upload */}
      <div style={fieldGroupStyle}>
        <label style={labelStyle}>Thumbnail Image</label>
        {thumbnailPreview && (
          <div style={previewWrapStyle}>
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              style={previewImgStyle}
            />
            <button
              type="button"
              onClick={handleRemoveThumbnail}
              style={removeButtonStyle}
              aria-label="Remove thumbnail"
            >
              &times; Remove
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={fileInputStyle}
        />
        <span style={hintStyle}>JPEG, PNG, or WebP. Max 5 MB.</span>
        {getError("thumbnail") && (
          <p style={errorTextStyle} role="alert">
            {getError("thumbnail")}
          </p>
        )}
      </div>

      <TextArea
        label="Content"
        name="content"
        value={values.content}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getError("content")}
        placeholder="Write your post content..."
        rows={12}
      />

      <TextArea
        label="Excerpt (optional)"
        name="excerpt"
        value={values.excerpt}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getError("excerpt")}
        placeholder="Short summary for the post list..."
        rows={3}
      />

      <div style={fieldGroupStyle}>
        <label htmlFor="status" style={labelStyle}>
          Status
        </label>
        <select
          id="status"
          name="status"
          value={values.status}
          onChange={handleChange}
          style={selectStyle}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Post"}
        </Button>
      </div>
    </form>
  );
}

const fieldGroupStyle = { marginBottom: "1rem" };
const labelStyle = {
  display: "block",
  marginBottom: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-text)",
};
const selectStyle = {
  width: "100%",
  padding: "0.625rem 0.75rem",
  fontSize: "1rem",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--border-radius)",
  fontFamily: "inherit",
  backgroundColor: "var(--color-surface)",
};
const fileInputStyle = {
  display: "block",
  marginTop: "0.25rem",
  fontSize: "0.875rem",
};
const hintStyle = {
  display: "block",
  marginTop: "0.25rem",
  fontSize: "0.75rem",
  color: "var(--color-text-tertiary)",
};
const errorTextStyle = {
  marginTop: "0.25rem",
  fontSize: "0.8125rem",
  color: "var(--color-danger)",
};
const previewWrapStyle = {
  marginBottom: "0.75rem",
  position: "relative",
  display: "inline-block",
};
const previewImgStyle = {
  width: "200px",
  height: "120px",
  objectFit: "cover",
  borderRadius: "var(--border-radius)",
  border: "1px solid var(--color-border)",
};
const removeButtonStyle = {
  display: "block",
  marginTop: "0.375rem",
  background: "none",
  border: "none",
  color: "var(--color-danger)",
  fontSize: "0.8125rem",
  cursor: "pointer",
  fontWeight: 500,
};
