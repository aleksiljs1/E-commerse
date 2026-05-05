"use client";

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

const productFormSchema = z.object({
  title: z.string().min(2, "Min 2 characters"),
  description: z.string().min(10, "Min 10 characters"),
  price: z.number().positive("Must be positive"),
  stock: z.number().int().min(0),
  serviceType: z.string().min(1, "Required"),
  logoUrl: z.string().optional(),
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
      {/* Logo Upload */}
      <div>
        <Label className="text-[#A0B5A8] mb-2 block">Product Logo</Label>
        <ImageUpload
          value={logoUrl}
          onChange={(url) => setValue("logoUrl", url)}
        />
      </div>

      {/* Service Type */}
      <div>
        <Label className="text-[#A0B5A8] mb-2 block">Service Type</Label>
        <Controller
          name="serviceType"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full bg-[#0F1412] border-[#1F8A5B]/30 text-white">
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

      {/* Title */}
      <div>
        <Label className="text-[#A0B5A8] mb-2 block">Title</Label>
        <Input
          className="bg-[#0F1412] border-[#1F8A5B]/30 text-white"
          placeholder="e.g. Spotify Premium — Personal"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label className="text-[#A0B5A8] mb-2 block">Description</Label>
        <textarea
          className="w-full min-h-[100px] px-3 py-2 rounded-lg bg-[#0F1412] border border-[#1F8A5B]/30 text-white text-sm placeholder:text-[#A0B5A8]/50 focus:outline-none focus:ring-2 focus:ring-[#1F8A5B] resize-y"
          placeholder="Describe the product..."
          rows={4}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Price + Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[#A0B5A8] mb-2 block">Price (£)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            className="bg-[#0F1412] border-[#1F8A5B]/30 text-white"
            placeholder="9.99"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && (
            <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>
          )}
        </div>
        <div>
          <Label className="text-[#A0B5A8] mb-2 block">Stock</Label>
          <Input
            type="number"
            min="0"
            className="bg-[#0F1412] border-[#1F8A5B]/30 text-white"
            placeholder="100"
            {...register("stock", { valueAsNumber: true })}
          />
          {errors.stock && (
            <p className="text-red-400 text-xs mt-1">{errors.stock.message}</p>
          )}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-[#1F8A5B]/30 bg-[#0F1412] accent-[#2ECC71]"
            {...register("featured")}
          />
          <span className="text-sm text-[#A0B5A8]">Featured</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-[#1F8A5B]/30 bg-[#0F1412] accent-[#2ECC71]"
            {...register("active")}
          />
          <span className="text-sm text-[#A0B5A8]">Active</span>
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
