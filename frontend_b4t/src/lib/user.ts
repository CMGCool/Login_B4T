import { api } from "./api";

/** NOTE:
 * backend kamu untuk profile yang benar ada /user/welcome (role:user),
 * tapi getProfile() kamu masih /me. Jangan dihapus dulu kalau dipakai file lain.
 */
export type User = {
  id: number;
  name: string;
  username?: string;
  email?: string | null;
  role?: string | null;
  is_approved?: boolean | number;
  created_at?: string;
};

/* ===== GET CURRENT USER (untuk dashboard & testing) ===== */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await api.get("/me");
    return res.data?.user || res.data;
  } catch (e) {
    return null;
  }
}

/* ===== EXISTING (biarkan) ===== */
export async function getProfile(): Promise<User> {
  const res = await api.get("/me");
  return res.data;
}


/* =======================
   ✅ LIST USERS (SUPER ADMIN)
   ======================= */
export async function getSuperAdminUsers(): Promise<User[]> {
  const res = await api.get("/super-admin/users");
  return res.data?.data ?? [];
}

/* =======================
   ✅ LIST USERS (ADMIN) - OPTIONAL kalau kamu butuh halaman admin/users
   ======================= */
export async function getAdminUsers(): Promise<User[]> {
  const res = await api.get("/admin/users");
  return res.data?.data ?? [];
}

/* =======================
   ✅ CREATE USER (SUPER ADMIN / ADMIN)
   ======================= */
export type CreateUserPayload = {
  name: string;
  username: string; // ✅ WAJIB sesuai backend
  email?: string; // ✅ optional sesuai backend
  password: string;

  // ✅ tambahan agar bisa pending saat dibuat oleh admin/super admin
  // (kalau backend mengabaikan field ini, status tetap mengikuti backend)
  is_approved?: boolean | number;
};

export async function createUser(
  payload: CreateUserPayload,
  role: "admin" | "super_admin"
) {
  const endpoint =
    role === "super_admin" ? "/super-admin/create-user" : "/admin/create-user";

  // ✅ pastikan default pending (tanpa ubah backend)
  const res = await api.post(endpoint, { ...payload, is_approved: false });
  return res.data;
}

/* =======================
   ✅ APPROVE USER
   ======================= */
/**
 * ✅ SESUAI routes/api.php kamu:
 * POST /api/approve-user/{id}
 * middleware: auth:sanctum + role:admin,super_admin
 *
 * Jadi endpoint approve ini SAMA untuk admin & super_admin.
 */
export async function approveUser(userId: number) {
  const res = await api.post(`/approve-user/${userId}`);
  return res.data;
}

/* =======================
   ✅ UPDATE USER (ADMIN & SUPER ADMIN)
   ======================= */
export type UpdateUserPayload = {
  name: string;
  username: string;
  email?: string | null;
  password?: string; // optional: hanya dikirim kalau mau ganti password
};

export async function updateUser(userId: number, payload: UpdateUserPayload) {
  /**
   * ✅ SESUAI backend routes/api.php kamu:
   * PUT /api/users/{id}
   */
  const res = await api.put(`/users/${userId}`, payload);
  return res.data;
}

/* =======================
   ✅ DELETE USER (ADMIN & SUPER ADMIN)
   ======================= */
export async function deleteUser(userId: number) {
  /**
   * ✅ SESUAI backend routes/api.php kamu:
   * DELETE /api/users/{id}
   */
  const res = await api.delete(`/users/${userId}`);
  return res.data;
}
