"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { z } from "zod";

const zipSchema = z.string().regex(/^\d{5}$/, "Enter a valid 5-digit US ZIP code");

export type ZipState = { error?: string; ok?: boolean };

export async function setZip(_prev: ZipState, formData: FormData): Promise<ZipState> {
  const parsed = zipSchema.safeParse(String(formData.get("zip") ?? "").trim());
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  (await cookies()).set("zip", parsed.data, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  refresh();
  return { ok: true };
}
