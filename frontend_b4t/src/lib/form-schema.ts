import { z } from "zod";

/* =======================
   SIGN IN
======================= */
export const signInFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Email is not valid"),

  password: z
    .string()
    .min(1, "Password is required"),
});

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

  email: z
    .string()
    .email("Email is not valid")
    .optional()
    .or(z.literal("")), // ✅ supaya input kosong tidak error uncontrolled

  password: z
    .string()
    .min(6, "Password minimal 6 karakter"),
});
