"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { isValidEmail } from "@/lib/email-validation";
import { RefreshCw, CheckCircle } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    urlError === "link_expired" ? "Verification link expired. Please request a new one." :
    urlError === "invalid_link" ? "Invalid verification link." : ""
  );
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUnverified(false);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    // Check if account exists but is unverified before attempting signIn
    const checkRes = await fetch("/api/auth/resend-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, checkOnly: true }),
    });
    const checkData = await checkRes.json();

    if (checkData.unverified) {
      setUnverified(true);
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/");
    router.refresh();
  };

  const resend = async () => {
    setResending(true);
    try {
      await fetch("/api/auth/resend-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Sign In</h1>
        <p className="text-gray-400 text-sm text-center mb-8">
          Sign in to track your orders and unlock discounts
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {unverified && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 space-y-2">
              <p className="text-amber-400 text-sm font-medium">Email not verified</p>
              <p className="text-amber-300/70 text-xs">Check your inbox for the verification link.</p>
              {resent ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                  <CheckCircle className="w-3.5 h-3.5" />
                  New link sent!
                </div>
              ) : (
                <button
                  type="button"
                  onClick={resend}
                  disabled={resending}
                  className="cursor-pointer flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                  {resending ? "Resending..." : "Resend verification email"}
                </button>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white text-sm placeholder:text-gray-500 outline-none focus:border-white/[0.25] transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white text-sm placeholder:text-gray-500 outline-none focus:border-white/[0.25] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            style={{ background: "linear-gradient(to right, #f97316 2%, #f43f5e 50%, #9333ea 98%)" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-white hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
