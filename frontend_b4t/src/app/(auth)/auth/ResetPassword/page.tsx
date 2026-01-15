"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordWithOtp } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 3500);
    return () => clearTimeout(timer);
  }, [showToast]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const email = sessionStorage.getItem("reset_password_email");
    const token = sessionStorage.getItem("reset_password_token");

    if (!email || !token) {
      setError("Reset session expired. Please request OTP again.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await resetPasswordWithOtp(email, token, password, confirmPassword);
      setShowToast(true);
      setTimeout(() => router.replace("/auth/Signin"), 1500);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        "Failed to reset password. Please try again.";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Toast (tetap sama) */}
      {showToast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-sky-50 px-4 py-3 text-left text-sm text-emerald-800 shadow-lg">
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              OK
            </span>
            <div>
              <div className="font-semibold">Password berhasil direset</div>
              <div className="mt-0.5 text-emerald-700">
                Silakan login dengan password baru.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* LEFT: FORM */}
        <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-10">
          <div className="w-full max-w-[360px] text-center">
            {/* Icon */}
            <div className="mb-6 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <svg
                width="22"
                height="22"
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

            {/* Title */}
            <h1 className="text-2xl font-semibold text-gray-900">
              Set new password
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Your new password must be different to
              <br />
              previously used passwords.
            </p>

            {/* Form (logic sama) */}
            <form className="mt-6 space-y-4 text-left" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-800">
                  Enter New Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className="h-11"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-800">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  className="h-11"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 text-center">{error}</div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Resetting..." : "Reset password"}
              </Button>
            </form>

            {/* Back */}
            <Link
              href="/auth/Signin"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 text-sm text-gray-600 hover:underline"
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

        {/* RIGHT: ILLUSTRATION (sama seperti Forgot Password) */}
        <div className="hidden lg:block lg:w-1/2 relative bg-[#C4D8F7]">
          <Image
            src="/reset.svg"
            alt="Reset Password Illustration"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
