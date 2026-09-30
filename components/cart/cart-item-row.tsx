"use client";

import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { removeItem, setSavedForLater, updateQuantity } from "@/lib/actions/cart";
import { Price } from "@/components/ui/price";
import { formatMoney } from "@/lib/format";
import type { CartLine } from "@/lib/data/cart";

export function CartItemRow({ item, saved = false }: { item: CartLine; saved?: boolean }) {
  const [pending, start] = useTransition();
  const [qty, setOptimisticQty] = useOptimistic(item.quantity);
  const p = item.product;
  const max = Math.max(1, Math.min(p.stock, 10));
  const overStock = p.stock < 1 || item.quantity > p.stock;

  const run = (fn: () => Promise<void>, msg?: string) =>
    start(async () => {
      try {
        await fn();
        if (msg) toast.success(msg);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });

  return (
    <li className={`flex gap-4 border-b border-border py-4 ${pending ? "opacity-60" : ""}`}>
      <Link href={`/dp/${p.slug}`} className="relative h-24 w-24 shrink-0 bg-[#f7f7f7] sm:h-44 sm:w-44">
        <Image src={p.thumbnail} alt={p.title} fill sizes="180px" className="object-contain p-2 mix-blend-multiply" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-4">
          <Link href={`/dp/${p.slug}`} className="line-clamp-2 text-base hover:text-link-hover sm:text-lg">{p.title}</Link>
          <span className="hidden font-bold sm:block"><Price cents={p.priceCents} size="sm" /></span>
        </div>
        <p className="font-bold sm:hidden">{formatMoney(p.priceCents)}</p>
        <p className={`text-xs ${p.stock < 1 ? "text-deal" : p.stock <= 5 ? "text-deal" : "text-in-stock"}`}>
          {p.stock < 1 ? "Currently unavailable" : p.stock <= 5 ? `Only ${p.stock} left in stock` : "In Stock"}
        </p>
        {!saved && overStock && p.stock > 0 && (
          <p className="text-xs text-deal">Only {p.stock} available. Lower the quantity to check out.</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
          {!saved && (
            <label className="flex items-center gap-1">
              <span className="sr-only">Quantity for {p.title}</span>
              <span aria-hidden>Qty:</span>
              <select
                value={Math.min(qty, max)}
                disabled={p.stock < 1}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  start(async () => {
                    setOptimisticQty(n);
                    await updateQuantity(item.id, n);
                  });
                }}
                className="cursor-pointer rounded-lg border border-border bg-[#f0f2f2] px-2 py-1 shadow-sm"
              >
                {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          )}
          <span className="text-border" aria-hidden>|</span>
          <button type="button" className="link" onClick={() => run(() => removeItem(item.id), "Removed from cart")}>Delete</button>
          <span className="text-border" aria-hidden>|</span>
          {saved ? (
            <button type="button" className="link" disabled={p.stock < 1} onClick={() => run(() => setSavedForLater(item.id, false), "Moved to cart")}>
              Move to cart
            </button>
          ) : (
            <button type="button" className="link" onClick={() => run(() => setSavedForLater(item.id, true), "Saved for later")}>
              Save for later
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
