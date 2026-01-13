import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Auto-inject token: prefer cookie (shared across ports), fallback to localStorage
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/auth/Signin";
    }
    return Promise.reject(err);
  }
);
