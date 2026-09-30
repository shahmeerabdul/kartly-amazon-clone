"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, UserCircle2, X } from "lucide-react";

type Dept = { slug: string; name: string };

export function AllDrawer({ departments, name }: { departments: Dept[]; name: string | null }) {
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
      <button type="button" onClick={() => setOpen(true)} className="nav-item flex items-center gap-1 px-2 py-1 font-bold">
        <Menu className="h-5 w-5" aria-hidden />
        All
      </button>
      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Browse departments">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-[min(85vw,365px)] flex-col overflow-y-auto bg-white text-text shadow-xl">
            <div className="flex items-center gap-2 bg-subnav px-8 py-3 text-lg font-bold text-white">
              <UserCircle2 className="h-7 w-7" aria-hidden />
              Hello, {name ? name.split(" ")[0] : <Link href="/signin" className="hover:underline">sign in</Link>}
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
              <h2 className="px-8 py-2 text-lg font-bold">Help &amp; Settings</h2>
              <ul>
                <li><Link href="/orders" className="block px-8 py-3 text-sm hover:bg-[#eaeded]">Your Orders</Link></li>
                <li><Link href="/cart" className="block px-8 py-3 text-sm hover:bg-[#eaeded]">Your Cart</Link></li>
                {!name && <li><Link href="/signin" className="block px-8 py-3 text-sm hover:bg-[#eaeded]">Sign in</Link></li>}
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
