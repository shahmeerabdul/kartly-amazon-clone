import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const GUEST_CART_COOKIE = "guestCartId";

// Finds the current visitor's cart without creating one (reads never write).
export async function findCurrentCartId() {
  const session = await auth();
  if (session?.user?.id) {
    const cart = await db.cart.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    return cart?.id ?? null;
  }
  const guestId = (await cookies()).get(GUEST_CART_COOKIE)?.value;
  if (!guestId) return null;
  const cart = await db.cart.findUnique({ where: { guestId }, select: { id: true } });
  return cart?.id ?? null;
}

export async function getCartCount() {
  const cartId = await findCurrentCartId();
  if (!cartId) return 0;
  const agg = await db.cartItem.aggregate({ where: { cartId, savedForLater: false }, _sum: { quantity: true } });
  return agg._sum.quantity ?? 0;
}

export async function getCart() {
  const cartId = await findCurrentCartId();
  if (!cartId) return { active: [], saved: [] };
  const items = await db.cartItem.findMany({
    where: { cartId },
    orderBy: { id: "asc" },
    include: {
      product: {
        select: { id: true, slug: true, title: true, priceCents: true, listPriceCents: true, thumbnail: true, stock: true, brand: true },
      },
    },
  });
  return { active: items.filter((i) => !i.savedForLater), saved: items.filter((i) => i.savedForLater) };
}

export type CartLine = Awaited<ReturnType<typeof getCart>>["active"][number];
