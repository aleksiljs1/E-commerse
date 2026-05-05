"use client";

import { Button } from "@/components/ui/button";

type Props = { value?: string; onChange: (url: string) => void };

const cloudinaryConfigured = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function ImageUpload({ value, onChange }: Props) {
  if (!cloudinaryConfigured) {
    return (
      <div className="space-y-2">
        <input
          type="url"
          placeholder="Paste image URL..."
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
        {value && (
          <img
            src={value}
            alt="Product logo"
            className="w-20 h-20 rounded-xl object-contain bg-zinc-800 p-2"
          />
        )}
      </div>
    );
  }

  const { CldUploadWidget } = require("next-cloudinary");

  return (
    <div className="space-y-2">
      {value && (
        <img
          src={value}
          alt="Product logo"
          className="w-20 h-20 rounded-xl object-contain bg-zinc-800 p-2"
        />
      )}
      <CldUploadWidget
        uploadPreset="premiumvault_products"
        onSuccess={(result: any) => {
          if (
            result.info &&
            typeof result.info === "object" &&
            "secure_url" in result.info
          ) {
            onChange(result.info.secure_url as string);
          }
        }}
      >
        {({ open }: { open: () => void }) => (
          <Button type="button" variant="outline" onClick={() => open()}>
            {value ? "Change Image" : "Upload Logo"}
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
}
