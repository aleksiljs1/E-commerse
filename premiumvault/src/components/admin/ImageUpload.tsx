"use client";

import { useCallback, useRef, useState } from "react";

type Props = { value?: string; onChange: (url: string) => void };

export function ImageUpload({ value, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        onChange(json.url);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) upload(files[0]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition-colors",
          dragging
            ? "border-indigo-400 bg-indigo-500/10"
            : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800/60",
          uploading ? "pointer-events-none opacity-60" : "",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Preview */}
        {value && !uploading ? (
          <img
            src={value}
            alt="Product image"
            className="w-24 h-24 rounded-xl object-contain bg-zinc-800 p-2 shadow-lg"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
            {uploading ? (
              <svg
                className="w-6 h-6 text-indigo-400 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-zinc-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            )}
          </div>
        )}

        <div className="text-center">
          {uploading ? (
            <p className="text-sm text-indigo-400 font-medium">Uploading…</p>
          ) : value ? (
            <>
              <p className="text-sm font-medium text-zinc-200">Click or drag to replace</p>
              <p className="text-xs text-zinc-500 mt-0.5">JPG, PNG, WebP, GIF, SVG · max 5 MB</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-zinc-200">
                Drag &amp; drop or{" "}
                <span className="text-indigo-400 underline underline-offset-2">browse</span>
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">JPG, PNG, WebP, GIF, SVG · max 5 MB</p>
            </>
          )}
        </div>
      </div>

      {/* Remove button */}
      {value && !uploading && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
        >
          Remove image
        </button>
      )}

      {/* Error */}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
