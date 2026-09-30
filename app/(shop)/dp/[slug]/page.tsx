import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Gallery } from "@/components/product/gallery";
import { BuyBox } from "@/components/product/buy-box";
import { TrackView } from "@/components/product/track-view";
import { ProductRow } from "@/components/product/product-row";
import { Stars } from "@/components/ui/stars";
import { Price, ListPrice } from "@/components/ui/price";
import { getAlsoViewed, getProductBySlug, getReviews, type ReviewSort } from "@/lib/data/product";
import { getProductsByIds } from "@/lib/data/catalog";
import { getZip } from "@/lib/data/prefs";
import { cookies } from "next/headers";
import { deliveryDate, EXPRESS_FEE_CENTS, FREE_SHIPPING_THRESHOLD_CENTS, STANDARD_FEE_CENTS } from "@/lib/delivery";
import { cn, discountPercent, formatCount, formatDate, formatMoney } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/dp/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  return { title: product.title, description: product.description.slice(0, 155) };
}

export default async function ProductPage({ params, searchParams }: PageProps<"/dp/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const starsRaw = Number(sp.stars);
  const stars = Number.isInteger(starsRaw) && starsRaw >= 1 && starsRaw <= 5 ? starsRaw : undefined;
  const sort: ReviewSort = sp.rsort === "recent" ? "recent" : "top";
  const recentIds = ((await cookies()).get("recent")?.value ?? "").split(".").filter((id) => id && id !== product.id);

  const [reviewData, alsoViewed, zip, recent] = await Promise.all([
    getReviews(product.id, { stars, sort }),
    getAlsoViewed(product.categoryId, product.id),
    getZip(),
    getProductsByIds(recentIds.slice(0, 10)),
  ]);

  const off = discountPercent(product.priceCents, product.listPriceCents);
  const specs = Object.entries(product.specs as Record<string, string>);
  const reviewHref = (patch: { stars?: number | null; rsort?: ReviewSort }) => {
    const q = new URLSearchParams();
    const s = patch.stars === null ? undefined : (patch.stars ?? stars);
    const r = patch.rsort ?? sort;
    if (s) q.set("stars", String(s));
    if (r !== "top") q.set("rsort", r);
    const qs = q.toString();
    return `/dp/${product.slug}${qs ? `?${qs}` : ""}#reviews`;
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-3">
      <TrackView productId={product.id} />
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-text-secondary">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/" className="hover:text-link-hover hover:underline">Home</Link></li>
          <li aria-hidden>›</li>
          <li><Link href={`/s?cat=${product.category.slug}`} className="hover:text-link-hover hover:underline">{product.category.name}</Link></li>
          {product.brand && (
            <>
              <li aria-hidden>›</li>
              <li><Link href={`/s?cat=${product.category.slug}&brand=${encodeURIComponent(product.brand)}`} className="hover:text-link-hover hover:underline">{product.brand}</Link></li>
            </>
          )}
        </ol>
      </nav>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_260px]">
        <Gallery images={product.images.length ? product.images : [product.thumbnail]} title={product.title} />

        <div className="min-w-0">
          <h1 className="text-2xl leading-8">{product.title}</h1>
          {product.brand && (
            <Link href={`/s?k=${encodeURIComponent(product.brand)}`} className="link text-sm">
              Visit the {product.brand} Store
            </Link>
          )}
          <a href="#reviews" className="mt-1 flex items-center gap-2 text-sm">
            <span>{product.rating.toFixed(1)}</span>
            <Stars rating={product.rating} />
            <span className="link">{formatCount(product.ratingCount)} ratings</span>
          </a>
          <hr className="my-3 border-border" />
          <div className="flex items-baseline gap-2">
            {off > 0 && <span className="text-[28px] font-light text-deal">-{off}%</span>}
            <Price cents={product.priceCents} size="lg" />
          </div>
          {product.listPriceCents && off > 0 && (
            <p className="mt-1">
              <ListPrice cents={product.listPriceCents} label="List Price:" />
              <span className="ml-2 text-xs text-text-secondary">You save {formatMoney(product.listPriceCents - product.priceCents)}</span>
            </p>
          )}
          <hr className="my-3 border-border" />
          <h2 className="mb-1 font-bold">About this item</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {product.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <BuyBox
            productId={product.id}
            priceCents={product.priceCents}
            stock={product.stock}
            zip={zip}
            standardDate={formatDate(deliveryDate("standard"), { weekday: "long", month: "long", day: "numeric" })}
            expressDate={formatDate(deliveryDate("express"), { weekday: "long", month: "long", day: "numeric" })}
            standardFeeCents={STANDARD_FEE_CENTS}
            expressFeeCents={EXPRESS_FEE_CENTS}
            freeThresholdCents={FREE_SHIPPING_THRESHOLD_CENTS}
          />
        </div>
      </div>

      <hr className="my-6 border-border" />
      <section aria-labelledby="specs">
        <h2 id="specs" className="mb-3 text-xl font-bold">Product information</h2>
        <table className="w-full max-w-2xl text-sm">
          <tbody>
            {specs.map(([k, v]) => (
              <tr key={k} className="border-b border-border">
                <th scope="row" className="w-1/3 bg-[#f3f3f3] px-3 py-2 text-left font-bold">{k}</th>
                <td className="px-3 py-2">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <hr className="my-6 border-border" />
      <ProductRow title="Customers also viewed" products={alsoViewed} />
      {recent.length > 0 && (
        <>
          <hr className="my-6 border-border" />
          <ProductRow title="Your browsing history" products={recent} />
        </>
      )}

      <hr className="my-6 border-border" />
      <section id="reviews" aria-labelledby="reviews-title" className="grid scroll-mt-4 gap-8 md:grid-cols-[300px_1fr]">
        <div>
          <h2 id="reviews-title" className="text-xl font-bold">Customer reviews</h2>
          <div className="mt-2 flex items-center gap-2">
            <Stars rating={product.rating} size={20} />
            <span className="text-lg">{product.rating.toFixed(1)} out of 5</span>
          </div>
          <p className="mt-1 text-sm text-text-secondary">{formatCount(product.ratingCount)} global ratings</p>
          <ul className="mt-4 space-y-2" aria-label="Filter reviews by star rating">
            {reviewData.histogram.map((h) => (
              <li key={h.stars}>
                <Link
                  href={reviewHref({ stars: stars === h.stars ? null : h.stars })}
                  aria-current={stars === h.stars ? "true" : undefined}
                  className={cn("group flex items-center gap-3 text-sm", stars === h.stars && "font-bold")}
                >
                  <span className="w-12 shrink-0 text-link group-hover:text-link-hover">{h.stars} star</span>
                  <span className="h-5 flex-1 overflow-hidden rounded border border-[#e3e6e6] bg-[#f0f2f2]">
                    <span className="block h-full bg-star" style={{ width: `${h.pct}%` }} />
                  </span>
                  <span className="w-10 text-right text-link">{h.pct}%</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-bold">{stars ? `${stars}-star reviews` : "Top reviews"}</span>
            {stars && <Link href={reviewHref({ stars: null })} className="link">Show all reviews</Link>}
            <span className="ml-auto flex gap-2">
              <Link href={reviewHref({ rsort: "top" })} aria-current={sort === "top" ? "true" : undefined} className={cn("rounded-full border px-3 py-1", sort === "top" ? "border-text font-bold" : "border-border")}>Top reviews</Link>
              <Link href={reviewHref({ rsort: "recent" })} aria-current={sort === "recent" ? "true" : undefined} className={cn("rounded-full border px-3 py-1", sort === "recent" ? "border-text font-bold" : "border-border")}>Most recent</Link>
            </span>
          </div>
          {reviewData.reviews.length === 0 ? (
            <p className="text-sm text-text-secondary">No reviews match this filter yet.</p>
          ) : (
            <ul className="space-y-6">
              {reviewData.reviews.map((r) => (
                <li key={r.id}>
                  <p className="text-sm font-bold">{r.authorName}</p>
                  <p className="mt-1 flex items-center gap-2">
                    <Stars rating={r.rating} size={14} />
                    <span className="text-sm font-bold">{r.title}</span>
                  </p>
                  <p className="text-xs text-text-secondary">
                    Reviewed on {formatDate(r.createdAt, { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  {r.verified && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-link-hover">
                      <CheckCircle2 className="h-3 w-3" aria-hidden /> Verified Purchase
                    </p>
                  )}
                  <p className="mt-1 text-sm">{r.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
