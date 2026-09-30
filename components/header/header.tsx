import Link from "next/link";
import { Suspense } from "react";
import { ShoppingCart } from "lucide-react";
import { auth } from "@/lib/auth";
import { getCategories } from "@/lib/data/catalog";
import { getCartCount } from "@/lib/data/cart";
import { getZip } from "@/lib/data/prefs";
import { SearchBar } from "@/components/header/search-bar";
import { DeliverTo } from "@/components/header/deliver-to";
import { AccountMenu } from "@/components/header/account-menu";
import { AllDrawer } from "@/components/header/all-drawer";
import { Wordmark } from "@/components/header/wordmark";

const QUICK_LINKS = ["cell-phones", "computers", "home", "kitchen", "beauty"];

export async function Header() {
  const [session, categories, count, zip] = await Promise.all([auth(), getCategories(), getCartCount(), getZip()]);
  const name = session?.user?.name ?? null;
  const depts = categories.map((c) => ({ slug: c.slug, name: c.name }));

  const cart = (
    <Link href="/cart" className="nav-item flex items-end px-2 py-1" aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}>
      <span className="relative">
        <ShoppingCart className="h-8 w-8" aria-hidden />
        <span className="absolute -top-1 left-1/2 -translate-x-[35%] text-base font-bold text-accent" aria-hidden>
          {count > 99 ? "99+" : count}
        </span>
      </span>
      <span className="hidden text-sm font-bold sm:inline">Cart</span>
    </Link>
  );

  return (
    <header className="text-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[70] focus:bg-white focus:p-2 focus:text-text">
        Skip to main content
      </a>
      <div className="bg-header">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-1 px-2 py-1.5 md:flex-nowrap md:gap-2">
          <Wordmark />
          <DeliverTo zip={zip} name={name} />
          <div className="order-last w-full py-1 md:order-none md:flex-1 md:py-0">
            <Suspense fallback={<div className="h-10 w-full rounded-md bg-white" />}>
              <SearchBar categories={depts} />
            </Suspense>
          </div>
          <div className="ml-auto flex items-center md:ml-0">
            <AccountMenu name={name} />
            <Link href="/orders" className="nav-item hidden flex-col px-2 py-1 leading-tight md:flex">
              <span className="text-xs">Returns</span>
              <span className="text-sm font-bold">&amp; Orders</span>
            </Link>
            {cart}
          </div>
        </div>
      </div>
      <DeliverTo zip={zip} name={name} compact />
      <nav aria-label="Departments" className="bg-subnav">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto whitespace-nowrap px-2 py-1 text-sm">
          <AllDrawer departments={depts} name={name} email={session?.user?.email ?? null} />
          {depts
            .filter((d) => QUICK_LINKS.includes(d.slug))
            .map((d) => (
              <Link key={d.slug} href={`/s?cat=${d.slug}`} className="nav-item px-2 py-1">
                {d.name}
              </Link>
            ))}
        </div>
      </nav>
    </header>
  );
}
