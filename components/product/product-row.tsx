import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "@/lib/data/catalog";
import { Price } from "@/components/ui/price";
import { discountPercent } from "@/lib/format";

export function ProductRow({ title, products, href, linkLabel = "See more" }: {
  title: string;
  products: ProductCardData[];
  href?: string;
  linkLabel?: string;
}) {
  if (!products.length) return null;
  return (
    <section className="bg-white p-5" aria-label={title}>
      <div className="mb-3 flex items-baseline gap-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {href && <Link href={href} className="text-sm text-link hover:text-link-hover hover:underline">{linkLabel}</Link>}
      </div>
      <ul className="flex snap-x gap-4 overflow-x-auto pb-2">
        {products.map((p) => {
          const off = discountPercent(p.priceCents, p.listPriceCents);
          return (
            <li key={p.id} className="w-40 shrink-0 snap-start sm:w-48">
              <Link href={`/dp/${p.slug}`} className="group block">
                <div className="relative aspect-square w-full overflow-hidden bg-[#f7f7f7]">
                  <Image src={p.thumbnail} alt={p.title} fill sizes="200px" className="object-contain p-2 mix-blend-multiply" />
                </div>
                {off > 0 && (
                  <span className="mt-2 inline-block rounded-sm bg-deal px-1.5 py-0.5 text-xs font-bold text-white">{off}% off</span>
                )}
                <div className="mt-1"><Price cents={p.priceCents} size="sm" /></div>
                <p className="line-clamp-2 text-sm text-text group-hover:text-link-hover">{p.title}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
