import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverError = error.response?.data?.error;
    const message = serverError?.message || "An unexpected error occurred.";
    const details = serverError?.details || {};
    return Promise.reject({ message, details, status: error.response?.status });
  }
);

export default apiClient;
