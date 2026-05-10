"use client";

import { useRef, useCallback, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ImageUpload } from "./ImageUpload";
import { Bold } from "lucide-react";

const productFormSchema = z.object({
  title: z.string().min(2, "Min 2 characters"),
  description: z.string().min(10, "Min 10 characters"),
  price: z.number().positive("Must be positive"),
  stock: z.number().int().min(0),
  serviceType: z.string().min(1, "Required"),
  logoUrl: z.string().optional(),
  requirements: z.string().optional(),
  warrantyTerms: z.string().optional(),
  featured: z.boolean(),
  active: z.boolean(),
  productType: z.enum(["UPGRADE", "PURCHASE", "DROPSHIP"]),
});

type FormSchema = z.infer<typeof productFormSchema>;

export type ProductFormData = FormSchema & {
  accountCredentials?: { username: string; password: string }[];
};

const SERVICE_OPTIONS = [
  { value: "spotify", label: "Spotify" },
  { value: "netflix", label: "Netflix" },
  { value: "youtube", label: "YouTube" },
  { value: "disney", label: "Disney+" },
  { value: "applemusic", label: "Apple Music" },
  { value: "hulu", label: "Hulu" },
  { value: "custom", label: "Custom" },
];

function BoldTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  hint,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const toggleBold = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;

    if (start === end) return;

    const selected = text.slice(start, end);
    const before = text.slice(Math.max(0, start - 2), start);
    const after = text.slice(end, end + 2);
    if (before === "**" && after === "**") {
      const newVal = text.slice(0, start - 2) + selected + text.slice(end + 2);
      onChange(newVal);
      requestAnimationFrame(() => {
        el.selectionStart = start - 2;
        el.selectionEnd = end - 2;
        el.focus();
      });
    } else {
      const newVal = text.slice(0, start) + "**" + selected + "**" + text.slice(end);
      onChange(newVal);
      requestAnimationFrame(() => {
        el.selectionStart = start + 2;
        el.selectionEnd = end + 2;
        el.focus();
      });
    }
  }, [onChange]);

  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <button
          type="button"
          onClick={toggleBold}
          className="cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] hover:border-orange-400 hover:text-orange-400 text-gray-400 text-xs font-medium transition-all"
          title="Bold — select text then click, or type **text**"
        >
          <Bold className="w-3.5 h-3.5" />
          Bold
        </button>
        <span className="text-gray-600 text-[10px] ml-1">select text + click, or type **text**</span>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full min-h-[80px] px-3 py-2 rounded-lg bg-[#0e0c1a] border border-white/[0.1] text-white text-sm placeholder:text-gray-400/50 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y"
      />
      {hint && <p className="text-gray-500 text-xs mt-1">{hint}</p>}
    </div>
  );
}

type StockEntry = { id: string; username: string; isUsed: boolean };
type LocalEntry = { username: string; password: string };

type Props = {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading: boolean;
  mode: "create" | "edit";
  productId?: string;
  initialStock?: StockEntry[];
};

export function ProductForm({
  defaultValues,
  onSubmit,
  isLoading,
  mode,
  productId,
  initialStock = [],
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      featured: false,
      active: true,
      stock: 0,
      productType: "UPGRADE",
      ...defaultValues,
    },
  });

  const logoUrl = watch("logoUrl");
  const productType = watch("productType");

  // Edit mode: server-backed stock entries
  const [serverStock, setServerStock] = useState<StockEntry[]>(initialStock);
  // Create mode: local-only credential list
  const [localCredentials, setLocalCredentials] = useState<LocalEntry[]>([]);

  // Add-account modal state
  const [addOpen, setAddOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [addingEntry, setAddingEntry] = useState(false);

  async function handleAddAccount() {
    if (!newUsername.trim() || !newPassword.trim()) return;

    if (mode === "edit" && productId) {
      setAddingEntry(true);
      try {
        const res = await api.post(`/api/admin/products/${productId}/stock`, {
          username: newUsername.trim(),
          password: newPassword.trim(),
        });
        setServerStock((prev) => [...prev, { id: res.data.id, username: res.data.username, isUsed: false }]);
        toast.success("Account added");
      } catch {
        toast.error("Failed to add account");
        return;
      } finally {
        setAddingEntry(false);
      }
    } else {
      setLocalCredentials((prev) => [
        ...prev,
        { username: newUsername.trim(), password: newPassword.trim() },
      ]);
    }

    setNewUsername("");
    setNewPassword("");
    setAddOpen(false);
  }

  async function handleRemoveServer(stockId: string) {
    if (!productId) return;
    try {
      await api.delete(`/api/admin/products/${productId}/stock?stockId=${stockId}`);
      setServerStock((prev) => prev.filter((s) => s.id !== stockId));
      toast.success("Account removed");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Failed to remove account");
    }
  }

  async function handleFormSubmit(data: FormSchema) {
    if (mode === "create" && data.productType === "PURCHASE") {
      await onSubmit({ ...data, accountCredentials: localCredentials });
    } else {
      await onSubmit(data);
    }
  }

  const stockList = mode === "edit" ? serverStock : localCredentials.map((c, i) => ({
    id: String(i),
    username: c.username,
    isUsed: false,
  }));

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">

        {/* Product Type Toggle */}
        <div>
          <Label className="text-gray-400 mb-2 block">Product Type</Label>
          <Controller
            name="productType"
            control={control}
            render={({ field }) => (
              <div className="flex rounded-xl overflow-hidden border border-white/[0.1] w-fit">
                {(["UPGRADE", "PURCHASE", "DROPSHIP"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => field.onChange(type)}
                    className={`px-5 py-2 text-sm font-semibold transition-colors ${
                      field.value === type
                        ? "bg-orange-500 text-white"
                        : "bg-[#0e0c1a] text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {type === "UPGRADE" ? "Upgrade" : type === "PURCHASE" ? "Purchase" : "Dropship"}
                  </button>
                ))}
              </div>
            )}
          />
          <p className="text-gray-600 text-xs mt-1.5">
            {productType === "UPGRADE"
              ? "Customer submits their own account credentials to be upgraded."
              : productType === "PURCHASE"
              ? "Customer receives pre-loaded account credentials via email."
              : "Customer orders and waits — you source and deliver credentials within 4–5 days."}
          </p>
        </div>

        {/* Title */}
        <div>
          <Label className="text-gray-400 mb-2 block">Title</Label>
          <Input
            className="bg-[#0e0c1a] border-white/[0.1] text-white"
            placeholder="e.g. Spotify Premium — Personal"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Service Type */}
        <div>
          <Label className="text-gray-400 mb-2 block">Service Type</Label>
          <Input
            className="bg-[#0e0c1a] border-white/[0.1] text-white"
            placeholder="e.g. spotify, netflix, or your own"
            list="service-type-options"
            {...register("serviceType")}
          />
          <datalist id="service-type-options">
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </datalist>
          {errors.serviceType && (
            <p className="text-red-400 text-xs mt-1">{errors.serviceType.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label className="text-gray-400 mb-2 block">Description</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <BoldTextarea
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Describe the product... Use **text** for bold"
                rows={4}
              />
            )}
          />
          {errors.description && (
            <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Requirements */}
        <div>
          <Label className="text-gray-400 mb-2 block">What We Require From Customer</Label>
          <Controller
            name="requirements"
            control={control}
            render={({ field }) => (
              <BoldTextarea
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder={"Your account email address\nYour account **password** (submitted via secure encrypted link after payment)\nDo not change your password during the upgrade process"}
                rows={3}
                hint="One requirement per line. Shown as bullet points on the product page."
              />
            )}
          />
        </div>

        {/* Warranty & Terms */}
        <div>
          <Label className="text-gray-400 mb-2 block">Warranty &amp; Terms</Label>
          <Controller
            name="warrantyTerms"
            control={control}
            render={({ field }) => (
              <BoldTextarea
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder={"Upgrade guaranteed within **4–5 business days**\nIf upgrade fails for any reason, **full refund guaranteed**\nYour credentials are encrypted and never stored in plain text\nDo not change your password during the upgrade window"}
                rows={4}
                hint="One term per line. Shown with checkmarks on the product page."
              />
            )}
          />
        </div>

        {/* Price + Stock (stock hidden for PURCHASE — auto-managed via pool) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-400 mb-2 block">Price (£)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              className="bg-[#0e0c1a] border-white/[0.1] text-white"
              placeholder="9.99"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>
            )}
          </div>
          {productType === "UPGRADE" && (
            <div>
              <Label className="text-gray-400 mb-2 block">Stock</Label>
              <Input
                type="number"
                min="0"
                className="bg-[#0e0c1a] border-white/[0.1] text-white"
                placeholder="100"
                {...register("stock", { valueAsNumber: true })}
              />
              {errors.stock && (
                <p className="text-red-400 text-xs mt-1">{errors.stock.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Account Pool (PURCHASE type only) */}
        {productType === "PURCHASE" && (
          <div className="border border-white/[0.1] rounded-xl overflow-hidden">
            <div className="bg-white/[0.02] px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Account Pool</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {stockList.length} account{stockList.length !== 1 ? "s" : ""} —{" "}
                  {mode === "edit"
                    ? serverStock.filter((s) => !s.isUsed).length
                    : stockList.length}{" "}
                  available
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.08] hover:border-orange-400 hover:text-orange-400 text-gray-400 text-xs font-medium transition-all"
              >
                + Add Account
              </button>
            </div>

            {stockList.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-gray-600 italic">
                No accounts added yet. Add credentials to start selling.
              </p>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {stockList.map((entry, i) => (
                  <div key={entry.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-mono truncate">{entry.username}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {"•".repeat(10)}{" "}
                        {entry.isUsed && (
                          <span className="text-green-400/60 ml-1">(delivered)</span>
                        )}
                      </p>
                    </div>
                    {!entry.isUsed && (
                      <button
                        type="button"
                        className="text-xs text-red-400/60 hover:text-red-400 transition-colors shrink-0"
                        onClick={() => {
                          if (mode === "edit") {
                            handleRemoveServer(entry.id);
                          } else {
                            setLocalCredentials((prev) => prev.filter((_, idx) => idx !== i));
                          }
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Logo Upload */}
        <div>
          <Label className="text-gray-400 mb-2 block">Product Logo</Label>
          <ImageUpload
            value={logoUrl}
            onChange={(url) => setValue("logoUrl", url)}
          />
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-white/[0.1] bg-[#0e0c1a] accent-orange-400"
              {...register("featured")}
            />
            <span className="text-sm text-gray-400">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-white/[0.1] bg-[#0e0c1a] accent-orange-400"
              {...register("active")}
            />
            <span className="text-sm text-gray-400">Active</span>
          </label>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
            ? "Create Product"
            : "Save Changes"}
        </Button>
      </form>

      {/* Add Account Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-white/[0.1] rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add Account to Pool</h3>
            <p className="text-xs text-gray-500">
              These credentials will be sent to the customer after purchase.
            </p>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-400">Email / Username</Label>
                <Input
                  className="bg-[#0e0c1a] border-white/[0.1] mt-1 text-sm"
                  placeholder="account@example.com"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Password</Label>
                <Input
                  className="bg-[#0e0c1a] border-white/[0.1] mt-1 text-sm"
                  placeholder="account password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddAccount()}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-white/[0.1]"
                onClick={() => {
                  setAddOpen(false);
                  setNewUsername("");
                  setNewPassword("");
                }}
                disabled={addingEntry}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleAddAccount}
                disabled={!newUsername.trim() || !newPassword.trim() || addingEntry}
              >
                {addingEntry ? "Adding..." : "Add Account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
