"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendForgotPasswordOtp } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await sendForgotPasswordOtp(email.trim());
      router.push(`/auth/VerifyOtp?email=${encodeURIComponent(email.trim())}`);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        "Failed to send OTP. Please try again.";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[360px] text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-blue-600"
          >
            <path
              d="M14 8a4 4 0 1 0-8 0v3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <rect
              x="4"
              y="11"
              width="16"
              height="9"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <circle cx="12" cy="15.5" r="1.2" fill="currentColor" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900">
          Forgot password?
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          No worries, we&#39;ll send you OTP code for password reset.
        </p>

        <form
          className="mt-6 space-y-4 text-left"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-800">
              Email
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              className="h-11"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Sending..." : "Send OTP"}
          </Button>

          {error && (
            <div className="text-sm text-red-600 text-center">{error}</div>
          )}
        </form>

        <Link
          href="/auth/Signin"
          className="mt-5 inline-flex items-center justify-center gap-2 text-sm text-gray-600 hover:underline"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to log in
        </Link>
      </div>
    </div>
  );
}
