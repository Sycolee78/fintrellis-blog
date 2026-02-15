import apiClient from "./client";

export const getPosts = (params) => apiClient.get("/posts/", { params });

export const getPost = (id) => apiClient.get(`/posts/${id}/`);

export const createPost = (data) => {
  const formData = buildFormData(data);
  return apiClient.post("/posts/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updatePost = (id, data) => {
  const formData = buildFormData(data);
  return apiClient.put(`/posts/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deletePost = (id) => apiClient.delete(`/posts/${id}/`);

function buildFormData(data) {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (key === "thumbnail" && value instanceof File) {
      fd.append("thumbnail", value);
    } else if (key !== "thumbnail") {
      fd.append(key, value);
    }
  });
  return fd;
}
