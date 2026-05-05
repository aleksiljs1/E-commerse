"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

function getPageTitle(pathname: string): string {
  if (pathname === "/admin/dashboard") return "Dashboard";
  if (pathname.startsWith("/admin/dashboard/products/new")) return "New Product";
  if (pathname.match(/\/admin\/dashboard\/products\/.+\/edit/)) return "Edit Product";
  if (pathname.startsWith("/admin/dashboard/products")) return "Products";
  if (pathname.match(/\/admin\/dashboard\/orders\/.+/)) return "Order Detail";
  if (pathname.startsWith("/admin/dashboard/orders")) return "Orders";
  return "Admin";
}

type Props = {
  user?: {
    name?: string | null;
    email?: string | null;
  };
};

export function AdminHeader({ user }: Props) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const initial = (user?.name ?? user?.email ?? "A")[0].toUpperCase();

  return (
    <header className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0">
      <h2 className="text-sm font-semibold text-white">{title}</h2>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
            {initial}
          </div>
          <span className="text-sm text-zinc-400 hidden sm:block">{user?.email}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
}
