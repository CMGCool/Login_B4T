"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

import { signUpFormSchema } from "@/lib/form-schema";
import { register } from "@/lib/auth";

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SignUpValues = z.infer<typeof signUpFormSchema>;

/** ✅ ADDED: Centralized signup messages */
const SIGNUP_MESSAGES = {
  // required fields
  nameRequired: "Name is required.",
  usernameRequired: "Username is required.",
  passwordRequired: "Password is required.",
  emailRequired: "Email is required.",

  // username / email
  usernameTaken: "Username is already taken.",
  emailRegistered: "Email is already registered.",
  emailInvalid: "Please enter a valid email address.",

  // password
  passwordMin6: "Password must be at least 6 characters long.",
  passwordConfirmMismatch: "Password confirmation does not match.",

  // ✅ ADDED: success messages (optional)
  registeredWaitApproval: "Registration successful. Please wait for admin approval.",
  accountCreated: "Your account has been created successfully.",

  // generic
  fillRequired: "Please fill in all required fields.",
  invalidInput: "Invalid input. Please check your data.",
  registerFailed: "Register failed",
} as const;

/** ✅ ADDED: map backend validation into friendly messages */
function mapSignupServerMessage(raw: unknown): string | null {
  const msg = String(raw ?? "").trim();
  const lower = msg.toLowerCase();

  if (!msg) return null;

  // username/email uniqueness
  if (
    lower.includes("username") &&
    (lower.includes("taken") || lower.includes("exists") || lower.includes("already"))
  ) {
    return SIGNUP_MESSAGES.usernameTaken;
  }
  if (
    lower.includes("email") &&
    (lower.includes("taken") ||
      lower.includes("exists") ||
      lower.includes("already") ||
      lower.includes("registered"))
  ) {
    return SIGNUP_MESSAGES.emailRegistered;
  }
  if (
    lower.includes("email") &&
    (lower.includes("valid") || lower.includes("format") || lower.includes("invalid"))
  ) {
    return SIGNUP_MESSAGES.emailInvalid;
  }

  // password rules
  if (lower.includes("password") && (lower.includes("6") || lower.includes("min") || lower.includes("least"))) {
    return SIGNUP_MESSAGES.passwordMin6;
  }
  if (lower.includes("password") && (lower.includes("confirm") || lower.includes("match"))) {
    return SIGNUP_MESSAGES.passwordConfirmMismatch;
  }

  // required fields
  if (lower.includes("required")) {
    // kalau backend cuma bilang "is required" tanpa jelas field, pakai generic
    return SIGNUP_MESSAGES.fillRequired;
  }

  // fallback to original message (kalau sudah bagus)
  return msg;
}

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ ADDED: success state
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (values: SignUpValues) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null); // ✅ ADDED

      await register({
        name: values.name,
        username: values.username,
        email: values.email || undefined, // optional
        password: values.password,
      });

      // ✅ ADDED: (optional) set success, lalu redirect ke login bawa query success
      setSuccess(SIGNUP_MESSAGES.accountCreated);

      router.replace("/auth/Signin?success=registered");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 422) {
          const errors = (err.response?.data as any)?.errors;

          // ✅ ADDED: ambil error pertama dari Laravel validation dan map ke pesan yang kamu mau
          if (errors && typeof errors === "object") {
            const firstKey = Object.keys(errors)[0];
            const firstMsgRaw = Array.isArray(errors[firstKey])
              ? errors[firstKey][0]
              : String(errors[firstKey]);

            setError(mapSignupServerMessage(firstMsgRaw) ?? SIGNUP_MESSAGES.invalidInput);
          } else {
            const msg = (err.response?.data as any)?.message;
            setError(mapSignupServerMessage(msg) ?? SIGNUP_MESSAGES.invalidInput);
          }
          return;
        }

        if (status === 403) {
          setError("Forbidden (403). Cek CORS / Sanctum / api.ts");
          return;
        }

        setError(
          mapSignupServerMessage((err.response?.data as any)?.message) ??
            SIGNUP_MESSAGES.registerFailed
        );
      } else {
        setError(SIGNUP_MESSAGES.registerFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[360px]">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Sign up</h1>
        </div>

        {/* ✅ ADDED: Success (simple text) */}
        {success && (
          <div className="mb-4 text-sm text-green-600 text-center">{success}</div>
        )}

        {/* Error (seperti simple text) */}
        {error && (
          <div className="mb-4 text-sm text-red-600 text-center">{error}</div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* NAME */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <label className="block mb-1 text-sm font-medium text-gray-800">
                    Name<span className="text-red-500">*</span>
                  </label>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Enter your name"
                      className="h-11"
                      autoComplete="name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* USERNAME */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <label className="block mb-1 text-sm font-medium text-gray-800">
                    Username<span className="text-red-500">*</span>
                  </label>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Enter your username"
                      className="h-11"
                      autoComplete="username"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* (Optional) EMAIL */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <label className="block mb-1 text-sm font-medium text-gray-800">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Enter your email"
                      className="h-11"
                      type="email"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PASSWORD */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <label className="block mb-1 text-sm font-medium text-gray-800">
                    Password<span className="text-red-500">*</span>
                  </label>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Create a password"
                      className="h-11"
                      type="password"
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Loading..." : "Get started"}
            </Button>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 pt-1">
              Already have an account?{" "}
              <Link
                href="/auth/Signin"
                className="text-blue-600 font-medium hover:underline"
              >
                Log in
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
