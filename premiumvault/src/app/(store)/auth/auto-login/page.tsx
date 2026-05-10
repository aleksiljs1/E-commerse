"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AutoLoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const token = searchParams.get("t");
    if (!token) {
      router.replace("/auth/signin?error=invalid_link");
      return;
    }

    signIn("credentials", { autoLoginToken: token, redirect: false }).then((res) => {
      if (res?.error) {
        router.replace("/auth/signin?error=link_expired");
      } else {
        router.replace("/");
      }
    });
  }, [searchParams, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm">Verifying your account...</p>
      </div>
    </div>
  );
}
