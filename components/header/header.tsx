import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getCategories } from "@/lib/data/catalog";
import { getCartCount } from "@/lib/data/cart";
import { getLocation } from "@/lib/data/prefs";
import { db } from "@/lib/db";
import { SearchBar } from "@/components/header/search-bar";
import { DeliverTo } from "@/components/header/deliver-to";
import { AccountMenu } from "@/components/header/account-menu";
import { AllDrawer } from "@/components/header/all-drawer";
import { Wordmark } from "@/components/header/wordmark";

const QUICK_LINKS = [
  { href: "/s?sort=discount", label: "Today's Deals" },
  { href: "/s?sort=rating", label: "Top Rated" },
  { href: "/s?sort=newest", label: "New Arrivals" },
  { href: "/s?cat=cell-phones", label: "Cell Phones" },
  { href: "/s?cat=computers", label: "Computers" },
  { href: "/s?cat=home", label: "Home" },
  { href: "/s?cat=kitchen", label: "Kitchen" },
  { href: "/s?cat=beauty", label: "Beauty" },
  { href: "/s?cat=grocery", label: "Grocery" },
];

function UsFlag() {
  return (
    <svg viewBox="0 0 19 10" width="21" height="14" aria-hidden className="shrink-0 rounded-[1px]">
      <rect width="19" height="10" fill="#b22234" />
      {[1, 3, 5, 7, 9].map((y) => (
        <rect key={y} y={(y * 10) / 13} width="19" height={10 / 13} fill="#fff" />
      ))}
      <rect y={(11 * 10) / 13} width="19" height={10 / 13} fill="#fff" />
      <rect width="7.6" height={(7 * 10) / 13} fill="#3c3b6e" />
    </svg>
  );
}

function CartIcon({ count }: { count: number }) {
  return (
    <span className="relative block h-[38px] w-[40px]" aria-hidden>
      <svg viewBox="0 0 40 38" width="40" height="38" className="absolute inset-0">
        <path d="M2 7h6l5 18h19l4-13H11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx="15" cy="31" r="2.6" fill="currentColor" />
        <circle cx="29" cy="31" r="2.6" fill="currentColor" />
      </svg>
      <span className="absolute left-[21px] top-[-2px] -translate-x-1/2 text-base font-bold leading-none text-accent">
        {count > 99 ? "99+" : count}
      </span>
    </span>
  );
}

export async function Header() {
  const [session, categories, count, location] = await Promise.all([auth(), getCategories(), getCartCount(), getLocation()]);
  const name = session?.user?.name ?? null;
  const addresses = session?.user?.id
    ? await db.address.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: "desc" }, { id: "asc" }],
        take: 5,
        select: { id: true, fullName: true, line1: true, city: true, state: true, zip: true, isDefault: true },
      })
    : [];
  const depts = categories.map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <header className="text-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[70] focus:bg-white focus:p-2 focus:text-text">
        Skip to main content
      </a>
      <div className="bg-header">
        <div className="flex flex-wrap items-center gap-x-1 px-2 py-1 md:h-[60px] md:flex-nowrap md:py-0">
          <Wordmark />
          <DeliverTo location={location} name={name} addresses={addresses} />
          <div className="order-last w-full pb-2 md:order-none md:mx-2 md:w-auto md:flex-1 md:pb-0">
            <Suspense fallback={<div className="h-10 w-full rounded-md bg-white" />}>
              <SearchBar categories={depts} />
            </Suspense>
          </div>
          <div className="ml-auto flex items-center md:ml-0">
            <span
              className="nav-item hidden h-[50px] items-center gap-1 px-2 text-sm font-bold lg:flex"
              title="Kartly is available in English (US), prices in USD"
            >
              <UsFlag />
              EN
              <span className="sr-only">: English, United States</span>
            </span>
            <AccountMenu name={name} />
            <Link href="/orders" className="nav-item hidden h-[50px] flex-col justify-center px-2 leading-tight md:flex">
              <span className="text-xs">Returns</span>
              <span className="text-sm font-bold">&amp; Orders</span>
            </Link>
            <Link
              href="/cart"
              className="nav-item flex h-[50px] items-end px-2 pb-1.5"
              aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <CartIcon count={count} />
              <span className="hidden pb-0.5 text-sm font-bold sm:inline">Cart</span>
            </Link>
          </div>
        </div>
      </div>
      <DeliverTo location={location} name={name} addresses={addresses} compact />
      <nav aria-label="Shortcuts" className="bg-subnav">
        <div className="flex h-[39px] items-center overflow-x-auto whitespace-nowrap px-2 text-sm">
          <AllDrawer departments={depts} name={name} email={session?.user?.email ?? null} />
          {QUICK_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-item px-2 py-1.5">
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
