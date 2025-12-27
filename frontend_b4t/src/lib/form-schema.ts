import { z } from "zod";

export const signInFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Email is not valid"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const signUpFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Email is not valid"),

  password: z
    .string()
    .min(1, "Password is required"),
  
});

