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
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white tracking-tight">PremiumVault</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin/dashboard"
              ? pathname === "/admin/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-500/20 text-indigo-400 font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-600">v0.1.0 · development</p>
      </div>
    </aside>
  );
}
