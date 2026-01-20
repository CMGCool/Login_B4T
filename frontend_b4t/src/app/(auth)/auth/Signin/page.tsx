"use client";

import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";
import { signInFormSchema } from "@/lib/form-schema";
import { login, loginWithGoogle } from "@/lib/auth";
import Image from "next/image";

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
    return LOGIN_MESSAGES.invalidCreds;
  }

  if (status === 403) {
    // coba deteksi dari pesan backend 
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
    return LOGIN_MESSAGES.invalidCredsTry;
  }

  if (serverMsg.includes("pending") || serverMsg.includes("approval")) {
    return LOGIN_MESSAGES.pendingApproval;
  }
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
      const role = res.data?.role;

      if (role === "super_admin") {
        router.replace("/super-admin/dashboard");
      } else if (role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/user/welcome");
      }
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-[674px_1fr] bg-white">
      {/* Kolom Kiri: Form Login */}
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-full max-w-[360px]  origin-center scale-[0.92]">
          {/* Logo */}
          <div className="mb-5 text-left">
            <Image
              src="/images/Logo-B4T.png"
              alt="B4T Logo"
              width={64}
              height={32}
              className="mt-5 mb-2"
            />
          </div>

          {/* Header */}
          <div className="mb-2 text-left">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Log in</h1>
            <p className="mt-1 text-sm text-gray-500 font-medium">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 text-xs font-medium text-red-600 border border-red-100">
              {error}
            </div>
          )}

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Username */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Username
                    </label>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Enter your username"
                        type="text"
                        autoComplete="username"
                        className="h-11 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="••••••••"
                        type="password"
                        autoComplete="current-password"
                        className="h-11 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      />
                    </FormControl>
                    <div className="flex justify-end">
                      <Link
                        href="/auth/ForgotPassword"
                        className="text-xs font-medium text-gray-600 hover:text-blue-600 transition"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* reCAPTCHA */}
              <div className="flex justify-center py-2">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  type="submit"
                  disabled={loading || !captchaToken}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={loginWithGoogle}
                  className="w-full h-11 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2.5 transition-all"
                >
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
                  Sign in with Google
                </Button>
              </div>

              {/* Footer */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500 font-medium">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/Signup"
                    className="text-blue-600 font-bold hover:underline ml-0.5"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
      <div className="hidden lg:flex h-full flex-1 items-stretch bg-white relative overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <defs>
            <clipPath id="wavyMask" clipPathUnits="objectBoundingBox">
              <path d="M1,0 L1,1 L0.1,1 
                C0.3,0.8 0,0.7 0.25,0.5 
                C0.5,0.3 0.2,0.2 0.45,0 
                Z"
              />
            </clipPath>
          </defs>
          <path
            d="M35,0 
               C10,20 40,30 15,50 
               C-10,70 20,80 0,100"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div
          className="relative h-full w-full"
          style={{ clipPath: 'url(#wavyMask)' }}
        >
          <Image
            src="/images/img-login.svg"
            alt="Login background"
            fill
            sizes="50vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
