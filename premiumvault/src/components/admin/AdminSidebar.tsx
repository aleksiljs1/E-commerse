"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Ticket, Settings, Mail, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard/products", label: "Products", icon: Package },
  { href: "/admin/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/dashboard/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/dashboard/users", label: "Users", icon: Users },
  { href: "/admin/dashboard/email-logs", label: "Email Logs", icon: Mail },
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white/[0.04] border-r border-white/[0.1] flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.1]">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="PremiumVault" width={28} height={28} className="shrink-0" />
          <span className="font-rajdhani text-base font-bold text-white tracking-wide">PremiumVault</span>
        </Link>
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
