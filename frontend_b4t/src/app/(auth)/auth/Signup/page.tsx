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
import Image from "next/image";

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
    <div className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_720px] bg-[#ffffff]">
      {/* Kolom Kiri: Image Card */}
      <div className="hidden lg:flex h-full pb-10 pt-4 items-stretch relative overflow-hidden">
        <div className="relative flex-1 bg-white rounded-[40px] overflow-hidden border border-white">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          >
            <defs>
              <clipPath id="robotMask" clipPathUnits="objectBoundingBox">
                {/* Rounded Robot Shape: Adjusted for a more balanced ('rata') look */}
                <path d="M0,0 
                  L0,1 
                  L0.80,1 
                  Q0.84,1 0.84,0.95 
                  Q0.88,0.5 0.91,0.05 
                  Q0.92,0 0.88,0 
                  Z" />
              </clipPath>
            </defs>
          </svg>

          <div
            className="relative h-full w-full overflow-hidden"
            style={{ clipPath: 'url(#robotMask)' }}
          >
            <Image
              src="/images/register.png"
              alt="Register background"
              fill
              sizes="50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Form Signup */}
      <div className="flex flex-col items-center justify-center h-full bg-white relative z-20">
        <div className="w-full max-w-[360px] origin-center scale-[0.92]">
          {/* Logo */}
          <div className="mb-5 text-left">
            <Image
              src="/images/Logo-B4T.png"
              alt="B4T Logo"
              width={64}
              height={32}
              className="mt-5 mb-2 object-contain"
            />
          </div>

          {/* Header */}
          <div className="mb-6 text-left">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sign up</h1>
            <p className="mt-1 text-sm text-gray-500 font-medium">
              Create your account to get started.
            </p>
          </div>

          {/* Success/Error Message */}
          {(success || error) && (
            <div className={`mb-6 p-3 rounded-lg text-xs font-medium border ${success ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
              }`}>
              {success || error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* NAME */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Name<span className="text-red-500">*</span>
                    </label>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Enter your name"
                        className="h-11 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        autoComplete="name"
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* USERNAME */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Username<span className="text-red-500">*</span>
                    </label>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Enter your username"
                        className="h-11 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        autoComplete="username"
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* EMAIL */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Email<span className="text-red-500">*</span>
                    </label>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Enter your email"
                        className="h-11 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        type="email"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* PASSWORD */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Password<span className="text-red-500">*</span>
                    </label>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Create a password"
                        className="h-11 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        type="password"
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Get started"}
                </Button>
              </div>

              {/* Footer */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500 font-medium">
                  Already have an account?{" "}
                  <Link
                    href="/auth/Signin"
                    className="text-blue-600 font-bold hover:underline ml-0.5"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div >
  );
}
