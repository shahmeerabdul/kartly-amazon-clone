import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { DemoButton } from "@/components/auth/demo-button";

export const metadata: Metadata = { title: "Sign in", description: "Sign in to your Kartly account." };

const safe = (u: unknown) => (typeof u === "string" && u.startsWith("/") && !u.startsWith("//") ? u : "/");

export default async function SignInPage({ searchParams }: PageProps<"/signin">) {
  const callbackUrl = safe((await searchParams).callbackUrl);
  if (await auth()) redirect(callbackUrl);

  return (
    <AuthShell
      title="Sign in"
      below={
        <div className="space-y-4">
          <div className="relative text-center text-xs text-text-secondary">
            <span className="relative z-10 bg-white px-2">Just looking around?</span>
            <hr className="absolute top-1/2 w-full border-border" />
          </div>
          <DemoButton callbackUrl={callbackUrl} />
          <div className="relative text-center text-xs text-text-secondary">
            <span className="relative z-10 bg-white px-2">New to Kartly?</span>
            <hr className="absolute top-1/2 w-full border-border" />
          </div>
          <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="btn-secondary block w-full">
            Create your Kartly account
          </Link>
        </div>
      }
    >
      <SignInForm callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
