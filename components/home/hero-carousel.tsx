"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  { title: "Fresh picks for every room", sub: "Home & Furniture, from cozy to modern", href: "/s?cat=home", bg: "from-[#0f5e63] via-[#1c8a8a] to-[#9fd8cf]" },
  { title: "Tech you'll actually use", sub: "Phones, laptops and accessories with fast delivery", href: "/s?cat=cell-phones", bg: "from-[#1b1f5e] via-[#3b3fa8] to-[#9aa5f5]" },
  { title: "Today's biggest discounts", sub: "Up to 20% off hand-picked deals", href: "/s?sort=discount", bg: "from-[#7a1034] via-[#c2185b] to-[#f7a1c0]" },
  { title: "Glow up your routine", sub: "Beauty & Personal Care favorites", href: "/s?cat=beauty", bg: "from-[#5b3a00] via-[#b8741a] to-[#f7d08a]" },
];

export function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [paused]);

  const go = (d: number) => setI((n) => (n + d + SLIDES.length) % SLIDES.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative h-[240px] overflow-hidden sm:h-[300px] lg:h-[400px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {SLIDES.map((s, n) => (
        <div
          key={s.title}
          aria-roledescription="slide"
          aria-label={`${n + 1} of ${SLIDES.length}`}
          aria-hidden={n !== i}
          className={`absolute inset-0 bg-gradient-to-r ${s.bg} transition-opacity duration-700 ${n === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          {/* Fades into the page background so the category cards can overlap it. */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-page-bg" />
          <div className="relative mx-auto max-w-[1500px] px-10 pt-8 text-white sm:px-16 lg:pt-14">
            <h2 className="max-w-xl text-2xl font-bold drop-shadow sm:text-4xl">{s.title}</h2>
            <p className="mt-2 max-w-lg text-sm drop-shadow sm:text-lg">{s.sub}</p>
            <Link href={s.href} tabIndex={n === i ? 0 : -1} className="btn-cart mt-4 inline-block text-text">
              Shop now
            </Link>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => go(-1)} aria-label="Previous slide" className="absolute left-0 top-0 flex h-1/2 w-10 items-center justify-center text-white sm:w-16">
        <ChevronLeft className="h-10 w-10" aria-hidden />
      </button>
      <button type="button" onClick={() => go(1)} aria-label="Next slide" className="absolute right-0 top-0 flex h-1/2 w-10 items-center justify-center text-white sm:w-16">
        <ChevronRight className="h-10 w-10" aria-hidden />
      </button>
    </section>
  );
}
