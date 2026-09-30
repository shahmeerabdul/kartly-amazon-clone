import type { Metadata } from "next";
import Link from "next/link";
import { requireAccount } from "@/lib/data/account";
import { NameForm, PasswordForm } from "@/components/account/forms";

export const metadata: Metadata = { title: "Login & security", description: "Change your Kartly name and password." };

export default async function SecurityPage() {
  const user = await requireAccount("/account/security");
  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-6">
      <nav aria-label="Breadcrumb" className="mb-2 text-xs text-text-secondary">
        <Link href="/account" className="hover:underline">Your Account</Link> › <span className="text-[#c45500]">Login &amp; security</span>
      </nav>
      <h1 className="mb-4 text-[28px]">Login &amp; security</h1>
      <div className="card divide-y divide-border">
        <section aria-labelledby="name-title" className="p-5">
          <h2 id="name-title" className="mb-3 font-bold">Name</h2>
          <NameForm name={user.name} />
        </section>
        <section aria-labelledby="email-title" className="p-5">
          <h2 id="email-title" className="font-bold">Email</h2>
          <p className="text-sm">{user.email}</p>
        </section>
        <section aria-labelledby="pw-title" className="p-5">
          <h2 id="pw-title" className="mb-3 font-bold">Password</h2>
          <PasswordForm />
        </section>
      </div>
      <Link href="/account" className="btn-secondary mt-4 inline-block">Done</Link>
    </div>
  );
}
