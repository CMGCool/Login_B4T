"use client";

import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";
import { signInFormSchema } from "@/lib/form-schema";
import { login, loginWithGoogle } from "@/lib/auth";

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SignInValues = z.infer<typeof signInFormSchema>;

/** ✅ ADDED: Centralized login messages */
const LOGIN_MESSAGES = {
  invalidCreds: "Invalid username or password.",
  invalidCredsAlt: "The username or password you entered is incorrect.",
  invalidCredsTry: "Please check your username and password and try again.",

  usernameRequired: "Username is required.",
  passwordRequired: "Password is required.",

  notApproved: "Your account has not been approved yet.",
  pendingApproval: "Your account is pending approval.",

  googleRegistered: "This account is registered using Google sign-in.",
  googlePlease: "Please sign in using Google.",

  failedLater: "Login failed. Please try again later.",
  somethingWrong: "Something went wrong. Please try again.",
} as const;

/**
 * ✅ ADDED: Try to map backend/axios errors into friendly messages
 * Catatan:
 * - 401 -> kredensial salah
 * - 403 -> akun belum aktif / pending approval
 * - 409 -> akun terdaftar via Google (contoh umum)
 * - 5xx / network -> pesan umum
 * - kalau backend sudah kirim "message" yang spesifik, kita coba pakai juga (sepanjang relevan)
 */
function getLoginErrorMessage(err: unknown): string {
  // Default fallback
  const fallback = LOGIN_MESSAGES.failedLater;

  if (!axios.isAxiosError(err)) return LOGIN_MESSAGES.somethingWrong;

  const status = err.response?.status;
  const serverMsgRaw =
    (err.response?.data as any)?.message ??
    (err.response?.data as any)?.error ??
    (err.response?.data as any)?.detail ??
    "";

  const serverMsg = String(serverMsgRaw || "").toLowerCase();

  // Network / no response (timeout, CORS, offline, dll.)
  if (!err.response) return LOGIN_MESSAGES.failedLater;

  // Common HTTP status mapping
  if (status === 401) {
    // pilih salah satu versi pesan invalid creds (kamu bisa ganti jika mau)
    return LOGIN_MESSAGES.invalidCreds;
  }

  if (status === 403) {
    // coba deteksi dari pesan backend kalau ada
    if (serverMsg.includes("pending") || serverMsg.includes("approval")) {
      return LOGIN_MESSAGES.pendingApproval;
    }
    if (
      serverMsg.includes("not approved") ||
      serverMsg.includes("not active") ||
      serverMsg.includes("inactive") ||
      serverMsg.includes("belum") ||
      serverMsg.includes("aktif")
    ) {
      return LOGIN_MESSAGES.notApproved;
    }
    // fallback untuk 403
    return LOGIN_MESSAGES.pendingApproval;
  }

  if (status === 409) {
    // sering dipakai untuk konflik akun (mis. akun google)
    return `${LOGIN_MESSAGES.googleRegistered} ${LOGIN_MESSAGES.googlePlease}`;
  }

  if (status && status >= 500) {
    return LOGIN_MESSAGES.failedLater;
  }

  // If backend sends recognizable messages, map them
  if (
    serverMsg.includes("google") ||
    serverMsg.includes("sso") ||
    serverMsg.includes("oauth")
  ) {
    return `${LOGIN_MESSAGES.googleRegistered} ${LOGIN_MESSAGES.googlePlease}`;
  }

  if (
    serverMsg.includes("invalid") ||
    serverMsg.includes("incorrect") ||
    serverMsg.includes("unauthorized") ||
    serverMsg.includes("wrong") ||
    serverMsg.includes("password") ||
    serverMsg.includes("username")
  ) {
    // gunakan salah satu versi invalid creds
    return LOGIN_MESSAGES.invalidCredsTry;
  }

  if (serverMsg.includes("pending") || serverMsg.includes("approval")) {
    return LOGIN_MESSAGES.pendingApproval;
  }

  // Last: if backend gave a short clear message, use it; otherwise fallback
  const trimmed = String(serverMsgRaw || "").trim();
  return trimmed ? trimmed : fallback;
}

export default function SigninPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInValues) => {
    if (!captchaToken) {
    setError("Please verify that you are not a robot.");
    return;
  }
    try {
      setLoading(true);
      setError(null);

      const res = await login({
        login: values.email,
        password: values.password,
        recaptchaToken: captchaToken,
      });

      const role = res?.role;

      if (role === "super_admin") {
        router.replace("/super-admin/dashboard");
      } else if (role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/user/welcome");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Login failed");
      } else {
        setError("Login failed");
      }
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[360px]">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Log in</h1>
          <p className="mt-2 text-sm text-gray-500">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-600 text-center">{error}</div>
        )}

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <label className="block mb-1 text-sm font-medium text-gray-800">
                    Username
                  </label>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Enter your Username"
                      type="text"
                      autoComplete="username"
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <label className="block mb-1 text-sm font-medium text-gray-800">
                    Password
                  </label>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="••••••••"
                      type="password"
                      autoComplete="current-password"
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center">
            <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onChange={(token) => setCaptchaToken(token)}
            />
            </div>
           
            {/* Button */}
            <Button
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700">
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            {/* Separator */}
            <div className="my-2 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            {/* Google SSO */}
            <Button
              type="button"
              variant="outline"
              onClick={loginWithGoogle}
              className="w-full h-11"
            >
              <span className="flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.5 24.5c0-1.6-.14-3.14-.41-4.63H24v9.26h12.7c-.55 2.96-2.2 5.47-4.67 7.18l7.2 5.59c4.2-3.88 6.27-9.6 6.27-16.4z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.54 28.59c-.48-1.44-.76-2.97-.76-4.59s.28-3.15.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.98-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.2-5.59c-2 1.34-4.56 2.13-8.7 2.13-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                Continue with Google
              </span>
            </Button>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 pt-1">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/Signup"
                className="text-blue-600 font-medium hover:underline"
              >
                Sign up
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
