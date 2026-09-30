import { db } from "@/lib/db";
import { productCardSelect } from "@/lib/data/catalog";
import { discountPercent } from "@/lib/format";
import type { Prisma } from "@/lib/generated/prisma/client";
import { SORTS, type SortKey } from "@/lib/search-sorts";

export { SORTS, type SortKey };

export const PAGE_SIZE = 24;


export type SearchParams = {
  k?: string;
  cat?: string;
  min?: number;
  max?: number;
  rating?: number;
  brands: string[];
  stock: boolean;
  sort: SortKey;
  page: number;
};

type Raw = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | undefined) => {
  const n = v === undefined || v === "" ? NaN : Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function parseSearchParams(raw: Raw): SearchParams {
  const sort = one(raw.sort);
  const rating = num(one(raw.rating));
  return {
    k: one(raw.k)?.trim().slice(0, 100) || undefined,
    cat: one(raw.cat) || undefined,
    min: num(one(raw.min)),
    max: num(one(raw.max)),
    rating: rating && rating >= 1 && rating <= 4 ? Math.floor(rating) : undefined,
    brands: (one(raw.brand) ?? "").split("|").filter(Boolean).slice(0, 20),
    stock: one(raw.stock) === "1",
    sort: sort && sort in SORTS ? (sort as SortKey) : "featured",
    page: Math.max(1, Math.floor(num(one(raw.page)) ?? 1)),
  };
}

function textWhere(k: string): Prisma.ProductWhereInput {
  // Every word must match somewhere, so "red dress" narrows rather than widens.
  const words = k.split(/\s+/).filter(Boolean).slice(0, 6);
  return {
    AND: words.map((w) => ({
      OR: [
        { title: { contains: w, mode: "insensitive" } },
        { brand: { contains: w, mode: "insensitive" } },
        { description: { contains: w, mode: "insensitive" } },
        { tags: { has: w.toLowerCase() } },
        { category: { name: { contains: w, mode: "insensitive" } } },
      ],
    })),
  };
}

// The catalog is ~200 products, so we fetch the matching set once and compute
// facets, sorting and pagination in memory: exact counts, one round trip.
export async function searchProducts(p: SearchParams) {
  const base: Prisma.ProductWhereInput = p.k ? textWhere(p.k) : {};
  const rows = await db.product.findMany({
    where: base,
    select: { ...productCardSelect, createdAt: true, category: { select: { slug: true, name: true } } },
  });

  const inPrice = (c: number) => (p.min === undefined || c >= p.min * 100) && (p.max === undefined || c <= p.max * 100);
  const passes = (r: (typeof rows)[number], skip?: "cat" | "brand") =>
    (skip === "cat" || !p.cat || r.category.slug === p.cat) &&
    (skip === "brand" || !p.brands.length || (r.brand && p.brands.includes(r.brand))) &&
    inPrice(r.priceCents) &&
    (!p.rating || r.rating >= p.rating) &&
    (!p.stock || r.stock > 0);

  const results = rows.filter((r) => passes(r));

  // Facets ignore their own filter so users can switch or add options.
  const deptCounts = new Map<string, { slug: string; name: string; count: number }>();
  for (const r of rows.filter((r) => passes(r, "cat"))) {
    const d = deptCounts.get(r.category.slug) ?? { ...r.category, count: 0 };
    d.count++;
    deptCounts.set(r.category.slug, d);
  }
  const brandCounts = new Map<string, number>();
  for (const r of rows.filter((r) => passes(r, "brand"))) if (r.brand) brandCounts.set(r.brand, (brandCounts.get(r.brand) ?? 0) + 1);
  const brands = [...brandCounts]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  for (const b of p.brands) if (!brands.some((x) => x.name === b)) brands.push({ name: b, count: brandCounts.get(b) ?? 0 });

  const kLower = p.k?.toLowerCase();
  const score = (r: (typeof rows)[number]) =>
    r.rating * Math.log10(r.ratingCount + 10) + (kLower && r.title.toLowerCase().includes(kLower) ? 10 : 0) + (r.stock > 0 ? 1 : -5);
  const sorters: Record<SortKey, (a: (typeof rows)[number], b: (typeof rows)[number]) => number> = {
    featured: (a, b) => score(b) - score(a),
    "price-asc": (a, b) => a.priceCents - b.priceCents,
    "price-desc": (a, b) => b.priceCents - a.priceCents,
    rating: (a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount,
    newest: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    discount: (a, b) => discountPercent(b.priceCents, b.listPriceCents) - discountPercent(a.priceCents, a.listPriceCents),
  };
  results.sort(sorters[p.sort]);

  const total = results.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(p.page, pages);
  return {
    total,
    page,
    pages,
    items: results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    departments: [...deptCounts.values()].sort((a, b) => a.name.localeCompare(b.name)),
    brands,
  };
}

// Builds a /s URL from current params plus overrides; any filter change resets to page 1.
export function searchHref(p: SearchParams, patch: Partial<SearchParams> = {}) {
  const next = { ...p, page: 1, ...patch };
  const sp = new URLSearchParams();
  if (next.k) sp.set("k", next.k);
  if (next.cat) sp.set("cat", next.cat);
  if (next.min !== undefined) sp.set("min", String(next.min));
  if (next.max !== undefined) sp.set("max", String(next.max));
  if (next.rating) sp.set("rating", String(next.rating));
  if (next.brands.length) sp.set("brand", next.brands.join("|"));
  if (next.stock) sp.set("stock", "1");
  if (next.sort !== "featured") sp.set("sort", next.sort);
  if (next.page > 1) sp.set("page", String(next.page));
  const qs = sp.toString();
  return qs ? `/s?${qs}` : "/s";
}
