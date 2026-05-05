import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/products";

export async function GET() {
  try {
    const products = await getActiveProducts();
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
