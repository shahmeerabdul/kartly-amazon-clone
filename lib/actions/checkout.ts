"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCheckoutLines } from "@/lib/data/checkout";
import { deliveryDate, orderTotals } from "@/lib/delivery";
import { addressSchema, cardSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { Prisma } from "@/lib/generated/prisma/client";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/checkout");
  return session.user.id;
}

export type AddressResult =
  | { ok: true; address: { id: string; fullName: string; line1: string; line2: string | null; city: string; state: string; zip: string; phone: string; isDefault: boolean } }
  | { ok: false; fieldErrors: FieldErrors };

export async function addAddress(input: unknown): Promise<AddressResult> {
  const userId = await requireUserId();
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  const hasAny = await db.address.count({ where: { userId } });
  const address = await db.address.create({ data: { ...parsed.data, userId, isDefault: hasAny === 0 } });
  return { ok: true, address };
}

const placeSchema = z.object({
  checkoutKey: z.uuid(),
  addressId: z.string().min(1, "Choose a delivery address"),
  deliveryOption: z.enum(["standard", "express"]),
  card: cardSchema,
  buy: z.object({ productId: z.string().regex(/^p\d+$/), qty: z.number().int().min(1).max(10) }).optional(),
});

export type PlaceOrderResult = { ok: false; error: string; fieldErrors?: FieldErrors };

class StockError extends Error {}

export async function placeOrder(input: z.input<typeof placeSchema>): Promise<PlaceOrderResult> {
  const userId = await requireUserId();
  const parsed = placeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };
  }
  const { checkoutKey, addressId, deliveryOption, card, buy } = parsed.data;

  // A repeat submit with the same key (double click, retry) lands on the order already placed.
  const existing = await db.order.findUnique({ where: { checkoutKey }, select: { id: true, userId: true } });
  if (existing?.userId === userId) redirect(`/orders/${existing.id}?placed=1`);

  const address = await db.address.findFirst({ where: { id: addressId, userId } });
  if (!address) return { ok: false, error: "Choose a delivery address." };

  const lines = await getCheckoutLines(userId, buy);
  if (!lines.length) return { ok: false, error: "There is nothing to check out." };

  let orderId: string;
  try {
    orderId = await db.$transaction(async (tx) => {
      // Re-check and decrement stock atomically; a concurrent buyer can't oversell.
      const fresh = await tx.product.findMany({ where: { id: { in: lines.map((l) => l.productId) } } });
      for (const line of lines) {
        const res = await tx.product.updateMany({
          where: { id: line.productId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (res.count === 0) {
          const p = fresh.find((x) => x.id === line.productId);
          throw new StockError(
            p && p.stock > 0 ? `Only ${p.stock} of "${line.title}" left. Update your quantity.` : `"${line.title}" just sold out.`,
          );
        }
      }
      const priced = lines.map((l) => ({ ...l, priceCents: fresh.find((p) => p.id === l.productId)!.priceCents }));
      const subtotal = priced.reduce((s, l) => s + l.priceCents * l.quantity, 0);
      const totals = orderTotals(subtotal, deliveryOption);
      const order = await tx.order.create({
        data: {
          userId,
          checkoutKey,
          ...totals,
          shippingAddress: {
            fullName: address.fullName, line1: address.line1, line2: address.line2, city: address.city,
            state: address.state, zip: address.zip, country: address.country, phone: address.phone,
          },
          deliveryOption,
          estimatedDelivery: deliveryDate(deliveryOption),
          paymentLast4: card.number.replace(/\D/g, "").slice(-4),
          items: {
            create: priced.map((l) => ({ productId: l.productId, title: l.title, image: l.thumbnail, priceCents: l.priceCents, quantity: l.quantity })),
          },
        },
        select: { id: true },
      });
      if (!buy) {
        await tx.cartItem.deleteMany({
          where: { cart: { userId }, savedForLater: false, productId: { in: lines.map((l) => l.productId) } },
        });
      }
      return order.id;
    });
  } catch (e) {
    if (e instanceof StockError) return { ok: false, error: e.message };
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const dup = await db.order.findUnique({ where: { checkoutKey }, select: { id: true } });
      if (dup) redirect(`/orders/${dup.id}?placed=1`);
    }
    throw e;
  }
  redirect(`/orders/${orderId}?placed=1`);
}
