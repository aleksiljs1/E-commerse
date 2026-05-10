"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Credential = { username: string; password: string; productTitle: string };

export function ViewCredentialsButton({ credentials }: { credentials: Credential[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 hover:bg-emerald-400/20 transition-all px-3 py-1.5 rounded-lg"
      >
        {open ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        {open ? "Hide" : "View Account"}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {credentials.map((cred, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-2">{cred.productTitle}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Email / Username</p>
                  <p className="text-white font-mono select-all text-xs">{cred.username}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Password</p>
                  <p className="text-white font-mono select-all text-xs">{cred.password}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
