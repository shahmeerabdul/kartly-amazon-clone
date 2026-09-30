"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { GUEST_CART_COOKIE, getCartCount } from "@/lib/data/cart";

const MAX_QTY = 10;

// Returns the visitor's cart, creating it (and the guest cookie) on first write.
async function getOrCreateCartId() {
  const session = await auth();
  if (session?.user?.id) {
    const cart = await db.cart.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
      select: { id: true },
    });
    return cart.id;
  }
  const jar = await cookies();
  let guestId = jar.get(GUEST_CART_COOKIE)?.value;
  if (!guestId) {
    guestId = randomUUID();
    jar.set(GUEST_CART_COOKIE, guestId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  const cart = await db.cart.upsert({ where: { guestId }, create: { guestId }, update: {}, select: { id: true } });
  return cart.id;
}

// Only ever touches items in the caller's own cart.
async function ownItem(itemId: string) {
  const cartId = await getOrCreateCartId();
  const item = await db.cartItem.findFirst({ where: { id: itemId, cartId }, include: { product: { select: { stock: true } } } });
  if (!item) throw new Error("Cart item not found");
  return item;
}

const addSchema = z.object({ productId: z.string().min(1), quantity: z.coerce.number().int().min(1).max(MAX_QTY) });

export type AddToCartResult =
  | { ok: true; count: number; subtotalCents: number; itemCount: number; added: { title: string; thumbnail: string; quantity: number } }
  | { ok: false; error: string };

export async function addToCart(productId: string, quantity = 1): Promise<AddToCartResult> {
  const parsed = addSchema.safeParse({ productId, quantity });
  if (!parsed.success) return { ok: false, error: "Invalid quantity" };
  const product = await db.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, stock: true, title: true, thumbnail: true },
  });
  if (!product) return { ok: false, error: "This product no longer exists." };
  if (product.stock < 1) return { ok: false, error: "This item is currently unavailable." };

  const cartId = await getOrCreateCartId();
  const existing = await db.cartItem.findUnique({ where: { cartId_productId: { cartId, productId: product.id } } });
  const cap = Math.min(product.stock, MAX_QTY);
  const next = Math.min(cap, (existing && !existing.savedForLater ? existing.quantity : 0) + parsed.data.quantity);
  await db.cartItem.upsert({
    where: { cartId_productId: { cartId, productId: product.id } },
    create: { cartId, productId: product.id, quantity: next },
    update: { quantity: next, savedForLater: false },
  });

  const items = await db.cartItem.findMany({
    where: { cartId, savedForLater: false },
    select: { quantity: true, product: { select: { priceCents: true } } },
  });
  refresh();
  return {
    ok: true,
    count: items.reduce((s, i) => s + i.quantity, 0),
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotalCents: items.reduce((s, i) => s + i.quantity * i.product.priceCents, 0),
    added: { title: product.title, thumbnail: product.thumbnail, quantity: parsed.data.quantity },
  };
}

export async function updateQuantity(itemId: string, quantity: number) {
  const item = await ownItem(itemId);
  const qty = z.number().int().min(1).max(MAX_QTY).parse(quantity);
  await db.cartItem.update({ where: { id: item.id }, data: { quantity: Math.min(qty, Math.max(item.product.stock, 1)) } });
  refresh();
}

export async function removeItem(itemId: string) {
  const item = await ownItem(itemId);
  await db.cartItem.delete({ where: { id: item.id } });
  refresh();
}

export async function setSavedForLater(itemId: string, saved: boolean) {
  const item = await ownItem(itemId);
  await db.cartItem.update({ where: { id: item.id }, data: { savedForLater: saved } });
  refresh();
}

export async function getCartCountAction() {
  return getCartCount();
}

// On sign-in: guest items move into the user's cart (quantities add, capped by stock), then the cookie clears.
export async function mergeGuestCartInto(userId: string) {
  const jar = await cookies();
  const guestId = jar.get(GUEST_CART_COOKIE)?.value;
  if (!guestId) return;
  const guest = await db.cart.findUnique({
    where: { guestId },
    include: { items: { include: { product: { select: { stock: true } } } } },
  });
  if (guest?.items.length) {
    const userCart = await db.cart.upsert({ where: { userId }, create: { userId }, update: {}, select: { id: true } });
    await db.$transaction(async (tx) => {
      for (const gi of guest.items) {
        const existing = await tx.cartItem.findUnique({
          where: { cartId_productId: { cartId: userCart.id, productId: gi.productId } },
        });
        const cap = Math.max(1, Math.min(gi.product.stock, MAX_QTY));
        const quantity = Math.min(cap, gi.quantity + (existing && !existing.savedForLater ? existing.quantity : 0));
        await tx.cartItem.upsert({
          where: { cartId_productId: { cartId: userCart.id, productId: gi.productId } },
          create: { cartId: userCart.id, productId: gi.productId, quantity, savedForLater: gi.savedForLater },
          update: { quantity, savedForLater: gi.savedForLater && (existing?.savedForLater ?? true) },
        });
      }
      await tx.cart.delete({ where: { id: guest.id } });
    });
  } else if (guest) {
    await db.cart.delete({ where: { id: guest.id } });
  }
  jar.delete(GUEST_CART_COOKIE);
}
