import { cache } from "react";
import { db } from "@/lib/db";
import { productCardSelect } from "@/lib/data/catalog";

export const getProductBySlug = cache((slug: string) =>
  db.product.findUnique({ where: { slug }, include: { category: true } }),
);

export type ReviewSort = "top" | "recent";

export async function getReviews(productId: string, opts: { stars?: number; sort: ReviewSort }) {
  const [histogramRows, reviews] = await Promise.all([
    db.review.groupBy({ by: ["rating"], where: { productId }, _count: { _all: true } }),
    db.review.findMany({
      where: { productId, ...(opts.stars ? { rating: opts.stars } : {}) },
      orderBy: opts.sort === "recent" ? [{ createdAt: "desc" }] : [{ verified: "desc" }, { rating: "desc" }, { createdAt: "desc" }],
      take: 20,
    }),
  ]);
  const total = histogramRows.reduce((s, r) => s + r._count._all, 0);
  const histogram = [5, 4, 3, 2, 1].map((stars) => {
    const count = histogramRows.find((r) => r.rating === stars)?._count._all ?? 0;
    return { stars, count, pct: total ? Math.round((count / total) * 100) : 0 };
  });
  return { histogram, reviews, total };
}

export const getAlsoViewed = (categoryId: string, excludeId: string) =>
  db.product.findMany({
    where: { categoryId, id: { not: excludeId } },
    orderBy: { ratingCount: "desc" },
    take: 12,
    select: productCardSelect,
  });
