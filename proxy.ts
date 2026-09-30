import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

// Optimistic check only: pages re-verify the session before reading user data.
export const proxy = auth((req) => {
  if (!req.auth) {
    const url = new URL("/signin", req.nextUrl);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/checkout/:path*", "/orders/:path*", "/account/:path*", "/wishlist/:path*"],
};
