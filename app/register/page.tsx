import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create account", description: "Create your Kartly account." };

const safe = (u: unknown) => (typeof u === "string" && u.startsWith("/") && !u.startsWith("//") ? u : "/");

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const callbackUrl = safe((await searchParams).callbackUrl);
  if (await auth()) redirect(callbackUrl);
  return (
    <AuthShell title="Create account">
      <RegisterForm callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
