import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7143";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Her istekte localStorage'dan token ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("taskflow_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 gelirse login'e yönlendir
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("taskflow_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
