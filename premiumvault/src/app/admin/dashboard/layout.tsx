import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";

async function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await auth();
  if (!session) redirect("/admin/login");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  return (
    <>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </>
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
