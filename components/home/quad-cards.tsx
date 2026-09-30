import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Amazon-style four-photo cards. Photos are CC0 from StockSnap (credits in public/cards/CREDITS.json);
// every link was checked to return results from our catalog.
type Item = { img: string; label: string; href: string; alt: string };
type Card = { title: string; href: string; items: [Item, Item, Item, Item] };

const CARDS: Card[] = [
  {
    title: "New home arrivals under $50",
    href: "/s?max=50&sort=newest",
    items: [
      { img: "home-dining", label: "Kitchen & dining", href: "/s?cat=home-kitchen&sub=kitchen&max=50&sort=newest", alt: "A white dining table and chairs" },
      { img: "home-decor", label: "Décor", href: "/s?cat=home-kitchen&sub=home-decor&max=50&sort=newest", alt: "Flowers and candlesticks on a sideboard" },
      { img: "home-cookware", label: "Cookware", href: "/s?k=pan", alt: "A steaming pot on a stove" },
      { img: "home-tableware", label: "Tableware", href: "/s?k=plate", alt: "A plated salmon dinner" },
    ],
  },
  {
    title: "Discover the latest arrivals",
    href: "/s?sort=newest",
    items: [
      { img: "latest-electronics", label: "Electronics", href: "/s?cat=electronics&sort=newest", alt: "A laptop showing code beside a cup of coffee" },
      { img: "latest-homegoods", label: "Home", href: "/s?cat=home-kitchen&sort=newest", alt: "A red coffee cup and saucer with flowers" },
      { img: "latest-skincare", label: "Beauty", href: "/s?cat=beauty&sort=newest", alt: "A woman applying serum from a dropper" },
      { img: "latest-clothes", label: "Fashion", href: "/s?cat=womens-fashion&sort=newest", alt: "Colorful shirts on wooden hangers" },
    ],
  },
  {
    title: "Accessorize your life",
    href: "/s?cat=womens-fashion",
    items: [
      { img: "accessorize-watches", label: "Watches", href: "/s?k=watch", alt: "A wristwatch on a man's wrist" },
      { img: "accessorize-sunglasses", label: "Sunglasses", href: "/s?cat=womens-fashion&sub=sunglasses", alt: "Yellow sunglasses on a blue and pink background" },
      { img: "accessorize-handbags", label: "Bags", href: "/s?cat=womens-fashion&sub=handbags", alt: "A brown leather bag" },
      { img: "accessorize-earrings", label: "Jewelry", href: "/s?cat=womens-fashion&sub=jewelry", alt: "A silver necklace on a wooden table" },
    ],
  },
  {
    title: "Step into style",
    href: "/s?cat=womens-fashion&sort=newest",
    items: [
      { img: "style-dresses", label: "Women's dresses", href: "/s?cat=womens-fashion&sub=womens-clothing", alt: "A woman in a floral dress holding a flower" },
      { img: "style-heels", label: "Women's shoes", href: "/s?cat=womens-fashion&sub=womens-shoes", alt: "Glitter heeled boots on a stage" },
      { img: "style-shirts", label: "Men's shirts", href: "/s?cat=mens-fashion&sub=mens-clothing", alt: "A man in a denim shirt against a yellow wall" },
      { img: "style-sneakers", label: "Sneakers", href: "/s?k=sneakers", alt: "White sneakers on asphalt" },
    ],
  },
  {
    title: "Level up your beauty routine",
    href: "/s?cat=beauty",
    items: [
      { img: "beautyroutine-fragrance", label: "Fragrance", href: "/s?cat=beauty&sub=fragrance", alt: "A pink perfume bottle" },
      { img: "beautyroutine-skin", label: "Skin care", href: "/s?cat=beauty&sub=skin-care", alt: "A smiling woman applying face cream" },
      { img: "beautyroutine-lashes", label: "Makeup under $20", href: "/s?cat=beauty&max=20", alt: "An eyeshadow palette" },
      { img: "beautyroutine-lipstick", label: "Lips", href: "/s?k=lipstick", alt: "A woman applying lip balm" },
    ],
  },
  {
    title: "Upgrade your tech",
    href: "/s?cat=electronics",
    items: [
      { img: "tech-laptops", label: "Laptops", href: "/s?cat=computers&sub=laptops", alt: "A laptop on a desk" },
      { img: "tech-phones", label: "Smartphones", href: "/s?cat=electronics&sub=cell-phones", alt: "A hand holding a smartphone" },
      { img: "tech-tablets", label: "Tablets", href: "/s?cat=computers&sub=tablets", alt: "A tablet and phone on marble" },
      { img: "tech-audio", label: "Headphones", href: "/s?cat=electronics&sub=headphones", alt: "A woman wearing headphones around her neck" },
    ],
  },
  {
    title: "Curate your space",
    href: "/s?cat=home-kitchen",
    items: [
      { img: "space-furniture", label: "Furniture", href: "/s?cat=home-kitchen&sub=furniture", alt: "A wingback armchair against a stone wall" },
      { img: "space-wallart", label: "Frames & wall art", href: "/s?k=frame", alt: "An empty picture frame against a brick wall" },
      { img: "space-lighting", label: "Lighting", href: "/s?k=lamp", alt: "Glowing pendant light bulbs" },
      { img: "space-plants", label: "Plants & pots", href: "/s?k=plant", alt: "A leafy plant in a patterned pot" },
    ],
  },
  {
    title: "Game day ready",
    href: "/s?cat=sports",
    items: [
      { img: "sports-basketball", label: "Basketball", href: "/s?k=basketball", alt: "A basketball on asphalt" },
      { img: "sports-football", label: "Football", href: "/s?k=football", alt: "An American football on grass" },
      { img: "sports-tennis", label: "Tennis", href: "/s?cat=sports&sub=racket-sports", alt: "A tennis player on a blue court" },
      { img: "sports-baseball", label: "Baseball", href: "/s?k=baseball", alt: "A baseball on a dark background" },
    ],
  },
];

// `row` picks which set of four cards to show, so product rows can sit between them.
export function QuadCards({ row }: { row: 0 | 1 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.slice(row * 4, row * 4 + 4).map((card) => (
        <section key={card.title} aria-label={card.title} className="flex flex-col rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,17,17,0.12)]">
          <Link href={card.href} className="group mb-3 flex items-start justify-between gap-3">
            <h2 className="text-[22px] font-extrabold leading-[1.15] tracking-[-0.01em] text-text group-hover:text-link-hover">{card.title}</h2>
            <ChevronRight className="mt-1 h-6 w-6 shrink-0 text-text" strokeWidth={2.2} aria-hidden />
          </Link>
          <ul className="grid flex-1 grid-cols-2 gap-x-3 gap-y-4">
            {card.items.map((it) => (
              <li key={it.img}>
                <Link href={it.href} className="group block">
                  <span className="relative block aspect-square overflow-hidden rounded-xl bg-[#f0f2f2]">
                    <Image
                      src={`/cards/${it.img}.jpg`}
                      alt={it.alt}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 23vw, 12vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                    />
                  </span>
                  <span className="mt-1.5 block text-sm text-text group-hover:text-link-hover">{it.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
