"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function VerifySentPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  const resend = async () => {
    if (!email) return;
    setResending(true);
    setError("");
    try {
      await fetch("/api/auth/resend-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-indigo-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            We sent a verification link to{" "}
            {email ? <strong className="text-white">{email}</strong> : "your email address"}.
            {" "}Click it to activate your account.
          </p>
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {resent ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            Verification email resent!
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-500 text-xs">Didn&apos;t receive it? Check your spam folder or</p>
            <button
              onClick={resend}
              disabled={resending || !email}
              className="cursor-pointer inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
              {resending ? "Resending..." : "Resend verification email"}
            </button>
          </div>
        )}

        <Link href="/auth/signin" className="block text-xs text-gray-500 hover:text-gray-400 transition-colors">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
