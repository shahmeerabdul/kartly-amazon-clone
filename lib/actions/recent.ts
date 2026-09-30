"use server";

import { cookies } from "next/headers";
import { z } from "zod";

const RECENT_COOKIE = "recent";

// Last 10 viewed product ids, newest first; works for guests too.
export async function recordView(productId: string) {
  const id = z.string().regex(/^p\d+$/).parse(productId);
  const jar = await cookies();
  const ids = (jar.get(RECENT_COOKIE)?.value ?? "").split(".").filter((x) => x && x !== id);
  jar.set(RECENT_COOKIE, [id, ...ids].slice(0, 10).join("."), {
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
    sameSite: "lax",
    httpOnly: true,
  });
}
