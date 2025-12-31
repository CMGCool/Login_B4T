import { api } from "./api";

export type User = {
  id: number;
  name: string;
  email: string;
};

export async function getProfile(): Promise<User> {
  const res = await api.get("/me");
  return res.data;
}
