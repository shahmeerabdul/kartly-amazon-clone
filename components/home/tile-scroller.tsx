"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Horizontal snap scroller with Amazon's white edge tabs for previous/next.
export function TileScroller({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const tab =
    "absolute top-1/2 z-20 hidden h-[150px] w-[45px] -translate-y-1/2 items-center justify-center bg-white/95 text-text shadow-[0_2px_6px_rgba(15,17,17,0.25)] hover:bg-white sm:flex";

  return (
    <div className="relative">
      <ul
        ref={ref}
        onScroll={update}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      {!edges.start && (
        <button type="button" onClick={() => scroll(-1)} aria-label="Show previous departments" className={`${tab} left-0 rounded-r-lg`}>
          <ChevronLeft className="h-9 w-9" strokeWidth={1.5} aria-hidden />
        </button>
      )}
      {!edges.end && (
        <button type="button" onClick={() => scroll(1)} aria-label="Show more departments" className={`${tab} right-0 rounded-l-lg`}>
          <ChevronRight className="h-9 w-9" strokeWidth={1.5} aria-hidden />
        </button>
      )}
    </div>
  );
}
