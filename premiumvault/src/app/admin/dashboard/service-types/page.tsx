"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X, Layers } from "lucide-react";
import { SERVICE_TYPE_PRESETS, contrastColor } from "@/lib/service-type-presets";

type ServiceType = { id: string; slug: string; label: string; color: string };

const emptyForm = { slug: "", label: "", color: "#6366f1" };

export default function ServiceTypesPage() {
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/service-types");
      const data = await res.json();
      setTypes(data.data ?? []);
    } catch { toast.error("Failed to load service types"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (t: ServiceType) => {
    setEditingId(t.id);
    setForm({ slug: t.slug, label: t.label, color: t.color });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.slug.trim() || !form.label.trim()) { toast.error("Slug and label are required"); return; }
    if (!/^#[0-9a-fA-F]{6}$/.test(form.color)) { toast.error("Invalid hex color"); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/service-types/${editingId}` : "/api/admin/service-types";
      const method = editingId ? "PATCH" : "POST";
      const body = editingId ? { label: form.label, color: form.color } : form;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to save"); return; }
      toast.success(editingId ? "Updated" : "Created");
      setShowForm(false);
      fetch_();
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (t: ServiceType) => {
    if (!confirm(`Delete "${t.label}"? Products using this service type will show a fallback icon.`)) return;
    setDeleting(t.id);
    try {
      const res = await fetch(`/api/admin/service-types/${t.id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete"); return; }
      toast.success("Deleted");
      fetch_();
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(null); }
  };

  const applyPreset = (preset: typeof SERVICE_TYPE_PRESETS[0]) => {
    setForm({ slug: preset.slug, label: preset.label, color: preset.color });
  };

  // Presets not yet in DB
  const existingSlugs = new Set(types.map((t) => t.slug));
  const availablePresets = SERVICE_TYPE_PRESETS.filter((p) => !existingSlugs.has(p.slug));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Service Types</h1>
        <button
          onClick={openCreate}
          className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-orange-400 to-rose-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> New Type
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">{editingId ? "Edit Service Type" : "New Service Type"}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {!editingId && (
              <div className="space-y-1.5">
                <label className="text-sm text-gray-400">Slug <span className="text-gray-600">(unique ID, lowercase)</span></label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                  placeholder="e.g. spotify"
                  className="bg-white/[0.04] border border-white/[0.08] focus:border-orange-400 rounded-xl text-white px-4 py-2.5 w-full outline-none transition-colors text-sm font-mono"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Display Name</label>
              <input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Spotify"
                className="bg-white/[0.04] border border-white/[0.08] focus:border-orange-400 rounded-xl text-white px-4 py-2.5 w-full outline-none transition-colors text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Colour</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-white/[0.1] cursor-pointer bg-transparent p-0.5"
                />
                <input
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="#6366f1"
                  maxLength={7}
                  className="bg-white/[0.04] border border-white/[0.08] focus:border-orange-400 rounded-xl text-white px-3 py-2.5 w-32 outline-none transition-colors text-sm font-mono"
                />
                {/* Live preview */}
                <div
                  className="flex-1 h-10 rounded-xl flex items-center justify-center text-sm font-semibold"
                  style={{ background: form.color, color: contrastColor(form.color) }}
                >
                  {form.label || "Preview"}
                </div>
              </div>
            </div>
          </div>

          {/* Preset swatches */}
          {!editingId && availablePresets.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Recommended presets</p>
              <div className="flex flex-wrap gap-2">
                {availablePresets.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.08] hover:border-white/[0.2] transition-all"
                    style={{ background: p.color + "22", color: p.color, borderColor: p.color + "44" }}
                  >
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: p.color }} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-orange-400 to-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            <button onClick={() => setShowForm(false)} className="cursor-pointer flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2.5 text-sm transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading...</div>
        ) : types.length === 0 ? (
          <div className="p-10 text-center">
            <Layers className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No service types yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.1]">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Slug</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Colour</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {types.map((t) => (
                  <tr key={t.id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: t.color + "22", color: t.color, border: `1px solid ${t.color}44` }}
                      >
                        {t.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-400 text-xs">{t.slug}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded" style={{ background: t.color }} />
                        <span className="font-mono text-xs text-gray-400">{t.color}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(t)} className="cursor-pointer p-2 text-gray-400 hover:text-orange-400 hover:bg-white/[0.05] rounded-lg transition-all" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          disabled={deleting === t.id}
                          className="cursor-pointer p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
