import { api } from "./api";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export async function login(data: LoginPayload) {
  const res = await api.post("/login", data);
  return res.data;
}

export async function register(data: RegisterPayload) {
  const res = await api.post("/register", data);
  return res.data;
}

