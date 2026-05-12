import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", nextUrl.origin));
  }

  if (session.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
