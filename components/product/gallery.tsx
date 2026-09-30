"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/format";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row md:items-start">
      {images.length > 1 && (
        <ul className="hidden gap-2 md:flex md:flex-col" aria-label="Product images">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === active}
                className={cn("relative block h-12 w-12 overflow-hidden rounded-lg border bg-white", i === active ? "border-link ring-2 ring-link/40" : "border-[#888c8c]")}
              >
                <Image src={src} alt="" fill sizes="48px" className="object-contain p-0.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Desktop: hover to zoom. */}
      <div
        className="relative hidden aspect-square flex-1 cursor-crosshair overflow-hidden bg-white md:block"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <Image
          src={images[active]}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 45vw, 600px"
          className="object-contain transition-transform duration-75"
          style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />
      </div>

      {/* Mobile: swipe between images. */}
      <div className="md:hidden">
        <ul
          className="flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        >
          {images.map((src, i) => (
            <li key={src} className="relative aspect-square w-full shrink-0 snap-center">
              <Image src={src} alt={i === 0 ? title : `${title}, image ${i + 1}`} fill priority={i === 0} sizes="100vw" className="object-contain" />
            </li>
          ))}
        </ul>
        {images.length > 1 && (
          <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
            {images.map((src, i) => (
              <span key={src} className={cn("h-2 w-2 rounded-full", i === active ? "bg-text" : "bg-[#ccc]")} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
