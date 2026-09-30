import { cookies } from "next/headers";

export async function getZip() {
  return (await cookies()).get("zip")?.value ?? null;
}
