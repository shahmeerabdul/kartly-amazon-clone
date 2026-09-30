import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { SortSelect } from "@/components/search/sort-select";
import { FilterSheet } from "@/components/search/filter-sheet";
import { Stars } from "@/components/ui/stars";
import { PAGE_SIZE, parseSearchParams, resolveSearchParams, searchHref, searchProducts, type SearchParams } from "@/lib/data/search";
import { getCategories } from "@/lib/data/catalog";
import { cn } from "@/lib/format";

export async function generateMetadata({ searchParams }: PageProps<"/s">): Promise<Metadata> {
  const p = await resolveSearchParams(parseSearchParams(await searchParams));
  const cats = await getCategories();
  const deptCat = cats.find((c) => c.slug === p.cat);
  const dept = deptCat?.subcategories.find((x) => x.slug === p.sub)?.name ?? deptCat?.name;
  const title = p.k ? `Results for "${p.k}"` : dept ?? "All products";
  return { title, description: `Shop ${dept ?? "Kartly"}${p.k ? ` for ${p.k}` : ""}: compare prices, ratings and delivery dates.` };
}

const PRICE_RANGES = [
  { label: "Under $25", max: 25 },
  { label: "$25 to $50", min: 25, max: 50 },
  { label: "$50 to $100", min: 50, max: 100 },
  { label: "$100 to $200", min: 100, max: 200 },
  { label: "$200 & above", min: 200 },
];

function Facet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-1.5 text-sm font-bold">{title}</h3>
      <ul className="space-y-1 text-sm">{children}</ul>
    </section>
  );
}

function Sidebar({ p, data }: { p: SearchParams; data: Awaited<ReturnType<typeof searchProducts>> }) {
  return (
    <div>
      <Facet title="Department">
        {p.cat && (
          <li>
            <Link href={searchHref(p, { cat: undefined })} className="text-text hover:text-link-hover">‹ Any Department</Link>
          </li>
        )}
        {data.departments
          .filter((d) => !p.cat || d.slug === p.cat)
          .map((d) => (
            <li key={d.slug}>
              <Link
                href={searchHref(p, { cat: d.slug })}
                className={cn("hover:text-link-hover", p.cat === d.slug && !p.sub ? "font-bold" : "")}
                aria-current={p.cat === d.slug && !p.sub ? "true" : undefined}
              >
                {d.name} {!p.cat && <span className="text-text-secondary">({d.count})</span>}
              </Link>
              {p.cat === d.slug && data.subcategories.length > 0 && (
                <ul className="mt-1 space-y-1 pl-3">
                  {data.subcategories.map((sc) => (
                    <li key={sc.slug}>
                      <Link
                        href={searchHref(p, { sub: p.sub === sc.slug ? undefined : sc.slug })}
                        className={cn("hover:text-link-hover", p.sub === sc.slug && "font-bold")}
                        aria-current={p.sub === sc.slug ? "true" : undefined}
                      >
                        {sc.name} <span className="text-text-secondary">({sc.count})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
      </Facet>
      <Facet title="Customer Reviews">
        {[4, 3, 2, 1].map((r) => (
          <li key={r}>
            <Link href={searchHref(p, { rating: p.rating === r ? undefined : r })} className={cn("flex items-center gap-1 hover:text-link-hover", p.rating === r && "font-bold")} aria-current={p.rating === r ? "true" : undefined}>
              <Stars rating={r} size={16} /> <span>&amp; Up</span>
            </Link>
          </li>
        ))}
      </Facet>
      <Facet title="Price">
        {PRICE_RANGES.map((r) => {
          const active = p.min === r.min && p.max === r.max;
          return (
            <li key={r.label}>
              <Link href={searchHref(p, active ? { min: undefined, max: undefined } : { min: r.min, max: r.max })} className={cn("hover:text-link-hover", active && "font-bold")} aria-current={active ? "true" : undefined}>
                {r.label}
              </Link>
            </li>
          );
        })}
        <li>
          <form action="/s" className="mt-2 flex items-center gap-1">
            {p.k && <input type="hidden" name="k" value={p.k} />}
            {p.cat && <input type="hidden" name="cat" value={p.cat} />}
            {p.rating && <input type="hidden" name="rating" value={p.rating} />}
            {p.brands.length > 0 && <input type="hidden" name="brand" value={p.brands.join("|")} />}
            {p.stock && <input type="hidden" name="stock" value="1" />}
            {p.sort !== "featured" && <input type="hidden" name="sort" value={p.sort} />}
            <label className="sr-only" htmlFor="min">Minimum price</label>
            <input id="min" name="min" type="number" min={0} placeholder="$ Min" defaultValue={p.min} className="input w-20 py-1 text-sm" />
            <label className="sr-only" htmlFor="max">Maximum price</label>
            <input id="max" name="max" type="number" min={0} placeholder="$ Max" defaultValue={p.max} className="input w-20 py-1 text-sm" />
            <button className="btn-secondary px-3 py-1 text-sm">Go</button>
          </form>
        </li>
      </Facet>
      {data.brands.length > 0 && (
        <Facet title="Brands">
          {data.brands.map((b) => {
            const checked = p.brands.includes(b.name);
            const brands = checked ? p.brands.filter((x) => x !== b.name) : [...p.brands, b.name];
            return (
              <li key={b.name}>
                <Link href={searchHref(p, { brands })} role="checkbox" aria-checked={checked} className="flex items-center gap-2 hover:text-link-hover">
                  <span className={cn("flex h-4 w-4 items-center justify-center rounded-sm border", checked ? "border-link bg-link text-white" : "border-[#888c8c]")}>
                    {checked && <Check className="h-3 w-3" aria-hidden />}
                  </span>
                  {b.name} <span className="text-text-secondary">({b.count})</span>
                </Link>
              </li>
            );
          })}
        </Facet>
      )}
      <Facet title="Availability">
        <li>
          <Link href={searchHref(p, { stock: !p.stock })} role="checkbox" aria-checked={p.stock} className="flex items-center gap-2 hover:text-link-hover">
            <span className={cn("flex h-4 w-4 items-center justify-center rounded-sm border", p.stock ? "border-link bg-link text-white" : "border-[#888c8c]")}>
              {p.stock && <Check className="h-3 w-3" aria-hidden />}
            </span>
            In stock only
          </Link>
        </li>
      </Facet>
    </div>
  );
}

export default async function SearchPage({ searchParams }: PageProps<"/s">) {
  const p = await resolveSearchParams(parseSearchParams(await searchParams));
  const [data, cats] = await Promise.all([searchProducts(p), getCategories()]);
  const deptCat = cats.find((c) => c.slug === p.cat);
  const subName = deptCat?.subcategories.find((x) => x.slug === p.sub)?.name;
  const deptName = deptCat?.name;

  const chips: { label: string; href: string }[] = [];
  if (p.cat && deptName) chips.push({ label: deptName, href: searchHref(p, { cat: undefined }) });
  if (p.sub && subName) chips.push({ label: subName, href: searchHref(p, { sub: undefined }) });
  if (p.rating) chips.push({ label: `${p.rating}★ & up`, href: searchHref(p, { rating: undefined }) });
  if (p.min !== undefined || p.max !== undefined)
    chips.push({
      label: p.min !== undefined && p.max !== undefined ? `$${p.min} – $${p.max}` : p.min !== undefined ? `$${p.min} & above` : `Under $${p.max}`,
      href: searchHref(p, { min: undefined, max: undefined }),
    });
  for (const b of p.brands) chips.push({ label: b, href: searchHref(p, { brands: p.brands.filter((x) => x !== b) }) });
  if (p.stock) chips.push({ label: "In stock", href: searchHref(p, { stock: false }) });

  const from = data.total ? (data.page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(data.page * PAGE_SIZE, data.total);
  const clearAll = searchHref({ ...p, cat: undefined, sub: undefined, min: undefined, max: undefined, rating: undefined, brands: [], stock: false });

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2 shadow-sm">
        <p className="text-sm" aria-live="polite">
          {data.total ? `${from}-${to} of ${data.total} results` : "No results"}
          {p.k && (
            <>
              {" "}for <span className="font-bold text-link-hover">&ldquo;{p.k}&rdquo;</span>
            </>
          )}
          {!p.k && deptName && (
            <>
              {" "}in <b>{subName ? `${deptName} › ${subName}` : deptName}</b>
            </>
          )}
        </p>
        <div className="flex items-center gap-3">
          <SortSelect value={p.sort} />
        </div>
      </div>
      <div className="flex gap-6 px-4 py-4">
        <FilterSheet activeCount={chips.length}>
          <Sidebar p={p} data={data} />
        </FilterSheet>
        <div className="min-w-0 flex-1">
          {chips.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2" aria-label="Active filters">
              {chips.map((c) => (
                <Link key={c.label} href={c.href} className="flex items-center gap-1 rounded-full border border-border bg-[#f0f2f2] px-3 py-1 text-sm hover:bg-[#e3e6e6]" aria-label={`Remove filter ${c.label}`}>
                  {c.label} <X className="h-3.5 w-3.5" aria-hidden />
                </Link>
              ))}
              <Link href={clearAll} className="link text-sm">Clear all</Link>
            </div>
          )}
          <h1 className="mb-3 text-xl font-bold">Results</h1>
          {data.items.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-lg font-bold">No results{p.k && <> for &ldquo;{p.k}&rdquo;</>}.</p>
              <p className="mt-1 text-sm text-text-secondary">Try checking your spelling, using fewer words, or removing filters.</p>
              <div className="mt-4 flex justify-center gap-3">
                {chips.length > 0 && <Link href={clearAll} className="btn-cart">Clear filters</Link>}
                <Link href="/s" className="btn-secondary">Browse all products</Link>
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {data.items.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product}>
                    <AddToCartButton productId={product.id} disabled={product.stock < 1} className="mt-2 w-full py-1 text-sm" label={product.stock < 1 ? "Unavailable" : "Add to cart"} />
                  </ProductCard>
                </li>
              ))}
            </ul>
          )}
          {data.pages > 1 && (
            <nav aria-label="Pagination" className="mt-6 flex justify-center">
              <ul className="flex items-center overflow-hidden rounded-lg border border-border text-sm">
                <li>
                  {data.page > 1 ? (
                    <Link href={searchHref(p, { page: data.page - 1 })} className="block px-4 py-2 hover:bg-[#f7fafa]">‹ Previous</Link>
                  ) : (
                    <span className="block px-4 py-2 text-[#aaa]">‹ Previous</span>
                  )}
                </li>
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                  <li key={n} className="border-l border-border">
                    {n === data.page ? (
                      <span aria-current="page" className="block border border-text px-4 py-2 font-bold">{n}</span>
                    ) : (
                      <Link href={searchHref(p, { page: n })} className="block px-4 py-2 hover:bg-[#f7fafa]">{n}</Link>
                    )}
                  </li>
                ))}
                <li className="border-l border-border">
                  {data.page < data.pages ? (
                    <Link href={searchHref(p, { page: data.page + 1 })} className="block px-4 py-2 hover:bg-[#f7fafa]">Next ›</Link>
                  ) : (
                    <span className="block px-4 py-2 text-[#aaa]">Next ›</span>
                  )}
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
