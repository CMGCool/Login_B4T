"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { sendForgotPasswordOtp, verifyForgotPasswordOtp } from "@/lib/auth";

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000;

const getOtpStorageKey = (email: string) =>
  `forgot_password_otp_expires_at:${email || "unknown"}`;

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const [email, setEmail] = useState(emailParam);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const canResend = remainingSeconds <= 0;

  useEffect(() => {
    setEmail(emailParam);
  }, [emailParam]);

  useEffect(() => {
    if (!email) return;
    const key = getOtpStorageKey(email);
    const stored = localStorage.getItem(key);
    if (stored) {
      setExpiresAt(Number(stored));
      return;
    }
    const nextExpiry = Date.now() + OTP_TTL_MS;
    localStorage.setItem(key, String(nextExpiry));
    setExpiresAt(nextExpiry);
  }, [email]);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setRemainingSeconds(seconds);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 3500);
    return () => clearTimeout(timer);
  }, [showToast]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    const next = value.replace(/\D/g, "");
    if (!next) {
      setDigits((prev) => {
        const copy = [...prev];
        copy[index] = "";
        return copy;
      });
      return;
    }

    setDigits((prev) => {
      const copy = [...prev];
      copy[index] = next[0];
      return copy;
    });

    if (index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text");
    const chars = text.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
    if (!chars.length) return;

    setDigits((prev) => {
      const copy = [...prev];
      for (let i = 0; i < OTP_LENGTH; i += 1) {
        copy[i] = chars[i] ?? "";
      }
      return copy;
    });

    const lastIndex = Math.min(chars.length, OTP_LENGTH) - 1;
    if (lastIndex >= 0) focusInput(lastIndex);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email is missing. Please request OTP again.");
      return;
    }

    const otp = digits.join("");
    if (otp.length !== OTP_LENGTH) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    if (remainingSeconds <= 0) {
      setError("OTP expired. Please request a new code.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await verifyForgotPasswordOtp(email.trim(), otp);
      const resetToken = response?.data?.data?.reset_token;
      if (resetToken) {
        sessionStorage.setItem("reset_password_token", resetToken);
        sessionStorage.setItem("reset_password_email", email.trim());
      }
      setShowToast(true);
      setTimeout(() => router.replace("/auth/ResetPassword"), 900);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        "OTP verification failed. Please try again.";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError("Email is missing. Please request OTP again.");
      return;
    }

    try {
      setResending(true);
      setError(null);
      await sendForgotPasswordOtp(email.trim());
      const nextExpiry = Date.now() + OTP_TTL_MS;
      localStorage.setItem(getOtpStorageKey(email.trim()), String(nextExpiry));
      setExpiresAt(nextExpiry);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        "Failed to resend OTP. Please try again.";
      setError(String(message));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-4">
      {showToast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-sky-50 px-4 py-3 text-left text-sm text-emerald-800 shadow-lg">
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              OK
            </span>
            <div>
              <div className="font-semibold">OTP berhasil diverifikasi</div>
              <div className="mt-0.5 text-emerald-700">
                Silakan lanjut buat password baru.
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-[420px] text-center">
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
              d="M4 7.5h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 7.5l8 6 8-6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          We sent a verification code to {email || "your email"}.
        </p>

        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="flex items-center justify-center gap-2">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                className="h-11 w-11 rounded-md border border-gray-200 text-center text-lg font-semibold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-5 w-full h-11 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          {error && (
            <div className="mt-3 text-sm text-red-600 text-center">{error}</div>
          )}
        </form>

        <div className="mt-5 text-sm text-gray-500">
          Didn't receive the email?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !canResend}
            className={`font-medium hover:underline disabled:opacity-60 ${
              canResend ? "text-blue-600" : "text-gray-400"
            }`}
          >
            {resending
              ? "Resending..."
              : canResend
              ? "Click to resend"
              : `Resend in ${Math.floor(remainingSeconds / 60)
                  .toString()
                  .padStart(2, "0")}:${(remainingSeconds % 60)
                  .toString()
                  .padStart(2, "0")}`}
          </button>
        </div>

        <Link
          href="/auth/Signin"
          className="mt-4 inline-flex items-center justify-center gap-2 text-sm text-gray-600 hover:underline"
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

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
