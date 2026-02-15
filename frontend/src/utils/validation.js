const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function validatePostForm(values) {
  const errors = {};

  if (!values.title?.trim()) {
    errors.title = "Title is required.";
  } else if (values.title.length > 255) {
    errors.title = "Title must be under 255 characters.";
  }

  if (!values.content?.trim()) {
    errors.content = "Content is required.";
  } else if (values.content.trim().length < 10) {
    errors.content = "Content must be at least 10 characters.";
  }

  if (values.excerpt && values.excerpt.length > 500) {
    errors.excerpt = "Excerpt must be under 500 characters.";
  }

  if (values.category && values.category.length > 50) {
    errors.category = "Category must be under 50 characters.";
  }

  if (values.thumbnail instanceof File) {
    if (!ALLOWED_TYPES.includes(values.thumbnail.type)) {
      errors.thumbnail = "Only JPEG, PNG, and WebP images are allowed.";
    } else if (values.thumbnail.size > MAX_FILE_SIZE) {
      errors.thumbnail = "Image must be under 5 MB.";
    }
  }

  return errors;
}
