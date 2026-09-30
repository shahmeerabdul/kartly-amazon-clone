"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { SlidersHorizontal, X } from "lucide-react";

// On mobile the filter sidebar opens in a bottom sheet; on desktop it renders inline.
export function FilterSheet({ children, activeCount }: { children: React.ReactNode; activeCount: number }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const params = useSearchParams();

  useEffect(() => {
    ref.current?.close();
  }, [pathname, params]);

  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className="btn-secondary flex items-center gap-2 md:hidden">
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filters{activeCount > 0 && ` (${activeCount})`}
      </button>
      <dialog
        ref={ref}
        aria-label="Filters"
        className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[85vh] w-full max-w-none rounded-t-2xl bg-white p-0 text-text backdrop:bg-black/40"
        onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-white px-4 py-3">
          <h2 className="font-bold">Filters</h2>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Close filters">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </dialog>
      <aside aria-label="Filters" className="hidden w-60 shrink-0 md:block">{children}</aside>
    </>
  );
}
