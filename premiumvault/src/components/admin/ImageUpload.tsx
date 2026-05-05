"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";

type Props = { value?: string; onChange: (url: string) => void };

export function ImageUpload({ value, onChange }: Props) {
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
        onSuccess={(result) => {
          if (
            result.info &&
            typeof result.info === "object" &&
            "secure_url" in result.info
          ) {
            onChange(result.info.secure_url as string);
          }
        }}
      >
        {({ open }) => (
          <Button type="button" variant="outline" onClick={() => open()}>
            {value ? "Change Image" : "Upload Logo"}
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
}
