"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
      toast.error("Invalid credentials");
      setIsLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">PremiumVault</h1>
          <p className="text-zinc-500 text-sm mt-1">Admin Panel</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Sign In</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="admin@example.com"
                className="bg-zinc-800 border-zinc-700 mt-1"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-zinc-800 border-zinc-700 mt-1"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full mt-2">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
