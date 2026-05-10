"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";

function getPageTitle(pathname: string): string {
  if (pathname === "/admin/dashboard") return "Dashboard";
  if (pathname.startsWith("/admin/dashboard/products/new")) return "New Product";
  if (pathname.match(/\/admin\/dashboard\/products\/.+\/edit/)) return "Edit Product";
  if (pathname.startsWith("/admin/dashboard/products")) return "Products";
  if (pathname.match(/\/admin\/dashboard\/orders\/.+/)) return "Order Detail";
  if (pathname.startsWith("/admin/dashboard/orders")) return "Orders";
  if (pathname.startsWith("/admin/dashboard/users")) return "Users";
  if (pathname.startsWith("/admin/dashboard/email-logs")) return "Email Logs";
  if (pathname.startsWith("/admin/dashboard/coupons")) return "Coupons";
  if (pathname.startsWith("/admin/dashboard/settings")) return "Settings";
  return "Admin";
}

type Props = {
  user?: {
    name?: string | null;
    email?: string | null;
  };
  onMenuToggle?: () => void;
};

export function AdminHeader({ user, onMenuToggle }: Props) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const initial = (user?.name ?? user?.email ?? "A")[0].toUpperCase();

  return (
    <header className="h-14 bg-white/[0.04] border-b border-white/[0.1] flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden cursor-pointer text-gray-400 hover:text-white p-1"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-rose-400 flex items-center justify-center text-white text-sm font-bold">
            {initial}
          </div>
          <span className="text-sm text-gray-400 hidden md:block">{user?.email}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-gray-400 hover:text-orange-400 text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
