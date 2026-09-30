"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { z } from "zod";
import { COUNTRIES } from "@/lib/locations";

export type LocationState = { error?: string; ok?: boolean };

const schema = z
  .object({
    country: z.string(),
    city: z.string().optional().default(""),
    zip: z.string().trim().optional().default(""),
  })
  .superRefine((v, ctx) => {
    const c = COUNTRIES.find((x) => x.code === v.country);
    if (!c) return ctx.addIssue({ code: "custom", path: ["country"], message: "Choose a country from the list" });
    if (v.city && !c.cities.includes(v.city)) ctx.addIssue({ code: "custom", path: ["city"], message: "Choose a city from the list" });
    if (v.zip && (c.code !== "US" || !/^\d{5}$/.test(v.zip))) {
      ctx.addIssue({ code: "custom", path: ["zip"], message: "Enter a valid 5-digit US ZIP code" });
    }
    if (!v.city && !v.zip) ctx.addIssue({ code: "custom", path: ["city"], message: "Choose a city" + (c.code === "US" ? " or enter a ZIP code" : "") });
  });

export async function setLocation(_prev: LocationState, formData: FormData): Promise<LocationState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { country, city, zip } = parsed.data;
  const jar = await cookies();
  jar.set("loc", encodeURIComponent([country, city, zip].join("|")), { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  jar.delete("zip"); // replaced by the "loc" cookie
  refresh();
  return { ok: true };
}
