import apiClient from "./client";

export const register = (data) =>
  apiClient.post("/auth/register/", data);

export const login = (data) =>
  apiClient.post("/auth/login/", data);

export const refreshToken = () =>
  apiClient.post("/auth/refresh/", {});

export const logout = () =>
  apiClient.post("/auth/logout/", {});

export const getMe = () =>
  apiClient.get("/auth/me/");
