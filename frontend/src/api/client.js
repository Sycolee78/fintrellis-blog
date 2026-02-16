import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

// --- Token management (set by AuthContext) ---
let _getAccessToken = () => null;
let _onTokenRefreshed = () => {};
let _onAuthFailure = () => {};

export function configureAuth({ getToken, onRefresh, onFailure }) {
  _getAccessToken = getToken;
  _onTokenRefreshed = onRefresh;
  _onAuthFailure = onFailure;
}

// --- Request interceptor: attach Bearer token ---
apiClient.interceptors.request.use((config) => {
  const token = _getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response interceptor: 401 refresh retry ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry refresh/login/register endpoints
      const url = originalRequest.url || "";
      if (
        url.includes("/auth/refresh") ||
        url.includes("/auth/login") ||
        url.includes("/auth/register")
      ) {
        if (url.includes("/auth/refresh")) {
          _onAuthFailure();
        }
        return Promise.reject(_normalizeError(error));
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await apiClient.post("/auth/refresh/", {});
        _onTokenRefreshed(res.data.access);
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        _onAuthFailure();
        return Promise.reject(_normalizeError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(_normalizeError(error));
  }
);

function _normalizeError(error) {
  const serverError = error.response?.data?.error;
  const message = serverError?.message || "An unexpected error occurred.";
  const details = serverError?.details || {};
  return { message, details, status: error.response?.status };
}

export default apiClient;
