"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-gray-400 hover:text-white border border-white/[0.1] rounded-lg px-4 py-2 transition-colors"
    >
      Sign Out
    </button>
  );
}
