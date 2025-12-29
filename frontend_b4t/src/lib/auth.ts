import { api } from "./api";

export type LoginPayload = {
  login: string;     // email atau username
  password: string;
};

export type RegisterPayload = {
  name: string;
  username: string;
  email?: string;
  password: string;
};

export async function login(data: LoginPayload) {
  const res = await api.post("/login", data);

  // simpan token di sini (biar signin page lebih clean)
  if (typeof window !== "undefined" && res.data?.token) {
    localStorage.setItem("token", res.data.token);
  }

  return res.data;
}

export async function register(data: RegisterPayload) {
  const res = await api.post("/register", data);
  return res.data;
}

export function logoutLocal() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}
