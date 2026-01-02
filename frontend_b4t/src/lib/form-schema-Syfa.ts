import { z } from "zod";

/* =======================
   SIGN IN
   (username / email)
======================= */
export const signInFormSchema = z.object({
  // ❌ JANGAN pakai .email()
  // karena bisa diisi username
  email: z
    .string()
    .min(1, "Username / Email is required"),

  password: z
    .string()
    .min(1, "Password is required"),
});

/* =======================
   SIGN UP
======================= */
/* =======================
   SIGN UP
======================= */
export const signUpFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required"),

  username: z
    .string()
    .min(3, "Username minimal 3 karakter"),

  // ✅ email BOLEH kosong
  email: z
    .string()
    .trim()
    .email("Email is not valid")
    .optional()
    .or(z.literal("")),

  password: z
    .string()
    .min(6, "Password minimal 6 karakter"),
});
