import { cache } from "react";
import { db } from "@/lib/db";

export const productCardSelect = {
  id: true,
  slug: true,
  title: true,
  priceCents: true,
  listPriceCents: true,
  rating: true,
  ratingCount: true,
  thumbnail: true,
  stock: true,
  brand: true,
} as const;

export const getCategories = cache(() =>
  db.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }),
);

export async function getTodaysDeals(take = 12) {
  // Biggest discount first; computed in SQL so the sort is exact.
  const rows = await db.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Product"
    WHERE "listPriceCents" IS NOT NULL AND stock > 0
    ORDER BY 1 - "priceCents"::float / "listPriceCents" DESC
    LIMIT ${take}`;
  const products = await db.product.findMany({ where: { id: { in: rows.map((r) => r.id) } }, select: productCardSelect });
  return rows.map((r) => products.find((p) => p.id === r.id)!).filter(Boolean);
}

export const getTopRated = (categorySlug: string, take = 12) =>
  db.product.findMany({
    where: { category: { slug: categorySlug } },
    orderBy: [{ rating: "desc" }, { ratingCount: "desc" }],
    take,
    select: productCardSelect,
  });

export const getProductsByIds = async (ids: string[]) => {
  if (!ids.length) return [];
  const products = await db.product.findMany({ where: { id: { in: ids } }, select: productCardSelect });
  return ids.map((id) => products.find((p) => p.id === id)).filter((p) => p !== undefined);
};

export type ProductCardData = Awaited<ReturnType<typeof getTopRated>>[number];
