import Image from "next/image";
import Link from "next/link";
import { TileScroller } from "@/components/home/tile-scroller";

// Amazon-style tall promo tiles. Photos are CC0 lifestyle shots from StockSnap
// (credits in public/hero/CREDITS.json), stored locally and optimized by next/image.
const TILES: { img: string; href: string; title: string; alt: string; dark?: boolean }[] = [
  { img: "kitchen", href: "/s?cat=kitchen", title: "Shop kitchen must-haves", alt: "A steel kettle on a gas stove" },
  { img: "beauty", href: "/s?cat=beauty", title: "Shop all things beauty", alt: "Makeup brushes, pink roses and a mirror on a vanity" },
  { img: "fashion", href: "/s?cat=womens-fashion", title: "Start looking sharp", alt: "A rack of shirts and jackets in a boutique" },
  { img: "home", href: "/s?cat=home", title: "Refresh every room", alt: "White sofas with plaid cushions in a bright living room" },
  { img: "phone", href: "/s?cat=cell-phones", title: "Upgrade your phone", alt: "A smiling woman holding a smartphone" },
  { img: "shoes", dark: true, href: "/s?cat=mens-fashion", title: "Fresh kicks for every day", alt: "Navy canvas sneakers with white laces" },
  { img: "laptop", dark: true, href: "/s?cat=computers", title: "Laptops for work & play", alt: "A laptop and a cup of coffee on a wooden desk" },
  { img: "sports", dark: true, href: "/s?cat=sports", title: "Game on: sports gear", alt: "A tennis ball and racket on a clay court" },
];

export function HeroTiles() {
  return (
    <section aria-label="Featured departments" className="px-3 pt-3 sm:px-5 sm:pt-4">
      <TileScroller>
        {TILES.map((t, i) => (
          <li
            key={t.href}
            className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-12px)/2)] lg:w-[calc((100%-24px)/3)] xl:w-[calc((100%-36px)/4)]"
          >
            <Link
              href={t.href}
              className="group relative block aspect-[5/7] max-h-[640px] w-full overflow-hidden rounded-2xl bg-[#e3e6e6] shadow-[0_1px_3px_rgba(15,17,17,0.15)] transition-shadow hover:shadow-[0_3px_10px_rgba(15,17,17,0.25)]"
            >
              <Image
                src={`/hero/${t.img}.jpg`}
                alt={t.alt}
                fill
                priority={i < 4}
                sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              {/* A light or dark wash behind the headline keeps it readable on any photo. */}
              <div
                className={`absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b to-transparent ${t.dark ? "from-black/70 via-black/35" : "from-white/90 via-white/55"}`}
                aria-hidden
              />
              <h2 className={`relative z-10 px-5 pt-5 text-[clamp(28px,2.5vw,46px)] font-extrabold leading-[1.05] tracking-[-0.02em] ${t.dark ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" : "text-text"}`}>
                {t.title}
              </h2>
            </Link>
          </li>
        ))}
      </TileScroller>
    </section>
  );
}
