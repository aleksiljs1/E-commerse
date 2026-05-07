"use client";

import { useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
});

export type ProductFormData = z.infer<typeof productFormSchema>;

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

    if (start === end) return; // nothing selected

    const selected = text.slice(start, end);
    // If already wrapped in **, unwrap it
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

type Props = {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading: boolean;
  mode: "create" | "edit";
};

export function ProductForm({ defaultValues, onSubmit, isLoading, mode }: Props) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      featured: false,
      active: true,
      stock: 0,
      ...defaultValues,
    },
  });

  const logoUrl = watch("logoUrl");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
        <Controller
          name="serviceType"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger className="w-full bg-[#0e0c1a] border-white/[0.1] text-white">
                <SelectValue placeholder="Select service..." />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
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

      {/* Price + Stock */}
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
      </div>

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
  );
}
