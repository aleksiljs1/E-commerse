"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Users, Shield, UserRound, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  _count: { orders: number };
};

function UsersContent() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const searchParams = useSearchParams();
  const router = useRouter();

  const activePage = Math.max(1, Number(searchParams.get("page")) || 1);
  const activeSearch = searchParams.get("search") ?? "";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [inputValue, setInputValue] = useState(activeSearch);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function fetchUsers(search = activeSearch, page = activePage) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", "50");

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  function setPage(page: number) {
    const params = new URLSearchParams();
    if (activeSearch) params.set("search", activeSearch);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.push(`/admin/dashboard/users${qs ? `?${qs}` : ""}`);
  }

  function handleSearchChange(value: string) {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (value) params.set("search", value);
      // reset to page 1 when search changes
      const qs = params.toString();
      router.push(`/admin/dashboard/users${qs ? `?${qs}` : ""}`);
    }, 300);
  }

  useEffect(() => {
    setInputValue(activeSearch);
  }, [activeSearch]);

  useEffect(() => {
    fetchUsers(activeSearch, activePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSearch, activePage]);

  const changeRole = async (user: User, newRole: "USER" | "ADMIN") => {
    if (user.id === currentUserId) {
      toast.error("You cannot change your own role");
      return;
    }
    const label = newRole === "ADMIN" ? "promote to Admin" : "demote to User";
    if (!confirm(`${label} ${user.email}?`)) return;

    setChanging(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to update role"); return; }
      toast.success(`${user.email} is now ${newRole}`);
      fetchUsers();
    } catch {
      toast.error("Failed to update role");
    } finally {
      setChanging(null);
    }
  };

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const userCount = users.filter((u) => u.role === "USER").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
          <Users className="w-5 h-5 text-gray-400 mb-2" />
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total Users</p>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
          <Shield className="w-5 h-5 text-orange-400 mb-2" />
          <p className="text-2xl font-bold text-white">{adminCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Admins</p>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
          <UserRound className="w-5 h-5 text-indigo-400 mb-2" />
          <p className="text-2xl font-bold text-white">{userCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Regular Users</p>
        </div>
      </div>

      {/* Search */}
      <input
        value={inputValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search by email or name..."
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl text-white px-4 py-2.5 text-sm placeholder-gray-500 outline-none focus:border-orange-400/50 transition-colors"
      />

      {/* Table */}
      <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{activeSearch ? "No users match your search." : "No users yet."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.1]">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Orders</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isYou = u.id === currentUserId;
                  const isAdmin = u.role === "ADMIN";
                  return (
                    <tr key={u.id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(u.name ?? u.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {u.name ?? <span className="text-gray-400 italic">No name</span>}
                              {isYou && <span className="ml-2 text-[10px] text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded-md">You</span>}
                            </p>
                            <p className="text-gray-500 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          isAdmin
                            ? "text-orange-400 bg-orange-400/10"
                            : "text-indigo-400 bg-indigo-400/10"
                        }`}>
                          {isAdmin ? <Shield className="w-3 h-3" /> : <UserRound className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {u._count.orders}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {format(new Date(u.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isYou && (
                          <button
                            onClick={() => changeRole(u, isAdmin ? "USER" : "ADMIN")}
                            disabled={changing === u.id}
                            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                              isAdmin
                                ? "text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                                : "text-gray-400 hover:text-orange-400 hover:bg-orange-400/10"
                            }`}
                          >
                            {changing === u.id
                              ? "Saving..."
                              : isAdmin
                              ? "Demote to User"
                              : "Promote to Admin"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-400">
            {total} total — Page {activePage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(activePage - 1)}
              disabled={activePage <= 1}
              className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(activePage + 1)}
              disabled={activePage >= totalPages}
              className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
      <UsersContent />
    </Suspense>
  );
}
