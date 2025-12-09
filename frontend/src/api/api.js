// src/api/api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

export const API = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
