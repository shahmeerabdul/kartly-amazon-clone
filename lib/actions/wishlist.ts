"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { addToCart } from "@/lib/actions/cart";

const productId = z.string().regex(/^p\d+$/);

export type WishlistResult = { ok: true; saved: boolean } | { ok: false; needsSignIn?: boolean; error: string };

// Adds the product to the signed-in user's Wish List, or removes it if already there.
export async function toggleWishlist(id: string): Promise<WishlistResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, needsSignIn: true, error: "Sign in to save items to your Wish List." };
  const pid = productId.parse(id);
  const key = { userId_productId: { userId: session.user.id, productId: pid } };
  const existing = await db.wishlistItem.findUnique({ where: key });
  if (existing) {
    await db.wishlistItem.delete({ where: key });
  } else {
    if (!(await db.product.findUnique({ where: { id: pid }, select: { id: true } }))) return { ok: false, error: "This product no longer exists." };
    await db.wishlistItem.create({ data: { userId: session.user.id, productId: pid } });
  }
  refresh();
  return { ok: true, saved: !existing };
}

export async function removeFromWishlist(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await db.wishlistItem.deleteMany({ where: { userId: session.user.id, productId: productId.parse(id) } });
  refresh();
}

export async function moveWishlistItemToCart(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Please sign in again." };
  const pid = productId.parse(id);
  const res = await addToCart(pid, 1);
  if (!res.ok) return { ok: false, error: res.error };
  await db.wishlistItem.deleteMany({ where: { userId: session.user.id, productId: pid } });
  refresh();
  return { ok: true };
}
