"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, RefreshCw, RotateCcw, AlertTriangle, CheckCircle2, Clock, Ban } from "lucide-react";
import { format } from "date-fns";

type EmailLog = {
  id: string;
  to: string;
  subject: string;
  status: string;
  error: string | null;
  attempts: number;
  orderId: string | null;
  nextRetry: string | null;
  sentAt: string | null;
  createdAt: string;
  order: { orderNumber: string } | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  SENT:      { label: "Sent",      color: "text-emerald-400", bg: "bg-emerald-400/10", Icon: CheckCircle2 },
  PENDING:   { label: "Pending",   color: "text-blue-400",    bg: "bg-blue-400/10",    Icon: Clock },
  FAILED:    { label: "Failed",    color: "text-amber-400",   bg: "bg-amber-400/10",   Icon: AlertTriangle },
  EXHAUSTED: { label: "Exhausted", color: "text-red-400",     bg: "bg-red-400/10",     Icon: Ban },
};

const FILTERS = ["ALL", "FAILED", "EXHAUSTED", "SENT", "PENDING"] as const;

function EmailLogsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeFilter = searchParams.get("status") ?? "ALL";
  const activePage = Math.max(1, parseInt(searchParams.get("page") ?? "1"));

  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  function buildUrl(overrides: { status?: string; page?: number | null } = {}) {
    const params = new URLSearchParams();
    const status = "status" in overrides ? overrides.status : activeFilter;
    const page = "page" in overrides ? overrides.page : activePage;

    if (status && status !== "ALL") params.set("status", status);
    if (page && Number(page) > 1) params.set("page", String(page));

    const qs = params.toString();
    return `/admin/dashboard/email-logs${qs ? `?${qs}` : ""}`;
  }

  function setFilter(f: string) {
    router.push(buildUrl({ status: f, page: null }));
  }

  function setPage(page: number) {
    router.push(buildUrl({ page }));
  }

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== "ALL") params.set("status", activeFilter);
      params.set("page", String(activePage));
      params.set("limit", "50");

      const res = await fetch(`/api/admin/email-logs?${params.toString()}`);
      const data = await res.json();
      setLogs(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error("Failed to load email logs");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, activePage]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const retry = async (log: EmailLog) => {
    setRetrying(log.id);
    try {
      const res = await fetch(`/api/admin/email-logs/${log.id}/retry`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Retry failed"); return; }
      toast.success(`Retried — email queued to ${log.to}`);
      fetchLogs();
    } catch {
      toast.error("Retry failed");
    } finally {
      setRetrying(null);
    }
  };

  const counts = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Email Logs</h1>
        <button
          onClick={fetchLogs}
          className="cursor-pointer flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 rounded-xl hover:bg-white/[0.05] transition-all text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["SENT", "FAILED", "EXHAUSTED", "PENDING"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setFilter(activeFilter === s ? "ALL" : s)}
              className={`cursor-pointer p-4 rounded-xl border transition-all text-left ${
                activeFilter === s
                  ? `border-white/[0.2] bg-white/[0.06]`
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <cfg.Icon className={`w-5 h-5 mb-2 ${cfg.color}`} />
              <p className="text-2xl font-bold text-white">{counts[s] ?? 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFilter === f
                ? "bg-white/[0.08] text-white"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center">
            <Mail className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No email logs{activeFilter !== "ALL" ? ` with status ${activeFilter}` : ""}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.1]">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">To</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Subject</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Attempts</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Order</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const cfg = STATUS_CONFIG[log.status] ?? STATUS_CONFIG.PENDING;
                  const isExp = expanded === log.id;
                  return (
                    <>
                      <tr
                        key={log.id}
                        className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => setExpanded(isExp ? null : log.id)}
                      >
                        <td className="py-3 px-4 text-white text-xs font-mono">{log.to}</td>
                        <td className="py-3 px-4 text-gray-300 text-xs max-w-[200px] truncate">{log.subject}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                            <cfg.Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-xs">{log.attempts}</td>
                        <td className="py-3 px-4 text-gray-400 text-xs font-mono">
                          {log.order?.orderNumber ?? "—"}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {format(new Date(log.createdAt), "dd MMM, HH:mm")}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {(log.status === "FAILED" || log.status === "EXHAUSTED") && (
                            <button
                              onClick={(e) => { e.stopPropagation(); retry(log); }}
                              disabled={retrying === log.id}
                              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-400 bg-indigo-400/10 hover:bg-indigo-400/20 transition-all disabled:opacity-50"
                            >
                              <RotateCcw className={`w-3 h-3 ${retrying === log.id ? "animate-spin" : ""}`} />
                              Retry
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExp && (
                        <tr key={`${log.id}-detail`} className="border-b border-white/[0.05] bg-white/[0.01]">
                          <td colSpan={7} className="px-4 py-3 space-y-2">
                            {log.error && (
                              <div className="bg-red-400/5 border border-red-400/20 rounded-lg px-3 py-2">
                                <p className="text-xs text-red-400 font-semibold mb-0.5">Error</p>
                                <p className="text-xs text-red-300/70 font-mono">{log.error}</p>
                              </div>
                            )}
                            {log.nextRetry && log.status === "FAILED" && (
                              <p className="text-xs text-gray-500">
                                Next retry: {format(new Date(log.nextRetry), "dd MMM yyyy, HH:mm:ss")}
                              </p>
                            )}
                            {log.sentAt && (
                              <p className="text-xs text-gray-500">
                                Delivered: {format(new Date(log.sentAt), "dd MMM yyyy, HH:mm:ss")}
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
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

export default function EmailLogsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
      <EmailLogsContent />
    </Suspense>
  );
}
