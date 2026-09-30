"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, UserCircle2, X } from "lucide-react";
import { demoSignInAction, signOutAction } from "@/lib/actions/auth";

type Dept = { slug: string; name: string };

const ITEM = "block px-8 py-3 text-sm hover:bg-[#eaeded]";

export function AllDrawer({ departments, name, email }: { departments: Dept[]; name: string | null; email: string | null }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="nav-item flex items-center gap-1 py-1.5 pl-1 pr-2 font-bold">
        <Menu className="h-6 w-6" strokeWidth={2.5} aria-hidden />
        All
      </button>
      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Browse departments">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-[min(85vw,365px)] flex-col overflow-y-auto bg-white text-text shadow-xl">
            <div className="flex items-center gap-2 bg-subnav px-8 py-3 text-lg font-bold text-white">
              <UserCircle2 className="h-7 w-7" aria-hidden />
              Hello, {name ? <Link href="/account" className="hover:underline">{name.split(" ")[0]}</Link> : <Link href="/signin" className="hover:underline">sign in</Link>}
            </div>
            <nav className="py-2">
              <h2 className="px-8 py-2 text-lg font-bold">Shop by Department</h2>
              <ul>
                {departments.map((d) => (
                  <li key={d.slug}>
                    <Link href={`/s?cat=${d.slug}`} className="block px-8 py-3 text-sm hover:bg-[#eaeded]">
                      {d.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <hr className="my-2 border-border" />
              <h2 className="px-8 py-2 text-lg font-bold">Your Account</h2>
              {name && email && (
                <p className="px-8 pb-2 text-xs text-text-secondary">
                  Signed in as <b className="text-text">{name}</b>
                  <span className="block">{email}</span>
                </p>
              )}
              <ul>
                {name ? (
                  <>
                    <li><Link href="/account" className={ITEM}>Your Account</Link></li>
                    <li><Link href="/orders" className={ITEM}>Your Orders</Link></li>
                    <li><Link href="/account/security" className={ITEM}>Login &amp; security</Link></li>
                    <li><Link href="/account/addresses" className={ITEM}>Your Addresses</Link></li>
                    <li><Link href="/cart" className={ITEM}>Your Cart</Link></li>
                    <li>
                      <form action={signOutAction}>
                        <button className={`${ITEM} w-full text-left`}>Sign Out</button>
                      </form>
                    </li>
                  </>
                ) : (
                  <>
                    <li><Link href={`/signin?callbackUrl=${encodeURIComponent(pathname)}`} className={ITEM}>Sign in</Link></li>
                    <li>
                      <form action={demoSignInAction}>
                        <input type="hidden" name="callbackUrl" value="/account" />
                        <button className={`${ITEM} w-full text-left`}>Try the demo account</button>
                      </form>
                    </li>
                    <li><Link href="/register" className={ITEM}>Create an account</Link></li>
                    <li><Link href="/cart" className={ITEM}>Your Cart</Link></li>
                  </>
                )}
              </ul>
            </nav>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute left-[min(85vw,365px)] top-3 ml-2 text-white"
          >
            <X className="h-8 w-8" aria-hidden />
          </button>
        </div>
      )}
    </>
  );
}
