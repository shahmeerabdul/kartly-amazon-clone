import { db } from "@/lib/db";

export type CheckoutLine = {
  productId: string;
  slug: string;
  title: string;
  thumbnail: string;
  priceCents: number;
  quantity: number;
  stock: number;
};

// Buy Now checks out a single product; otherwise the active (not saved) cart lines.
export async function getCheckoutLines(userId: string, buy?: { productId: string; qty: number }): Promise<CheckoutLine[]> {
  if (buy) {
    const p = await db.product.findUnique({ where: { id: buy.productId } });
    if (!p) return [];
    return [{ productId: p.id, slug: p.slug, title: p.title, thumbnail: p.thumbnail, priceCents: p.priceCents, quantity: buy.qty, stock: p.stock }];
  }
  const cart = await db.cart.findUnique({
    where: { userId },
    include: { items: { where: { savedForLater: false }, orderBy: { id: "asc" }, include: { product: true } } },
  });
  return (cart?.items ?? []).map((i) => ({
    productId: i.productId,
    slug: i.product.slug,
    title: i.product.title,
    thumbnail: i.product.thumbnail,
    priceCents: i.product.priceCents,
    quantity: i.quantity,
    stock: i.product.stock,
  }));
}

export const getAddresses = (userId: string) =>
  db.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { id: "asc" }] });

export function parseBuyParam(buy: unknown, qty: unknown) {
  if (typeof buy !== "string" || !/^p\d+$/.test(buy)) return undefined;
  const n = Math.floor(Number(qty));
  return { productId: buy, qty: Number.isFinite(n) && n >= 1 && n <= 10 ? n : 1 };
}
