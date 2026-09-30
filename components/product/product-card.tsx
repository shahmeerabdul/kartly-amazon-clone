import Image from "next/image";
import Link from "next/link";
import { Stars } from "@/components/ui/stars";
import { Price, ListPrice } from "@/components/ui/price";
import { discountPercent, formatCount, formatDate } from "@/lib/format";
import { deliveryDate, FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/delivery";
import type { ProductCardData } from "@/lib/data/catalog";

export function ProductCard({ product, children }: { product: ProductCardData; children?: React.ReactNode }) {
  const off = discountPercent(product.priceCents, product.listPriceCents);
  const free = product.priceCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-white p-3">
      <Link href={`/dp/${product.slug}`} className="group flex flex-1 flex-col">
        <div className="relative mb-2 aspect-square w-full overflow-hidden rounded bg-[#f7f7f7]">
          <Image src={product.thumbnail} alt={product.title} fill sizes="(max-width: 640px) 50vw, 240px" className="object-contain p-2 mix-blend-multiply" />
        </div>
        <h3 className="line-clamp-2 text-[15px] leading-snug text-text group-hover:text-link-hover">{product.title}</h3>
      </Link>
      <div className="mt-1 flex items-center gap-1 text-sm">
        <Stars rating={product.rating} size={14} />
        <span className="text-link">{formatCount(product.ratingCount)}</span>
      </div>
      {off > 0 && (
        <span className="mt-1 w-fit rounded-sm bg-deal px-1.5 py-0.5 text-xs font-bold text-white">{off}% off</span>
      )}
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <Price cents={product.priceCents} size="sm" />
        {product.listPriceCents && off > 0 && <ListPrice cents={product.listPriceCents} />}
      </div>
      <p className="mt-1 text-xs text-text">
        {product.stock > 0 ? (
          <>
            {free ? "FREE delivery " : "Delivery "}
            <b>{formatDate(deliveryDate("standard"))}</b>
          </>
        ) : (
          <span className="text-deal">Currently unavailable</span>
        )}
      </p>
      {children}
    </article>
  );
}
