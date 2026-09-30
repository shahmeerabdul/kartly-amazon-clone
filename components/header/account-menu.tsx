"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { demoSignInAction, signOutAction } from "@/lib/actions/auth";

export function AccountMenu({ name }: { name: string | null }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pathname = usePathname();
  const callbackUrl = pathname.startsWith("/signin") || pathname.startsWith("/register") ? "/" : pathname;

  const show = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    timer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) hide();
      }}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <Link
        href={name ? "/orders" : `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        aria-haspopup="true"
        aria-expanded={open}
        className="nav-item flex flex-col px-2 py-1 leading-tight"
      >
        <span className="text-xs">Hello, {name ? name.split(" ")[0] : "sign in"}</span>
        <span className="flex items-center text-sm font-bold">
          <span className="hidden sm:inline">Account &amp; Lists</span>
          <span className="sm:hidden">Account</span>
          <ChevronDown className="h-3 w-3" aria-hidden />
        </span>
      </Link>
      {open && (
        <div className="absolute right-0 top-full z-50 w-64 pt-2">
          <div className="rounded-md border border-border bg-white p-4 text-text shadow-xl">
            {name ? (
              <>
                <p className="mb-3 text-sm">
                  Signed in as <b>{name}</b>
                </p>
                <nav aria-label="Your account" className="space-y-2 text-sm">
                  <Link href="/orders" className="link block">Your Orders</Link>
                  <Link href="/cart" className="link block">Your Cart</Link>
                  <form action={signOutAction}>
                    <button className="link">Sign Out</button>
                  </form>
                </nav>
              </>
            ) : (
              <div className="space-y-2 text-center">
                <Link href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="btn-cart block w-full">
                  Sign in
                </Link>
                <form action={demoSignInAction}>
                  <input type="hidden" name="callbackUrl" value={callbackUrl} />
                  <button className="btn-secondary w-full">Try the demo account</button>
                </form>
                <p className="text-xs">
                  New customer?{" "}
                  <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="link">
                    Start here.
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
