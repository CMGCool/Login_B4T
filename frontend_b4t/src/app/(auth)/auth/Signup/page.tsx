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

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

      await register({
        name: values.name,
        username: values.username,
        email: values.email || undefined, // optional
        password: values.password,
      });

      router.replace("/auth/Signin");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 422) {
          const errors = err.response?.data?.errors;
          if (errors && typeof errors === "object") {
            const firstKey = Object.keys(errors)[0];
            const firstMsg = Array.isArray(errors[firstKey])
              ? errors[firstKey][0]
              : String(errors[firstKey]);
            setError(firstMsg || "Validation error");
          } else {
            setError(err.response?.data?.message ?? "Validation error");
          }
          return;
        }

        if (status === 403) {
          setError("Forbidden (403). Cek CORS / Sanctum / api.ts");
          return;
        }

        setError(err.response?.data?.message ?? "Register failed");
      } else {
        setError("Register failed");
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
          <p className="mt-2 text-sm text-gray-500">
            Start your 30-day free trial.
          </p>
        </div>

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
                    Name*
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
                    Username*
                  </label>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Enter your email"
                      className="h-11"
                      autoComplete="username"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* (Optional) EMAIL — kalau kamu memang ingin ditampilkan, biarkan.
                Kalau mau persis gambar (3 field saja), hapus blok ini. */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <label className="block mb-1 text-sm font-medium text-gray-800">
                    Email (optional)
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
                    Password*
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
