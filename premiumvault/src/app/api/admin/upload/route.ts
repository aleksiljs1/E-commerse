import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import sharp from "sharp";
import { put } from "@vercel/blob";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_SIZE = 350;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return apiError("Forbidden", 403);
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return apiError("Invalid form data", 400);
  }

  const file = formData.get("file") as File | null;
  if (!file) return apiError("No file provided", 400);

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return apiError("Invalid file type. Allowed: JPEG, PNG, WebP", 400);
  if (file.size > MAX_BYTES) return apiError("File too large (max 5 MB)", 400);

  try {
    const bytes = await file.arrayBuffer();
    const input = Buffer.from(bytes);

    // Resize down to 350×350 max — never upscale, never crop
    const resized = await sharp(input)
      .resize(MAX_SIZE, MAX_SIZE, {
        fit: "inside",       // scale to fit within 350×350, preserve aspect ratio, no crop
        withoutEnlargement: true, // don't upscale images smaller than 350×350
      })
      .toFormat("webp", { quality: 88 })
      .toBuffer();

    const filename = `products/${randomUUID()}.webp`;
    const { url } = await put(filename, resized, {
      access: "public",
      contentType: "image/webp",
    });

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to save file", detail: message }, { status: 500 });
  }
}
