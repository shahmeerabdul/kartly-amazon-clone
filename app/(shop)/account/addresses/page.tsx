import type { Metadata } from "next";
import Link from "next/link";
import { getAllAddresses, requireAccount } from "@/lib/data/account";
import { AddressBook } from "@/components/account/forms";

export const metadata: Metadata = { title: "Your Addresses", description: "Add, edit, remove or set a default delivery address." };

export default async function AddressesPage() {
  const user = await requireAccount("/account/addresses");
  const addresses = await getAllAddresses(user.id);
  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-6">
      <nav aria-label="Breadcrumb" className="mb-2 text-xs text-text-secondary">
        <Link href="/account" className="hover:underline">Your Account</Link> › <span className="text-[#c45500]">Your Addresses</span>
      </nav>
      <h1 className="mb-4 text-[28px]">Your Addresses</h1>
      <AddressBook addresses={addresses} />
    </div>
  );
}
