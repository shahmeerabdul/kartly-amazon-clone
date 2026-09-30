"use server";

import { refresh } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canCancel } from "@/lib/order-status";
import { addToCart } from "@/lib/actions/cart";

export async function cancelOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Please sign in again." };
  const order = await db.order.findFirst({ where: { id: orderId, userId: session.user.id }, include: { items: true } });
  if (!order) return { ok: false, error: "Order not found." };
  if (!canCancel(order)) return { ok: false, error: "This order has already shipped and can no longer be cancelled." };

  // Cancelling returns the stock; the status guard makes a double cancel a no-op.
  await db.$transaction(async (tx) => {
    const res = await tx.order.updateMany({ where: { id: order.id, status: "PLACED" }, data: { status: "CANCELLED" } });
    if (res.count === 0) return;
    for (const item of order.items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
    }
  });
  refresh();
  return { ok: true };
}

export async function buyAgain(productIds: string[]): Promise<{ ok: boolean; added: number; error?: string }> {
  let added = 0;
  let error: string | undefined;
  for (const id of productIds.slice(0, 20)) {
    const res = await addToCart(id, 1);
    if (res.ok) added++;
    else error = res.error;
  }
  return { ok: added > 0, added, error };
}
