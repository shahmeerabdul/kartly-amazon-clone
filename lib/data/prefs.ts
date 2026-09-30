import { cookies } from "next/headers";
import { parseLocationCookie, type DeliveryLocation } from "@/lib/locations";

export async function getLocation(): Promise<DeliveryLocation> {
  const jar = await cookies();
  const loc = parseLocationCookie(jar.get("loc")?.value);
  // Older visitors may still have the ZIP-only cookie.
  const legacyZip = jar.get("zip")?.value;
  if (!jar.get("loc") && legacyZip && /^\d{5}$/.test(legacyZip)) return { country: "US", city: null, zip: legacyZip };
  return loc;
}
