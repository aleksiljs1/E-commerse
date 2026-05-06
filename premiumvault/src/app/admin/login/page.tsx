"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, Package, BarChart3 } from "lucide-react";

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
      <div className="hidden lg:flex flex-col gap-16 w-1/2 bg-[#0e0c1a] p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center shrink-0">
            <span className="text-[#0e0c1a] text-[10px] font-black leading-none tracking-tight">PV</span>
          </div>
          <span className="font-rajdhani text-white font-bold text-lg tracking-wide">PremiumVault</span>
        </div>

        <div className="space-y-5">
          <p className="text-[#52525b] text-xs uppercase tracking-widest font-medium">Admin portal</p>
          <ul className="space-y-4">
            {[
              { Icon: Package, text: "Manage products and pricing" },
              { Icon: BarChart3, text: "Track and fulfil customer orders" },
              { Icon: ShieldCheck, text: "Control access and credentials" },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-[#52525b] shrink-0" />
                <span className="text-[#a1a1aa] text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-[#0e0c1a] p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center shrink-0">
              <span className="text-[#0e0c1a] text-[10px] font-black leading-none tracking-tight">PV</span>
            </div>
            <span className="font-rajdhani text-white font-bold tracking-wide">PremiumVault</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-gray-400 text-sm mt-1">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-400" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-white placeholder-gray-400/50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-400 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-400" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-white placeholder-gray-400/50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-400 text-xs">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2 cursor-pointer"
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

          <p className="text-gray-400/60 text-xs text-center mt-8">
            Access restricted to authorized administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}
