"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, Menu, UserCircle2, X } from "lucide-react";
import { demoSignInAction, signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/format";

export type DrawerDept = { slug: string; name: string; subs: { slug: string; name: string }[] };
type Props = { departments: DrawerDept[]; featuredCount: number; name: string | null; email: string | null };

const ROW = "flex w-full items-center justify-between px-9 py-3.5 text-left text-[15px] text-text hover:bg-[#eaeded]";
const HEADING = "px-9 pb-1 pt-3 text-lg font-bold text-text";

export function AllDrawer({ departments, featuredCount, name, email }: Props) {
  const [open, setOpen] = useState(false);
  const [dept, setDept] = useState<DrawerDept | null>(null); // department sub-panel
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const close = () => {
    setOpen(false);
    setDept(null);
  };

  // Close on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setDept(null);
  }

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Esc steps back from a department first, then closes.
      setDept((d) => {
        if (!d) setOpen(false);
        return null;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Move focus into whichever panel is showing.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>(dept ? "[data-panel='sub'] button" : "[data-panel='main'] a, [data-panel='main'] button")?.focus();
    panelRef.current?.scrollTo({ top: 0 });
  }, [dept, open]);

  const featured = departments.slice(0, featuredCount);
  const rest = departments.slice(featuredCount);
  const deptRow = (d: DrawerDept) => (
    <li key={d.slug}>
      <button type="button" className={ROW} onClick={() => setDept(d)} aria-label={`${d.name}: show subcategories`}>
        {d.name}
        <ChevronRight className="h-5 w-5 text-[#8d9096]" aria-hidden />
      </button>
    </li>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="nav-item flex items-center gap-1 py-1.5 pl-1 pr-2 font-bold">
        <Menu className="h-6 w-6" strokeWidth={2.5} aria-hidden />
        All
      </button>
      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Browse departments">
          <div className="absolute inset-0 bg-black/70" onClick={close} />
          <div className="relative flex h-full w-[min(85vw,365px)] flex-col bg-white text-text shadow-xl">
            <div className="flex shrink-0 items-center gap-2 bg-subnav px-9 py-3 text-lg font-bold text-white">
              <UserCircle2 className="h-7 w-7" aria-hidden />
              Hello,{" "}
              {name ? (
                <Link href="/account" onClick={close} className="hover:underline">{name.split(" ")[0]}</Link>
              ) : (
                <Link href={`/signin?callbackUrl=${encodeURIComponent(pathname)}`} onClick={close} className="hover:underline">sign in</Link>
              )}
            </div>

            <div ref={panelRef} className="relative flex-1 overflow-y-auto overflow-x-hidden">
              {/* Main menu */}
              <nav data-panel="main" aria-label="Main menu" aria-hidden={!!dept} className={cn("absolute inset-x-0 top-0 pb-6 transition-transform duration-300", dept ? "-translate-x-full" : "translate-x-0")} inert={!!dept}>
                <h2 className={HEADING}>Trending</h2>
                <ul>
                  <li><Link href="/s?sort=discount" onClick={close} className={ROW}>Today&apos;s Deals</Link></li>
                  <li><Link href="/s?sort=rating" onClick={close} className={ROW}>Top Rated</Link></li>
                  <li><Link href="/s?sort=newest" onClick={close} className={ROW}>New Arrivals</Link></li>
                </ul>
                <hr className="my-2 border-border" />
                <h2 className={HEADING}>Shop by Department</h2>
                <ul>{featured.map(deptRow)}</ul>
                {rest.length > 0 && <hr className="mx-9 my-2 border-border" />}
                <ul>{rest.map(deptRow)}</ul>
                <hr className="my-2 border-border" />
                <h2 className={HEADING}>Your Account</h2>
                {name && email && (
                  <p className="px-9 pb-2 text-xs text-text-secondary">
                    Signed in as <b className="text-text">{name}</b>
                    <span className="block">{email}</span>
                  </p>
                )}
                <ul>
                  {name ? (
                    <>
                      <li><Link href="/account" onClick={close} className={ROW}>Your Account</Link></li>
                      <li><Link href="/orders" onClick={close} className={ROW}>Your Orders</Link></li>
                      <li><Link href="/account/security" onClick={close} className={ROW}>Login &amp; security</Link></li>
                      <li><Link href="/account/addresses" onClick={close} className={ROW}>Your Addresses</Link></li>
                      <li><Link href="/cart" onClick={close} className={ROW}>Your Cart</Link></li>
                      <li>
                        <form action={signOutAction}>
                          <button className={ROW}>Sign Out</button>
                        </form>
                      </li>
                    </>
                  ) : (
                    <>
                      <li><Link href={`/signin?callbackUrl=${encodeURIComponent(pathname)}`} onClick={close} className={ROW}>Sign in</Link></li>
                      <li>
                        <form action={demoSignInAction}>
                          <input type="hidden" name="callbackUrl" value="/account" />
                          <button className={ROW}>Try the demo account</button>
                        </form>
                      </li>
                      <li><Link href="/register" onClick={close} className={ROW}>Create an account</Link></li>
                      <li><Link href="/cart" onClick={close} className={ROW}>Your Cart</Link></li>
                    </>
                  )}
                </ul>
              </nav>

              {/* Department panel */}
              <nav data-panel="sub" aria-label={dept ? dept.name : "Department"} aria-hidden={!dept} className={cn("absolute inset-x-0 top-0 pb-6 transition-transform duration-300", dept ? "translate-x-0" : "translate-x-full")} inert={!dept}>
                {dept && (
                  <>
                    <button type="button" onClick={() => setDept(null)} className="flex w-full items-center gap-3 border-b border-border px-9 py-3.5 text-left text-sm font-bold uppercase tracking-wide text-text hover:bg-[#eaeded]">
                      <ArrowLeft className="h-5 w-5" aria-hidden />
                      Main menu
                    </button>
                    <h2 className={cn(HEADING, "pt-4")}>{dept.name}</h2>
                    <ul>
                      <li><Link href={`/s?cat=${dept.slug}`} onClick={close} className={ROW}>All {dept.name}</Link></li>
                      {dept.subs.map((s) => (
                        <li key={s.slug}>
                          <Link href={`/s?cat=${dept.slug}&sub=${s.slug}`} onClick={close} className={ROW}>{s.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </nav>
            </div>
          </div>
          <button ref={closeRef} type="button" onClick={close} aria-label="Close menu" className="absolute left-[min(85vw,365px)] top-3 ml-2 text-white">
            <X className="h-8 w-8" aria-hidden />
          </button>
        </div>
      )}
    </>
  );
}
