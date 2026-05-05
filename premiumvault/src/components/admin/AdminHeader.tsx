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
    <header className="h-14 bg-[#16221B] border-b border-[#1F8A5B]/30 flex items-center justify-between px-6 shrink-0">
      <h2 className="text-sm font-semibold text-[#E8F5EE]">{title}</h2>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#1F8A5B] to-[#6ED3A3] flex items-center justify-center text-white text-sm font-bold">
            {initial}
          </div>
          <span className="text-sm text-[#A0B5A8] hidden sm:block">{user?.email}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-[#A0B5A8] hover:text-[#7DFFB2] text-sm transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </header>
  );
}
