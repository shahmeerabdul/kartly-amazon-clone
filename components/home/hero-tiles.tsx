import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { TileScroller } from "@/components/home/tile-scroller";

// Amazon-style tall promo tiles. Headlines and colors are ours; images come from our own catalog.
const TILES = [
  { productId: "p51", href: "/s?cat=kitchen", title: "Shop kitchen must-haves", bg: "#d5e3e1" },
  { productId: "p8", href: "/s?cat=beauty", title: "Shop all things beauty", bg: "#fcc7b5" },
  { productId: "p174", href: "/s?cat=womens-fashion", title: "Start looking sharp", bg: "#e2dad1" },
  { productId: "p12", href: "/s?cat=home", title: "Refresh every room", bg: "#cddcf2" },
  { productId: "p123", href: "/s?cat=cell-phones", title: "Upgrade your phone", bg: "#e2dcf6" },
  { productId: "p88", href: "/s?cat=mens-fashion", title: "Fresh kicks for every day", bg: "#f6e2c1" },
  { productId: "p78", href: "/s?cat=computers", title: "Laptops for work & play", bg: "#dce6df" },
  { productId: "p140", href: "/s?cat=sports", title: "Game on: sports gear", bg: "#cde8d7" },
];

export async function HeroTiles() {
  const products = await db.product.findMany({
    where: { id: { in: TILES.map((t) => t.productId) } },
    select: { id: true, title: true, images: true, thumbnail: true },
  });
  const tiles = TILES.flatMap((t) => {
    const p = products.find((x) => x.id === t.productId);
    return p ? [{ ...t, image: p.images[0] ?? p.thumbnail, alt: p.title }] : [];
  });
  if (!tiles.length) return null;

  return (
    <section aria-label="Featured departments" className="px-3 pt-3 sm:px-5 sm:pt-4">
      <TileScroller>
        {tiles.map((t, i) => (
          <li
            key={t.href}
            className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-12px)/2)] lg:w-[calc((100%-24px)/3)] xl:w-[calc((100%-36px)/4)]"
          >
            <Link
              href={t.href}
              className="group relative flex aspect-[5/7] max-h-[640px] w-full flex-col overflow-hidden rounded-2xl shadow-[0_1px_3px_rgba(15,17,17,0.15)] transition-shadow hover:shadow-[0_3px_10px_rgba(15,17,17,0.25)]"
              style={{ backgroundColor: t.bg }}
            >
              <h2 className="relative z-10 px-5 pt-5 text-[clamp(28px,2.5vw,46px)] font-extrabold leading-[1.05] tracking-[-0.02em] text-text">
                {t.title}
              </h2>
              <div className="relative mt-2 flex-1">
                <Image
                  src={t.image}
                  alt={t.alt}
                  fill
                  priority={i < 4}
                  sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="scale-[1.08] object-contain object-bottom px-2 pb-3 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.12]"
                />
              </div>
            </Link>
          </li>
        ))}
      </TileScroller>
    </section>
  );
}
