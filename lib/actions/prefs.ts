"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { COUNTRIES } from "@/lib/locations";

export type LocationState = { error?: string; field?: "zip" | "country"; ok?: boolean };

async function save(country: string, city = "", zip = "") {
  const jar = await cookies();
  jar.set("loc", encodeURIComponent([country, city, zip].join("|")), { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  jar.delete("zip"); // replaced by the "loc" cookie
  refresh();
}

// Three ways in, as on Amazon: pick a saved address, enter a US ZIP, or ship outside the US.
export async function setLocation(_prev: LocationState, formData: FormData): Promise<LocationState> {
  const mode = String(formData.get("mode") ?? "");

  if (mode === "address") {
    const session = await auth();
    if (!session?.user?.id) return { error: "Sign in to use a saved address." };
    const address = await db.address.findFirst({ where: { id: String(formData.get("addressId") ?? ""), userId: session.user.id } });
    if (!address) return { error: "That address could not be found." };
    const city = COUNTRIES[0].cities.includes(address.city) ? address.city : "";
    await save("US", city, address.zip.slice(0, 5));
    return { ok: true };
  }

  if (mode === "zip") {
    const zip = String(formData.get("zip") ?? "").trim();
    if (!/^\d{5}$/.test(zip)) return { error: "Please enter a valid US zip code", field: "zip" };
    await save("US", "", zip);
    return { ok: true };
  }

  if (mode === "country") {
    const country = COUNTRIES.find((c) => c.code === formData.get("country"));
    if (!country || country.code === "US") return { error: "Choose a country or region", field: "country" };
    const city = String(formData.get("city") ?? "");
    await save(country.code, country.cities.includes(city) ? city : "");
    return { ok: true };
  }

  return { error: "Something went wrong. Please try again." };
}
