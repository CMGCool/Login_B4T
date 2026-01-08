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
    if (token) {
      // Simpan untuk app ini (tetap pertahankan behavior lama)
      localStorage.setItem("token", token);
      // Set cookie shared antar port (agar dashboard_b4t bisa pakai)
      document.cookie = `token=${token}; path=/; domain=localhost; SameSite=Lax`;
    }
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
   LOGOUT (Server + Cookie + Local)
   ======================= */
export async function logoutAll() {
  try {
    await api.post("/logout");
  } catch (e) {
    // ignore
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    // Hapus cookie shared
    document.cookie = "token=; path=/; domain=localhost; Max-Age=0";
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
