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
  return api.post("/login", {
    email: data.login,
    username: data.login,
    password: data.password,
    recaptchaToken: data.recaptchaToken,
  });
}

export async function register(data: RegisterPayload) {
  return api.post("/register", data);
}

export async function logout() {
  try {
    await api.post("/logout");
  } finally {
    window.location.href = "/auth/Signin";
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
