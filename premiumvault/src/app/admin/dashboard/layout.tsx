import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";

async function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await auth();
  if (!session) redirect("/admin/login");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  return (
    <AdminShell user={session.user}>
      {children}
    </AdminShell>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0e0c1a] text-white overflow-hidden">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[#a1a1aa] text-sm">Loading...</div>
        </div>
      }>
        <AdminAuthGuard>{children}</AdminAuthGuard>
      </Suspense>
    </div>
  );
}
