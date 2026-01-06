import { api } from "./api";

export type LoginPayload = {
  login: string;     
  password: string;
  recaptchaToken?: string | null;
};

export type RegisterPayload = {
  name: string;
  username: string;
  email?: string;
  password: string;
};


export async function login(data: LoginPayload) {
  const payload = {
    email: data.login,     
    username: data.login,  
    password: data.password,
  };

  const res = await api.post("/login", payload);

  if (typeof window !== "undefined") {
    const token = res.data?.token || res.data?.access_token;
    if (token) localStorage.setItem("token", token);
  }

  return res.data;
}


export async function register(data: RegisterPayload) {
  const res = await api.post("/register", data);
  return res.data;
}

/* =======================
   LOGOUT LOCAL
   ======================= */
export function logoutLocal() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

/* =======================
   ✅ GOOGLE SSO
   ======================= */
export function loginWithGoogle() {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

  window.location.href = `${baseUrl}/api/auth/google/redirect`;
}
