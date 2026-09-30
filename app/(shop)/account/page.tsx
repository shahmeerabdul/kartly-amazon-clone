import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, MapPin, Package, ShoppingCart, UserCircle2 } from "lucide-react";
import { requireAccount } from "@/lib/data/account";
import { signOutAction } from "@/lib/actions/auth";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Your Account", description: "Manage your Kartly orders, login details and addresses." };

export default async function AccountPage() {
  const user = await requireAccount("/account");
  const addr = user.addresses[0];

  const cards = [
    { href: "/orders", icon: Package, title: "Your Orders", body: `Track, cancel or buy things again. ${user._count.orders} ${user._count.orders === 1 ? "order" : "orders"} so far.` },
    { href: "/account/security", icon: KeyRound, title: "Login & security", body: "Edit your name and change your password." },
    { href: "/account/addresses", icon: MapPin, title: "Your Addresses", body: `Edit, remove or set a default address. ${user._count.addresses} saved.` },
    { href: "/cart", icon: ShoppingCart, title: "Your Cart", body: "Review items in your cart and items saved for later." },
  ];

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-6">
      <h1 className="mb-4 text-[28px]">Your Account</h1>

      <section aria-labelledby="profile-title" className="card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <UserCircle2 className="h-16 w-16 shrink-0 text-text-secondary" aria-hidden />
        <div className="min-w-0 flex-1 text-sm">
          <h2 id="profile-title" className="text-xl font-bold">{user.name}</h2>
          <p className="text-text-secondary">{user.email}</p>
          <p className="mt-1 text-text-secondary">Customer since {formatDate(user.createdAt, { month: "long", year: "numeric" })}</p>
          {addr && (
            <p className="mt-1">
              <span className="text-text-secondary">Default delivery address: </span>
              {addr.line1}, {addr.city}, {addr.state} {addr.zip}
            </p>
          )}
        </div>
        <form action={signOutAction}>
          <button className="btn-secondary">Sign out</button>
        </form>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, icon: Icon, title, body }) => (
          <li key={href}>
            <Link href={href} className="card flex h-full gap-4 p-4 hover:bg-[#f7fafa]">
              <Icon className="h-10 w-10 shrink-0 text-accent" aria-hidden />
              <span>
                <span className="block text-base font-bold">{title}</span>
                <span className="block text-sm text-text-secondary">{body}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
