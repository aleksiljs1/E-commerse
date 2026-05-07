"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Ticket, Plus, Pencil, Trash2, Power, PowerOff, Copy } from "lucide-react";
import { format } from "date-fns";

type Coupon = {
  id: string;
  code: string;
  discountPct: number;
  maxUses: number;
  timesUsed: number;
  expiresAt: string;
  active: boolean;
  createdAt: string;
  _count: { orders: number };
};

type FormData = {
  code: string;
  discountPct: number;
  maxUses: number;
  expiresAt: string;
  active: boolean;
};

const emptyForm: FormData = { code: "", discountPct: 10, maxUses: 100, expiresAt: "", active: true };

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.data ?? []);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      discountPct: c.discountPct,
      maxUses: c.maxUses,
      expiresAt: c.expiresAt.slice(0, 16),
      active: c.active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) { toast.error("Code is required"); return; }
    if (form.discountPct < 1 || form.discountPct > 100) { toast.error("Discount must be 1-100%"); return; }
    if (form.maxUses < 1) { toast.error("Max uses must be at least 1"); return; }
    if (!form.expiresAt) { toast.error("Expiry date is required"); return; }

    setSaving(true);
    try {
      const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to save"); return; }
      toast.success(editingId ? "Coupon updated" : "Coupon created");
      setShowForm(false);
      fetchCoupons();
    } catch {
      toast.error("Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !c.active }),
      });
      if (!res.ok) { toast.error("Failed to update"); return; }
      toast.success(c.active ? "Coupon deactivated" : "Coupon activated");
      fetchCoupons();
    } catch {
      toast.error("Failed to update");
    }
  };

  const deleteCoupon = async (c: Coupon) => {
    if (!confirm(`Delete coupon "${c.code}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete"); return; }
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const isExpired = (d: string) => new Date(d) < new Date();
  const isMaxed = (c: Coupon) => c.timesUsed >= c.maxUses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Coupon Codes</h1>
        <button
          onClick={openCreate}
          className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-orange-400 to-rose-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> New Coupon
        </button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">
            {editingId ? "Edit Coupon" : "Create Coupon"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Coupon Code</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. 10YEARSOFSERVICE!"
                className="bg-white/[0.04] border border-white/[0.08] focus:border-orange-400 rounded-xl text-white px-4 py-2.5 w-full outline-none transition-colors text-sm uppercase"
              />
              <p className="text-xs text-gray-500">Customers will type this exact code at checkout</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Discount %</label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.discountPct}
                onChange={(e) => setForm({ ...form, discountPct: Number(e.target.value) })}
                className="bg-white/[0.04] border border-white/[0.08] focus:border-orange-400 rounded-xl text-white px-4 py-2.5 w-full outline-none transition-colors text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Max Total Uses</label>
              <input
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
                className="bg-white/[0.04] border border-white/[0.08] focus:border-orange-400 rounded-xl text-white px-4 py-2.5 w-full outline-none transition-colors text-sm"
              />
              <p className="text-xs text-gray-500">Total times this code can be used across all customers</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Expires At</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="bg-white/[0.04] border border-white/[0.08] focus:border-orange-400 rounded-xl text-white px-4 py-2.5 w-full outline-none transition-colors text-sm [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="cursor-pointer bg-gradient-to-r from-orange-400 to-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="cursor-pointer text-gray-400 hover:text-white px-4 py-2.5 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Coupons table */}
      <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-10 text-center">
            <Ticket className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No coupons yet. Create your first one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.1]">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Code</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Discount</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Usage</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Expires</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const expired = isExpired(c.expiresAt);
                  const maxed = isMaxed(c);
                  const statusLabel = !c.active ? "Inactive" : expired ? "Expired" : maxed ? "Used Up" : "Active";
                  const statusColor = !c.active ? "text-gray-500" : expired ? "text-red-400" : maxed ? "text-amber-400" : "text-emerald-400";
                  const statusBg = !c.active ? "bg-gray-500/10" : expired ? "bg-red-400/10" : maxed ? "bg-amber-400/10" : "bg-emerald-400/10";

                  return (
                    <tr key={c.id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white font-semibold tracking-wide">{c.code}</span>
                          <button onClick={() => copyCode(c.code)} className="cursor-pointer text-gray-500 hover:text-orange-400 transition-colors" title="Copy code">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-orange-400 font-semibold">{c.discountPct}%</span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {c.timesUsed} / {c.maxUses}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">
                        {format(new Date(c.expiresAt), "dd MMM yyyy, HH:mm")}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${statusColor} ${statusBg}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(c)}
                            className="cursor-pointer p-2 text-gray-400 hover:text-orange-400 hover:bg-white/[0.05] rounded-lg transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleActive(c)}
                            className={`cursor-pointer p-2 rounded-lg transition-all ${
                              c.active
                                ? "text-gray-400 hover:text-amber-400 hover:bg-amber-400/10"
                                : "text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/10"
                            }`}
                            title={c.active ? "Deactivate" : "Activate"}
                          >
                            {c.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteCoupon(c)}
                            className="cursor-pointer p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
