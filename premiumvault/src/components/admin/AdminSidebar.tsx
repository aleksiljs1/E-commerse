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
    <aside className="w-64 bg-[#16221B] border-r border-[#1F8A5B]/30 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[#1F8A5B]/30">
        <h1 className="text-xl font-bold text-[#E8F5EE] tracking-tight">PremiumVault</h1>
        <p className="text-xs text-[#A0B5A8] mt-0.5">Admin Panel</p>
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
                  ? "bg-[#1F8A5B]/10 text-[#6ED3A3] font-semibold border border-[#1F8A5B]"
                  : "text-[#A0B5A8] hover:text-[#7DFFB2] hover:bg-[#1F8A5B]/10"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1F8A5B]/30">
        <p className="text-xs text-[#A0B5A8]/60">v0.1.0 · development</p>
      </div>
    </aside>
  );
}
