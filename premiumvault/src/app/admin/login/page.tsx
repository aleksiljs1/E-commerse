"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid email or password");
      setIsLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0F1412] p-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <span className="font-rajdhani text-white font-bold text-lg">PremiumVault</span>
        </div>

        <div>
          <blockquote className="text-[#A0B5A8] text-lg leading-relaxed mb-6">
            "Manage your premium subscriptions, track orders, and deliver value to your customers — all in one place."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#16221B] flex items-center justify-center text-white text-sm font-semibold">
              A
            </div>
            <div>
              <p className="text-[#E8F5EE] text-sm font-medium">Admin Portal</p>
              <p className="text-[#A0B5A8] text-xs">PremiumVault Operations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-[#0F1412] p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 bg-purple-600 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-[#E8F5EE] font-semibold">PremiumVault</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#E8F5EE]">Welcome back</h1>
            <p className="text-[#A0B5A8] text-sm mt-1">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#A0B5A8]" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-[#16221B] border border-[#1F8A5B]/30 text-white placeholder-[#A0B5A8]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F8A5B] focus:border-[#1F8A5B] transition-colors"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-400 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#A0B5A8]" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-[#16221B] border border-[#1F8A5B]/30 text-white placeholder-[#A0B5A8]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F8A5B] focus:border-[#1F8A5B] transition-colors"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-400 text-xs">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#2ECC71] to-[#27AE60] text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-[#A0B5A8]/60 text-xs text-center mt-8">
            Access restricted to authorized administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}
