"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard/products", label: "Products", icon: Package },
  { href: "/admin/dashboard/orders", label: "Orders", icon: ShoppingBag },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white/[0.04] border-r border-white/[0.1] flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.1]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center shrink-0">
            <span className="text-[#0d0d18] text-[10px] font-black leading-none tracking-tight">PV</span>
          </div>
          <span className="font-rajdhani text-base font-bold text-white tracking-wide">PremiumVault</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin/dashboard"
              ? pathname === "/admin/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-white/[0.05] text-rose-400 font-semibold border border-white/[0.1]"
                  : "text-gray-400 hover:text-orange-400 hover:bg-white/[0.05]"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>


    </aside>
  );
}
