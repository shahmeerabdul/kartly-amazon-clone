import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCategories, productCardSelect } from "@/lib/data/catalog";
import { ProductCard } from "@/components/product/product-card";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { discountPercent, cn } from "@/lib/format";

export const metadata: Metadata = { title: "Today's Deals", description: "Kartly's biggest discounts today, sorted by savings." };

export default async function DealsPage({ searchParams }: PageProps<"/deals">) {
  const raw = (await searchParams).cat;
  const cat = typeof raw === "string" ? raw : undefined;
  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { listPriceCents: { not: null }, stock: { gt: 0 }, ...(cat ? { category: { slug: cat } } : {}) },
      select: productCardSelect,
    }),
    getCategories(),
  ]);
  // Biggest discount first.
  const deals = products
    .map((p) => ({ ...p, off: discountPercent(p.priceCents, p.listPriceCents) }))
    .filter((p) => p.off > 0)
    .sort((a, b) => b.off - a.off || b.ratingCount - a.ratingCount);

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6">
      <h1 className="text-[28px] font-bold">Today&apos;s Deals</h1>
      <p className="mb-4 text-sm text-text-secondary">All deals, sorted by the biggest discount. No sponsored placements.</p>
      <nav aria-label="Deal departments" className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <Link href="/deals" aria-current={!cat ? "true" : undefined} className={cn("shrink-0 rounded-full border px-4 py-1.5 text-sm", !cat ? "border-text bg-text text-white" : "border-border bg-white hover:bg-[#f7fafa]")}>
          All deals
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/deals?cat=${c.slug}`}
            aria-current={cat === c.slug ? "true" : undefined}
            className={cn("shrink-0 rounded-full border px-4 py-1.5 text-sm", cat === c.slug ? "border-text bg-text text-white" : "border-border bg-white hover:bg-[#f7fafa]")}
          >
            {c.name}
          </Link>
        ))}
      </nav>
      {deals.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-lg font-bold">No deals in this department right now.</p>
          <Link href="/deals" className="btn-cart mt-4 inline-block">See all deals</Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {deals.map((p) => (
            <li key={p.id}>
              <ProductCard product={p}>
                <span className="mt-1 text-xs font-bold text-deal">Limited time deal</span>
                <AddToCartButton productId={p.id} className="mt-2 w-full py-1 text-sm" label="Add to cart" />
              </ProductCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
