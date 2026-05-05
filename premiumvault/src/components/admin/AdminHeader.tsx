"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

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
    <header className="h-14 border-b border-[#1e1e2e] bg-[#0d0d18] flex items-center justify-between px-6 shrink-0">
      <h2 className="text-sm font-semibold text-white">{title}</h2>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {initial}
        </div>
        <span className="text-[#a1a1aa] text-sm hidden sm:block">{user?.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-[#a1a1aa] hover:text-white text-sm transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </header>
  );
}
