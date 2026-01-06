import { z } from "zod";

/* =======================
   SIGN IN
   (username)
======================= */
export const signInFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Username is required." }),

  password: z
    .string()
    .min(1, { message: "Password is required." }),
});

/* =======================
   SIGN UP
======================= */
export const signUpFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required." }),

  username: z
    .string()
    .min(1, { message: "Username is required." })
    .min(3, { message: "Username must be at least 3 characters long." }),

  email: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      { message: "Please enter a valid email address." }
    ),

  password: z
    .string()
    .min(1, { message: "Password is required." })
    .min(6, { message: "Password must be at least 6 characters long." }),
});
