"use client";

import Link from "next/link";
import { useState } from "react";
import { Lock, MapPin } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Price } from "@/components/ui/price";
import { formatMoney } from "@/lib/format";

type Props = {
  productId: string;
  priceCents: number;
  stock: number;
  locationLabel: string | null;
  international: boolean;
  standardDate: string;
  expressDate: string;
  standardFeeCents: number;
  expressFeeCents: number;
  freeThresholdCents: number;
};

export function BuyBox(p: Props) {
  const [qty, setQty] = useState(1);
  const max = Math.min(p.stock, 10);
  const subtotal = p.priceCents * qty;
  const standardFee = subtotal >= p.freeThresholdCents ? 0 : p.standardFeeCents;
  const inStock = p.stock > 0;

  return (
    <div className="card space-y-3 p-4">
      <Price cents={p.priceCents} size="md" />
      {inStock && (
        <>
          <p className="text-sm">
            {standardFee === 0 ? (
              <>
                <span className="text-link">FREE delivery</span> <b>{p.standardDate}</b>
              </>
            ) : (
              <>
                {formatMoney(standardFee)} delivery <b>{p.standardDate}</b>.{" "}
                <span className="text-text-secondary">Free over {formatMoney(p.freeThresholdCents)}.</span>
              </>
            )}
          </p>
          <p className="text-sm">
            Or fastest delivery <b>{p.expressDate}</b> for {formatMoney(p.expressFeeCents)}
          </p>
          {/* Better than the original: the full price including delivery, before checkout. */}
          <p className="rounded-md bg-[#f0f8ff] px-2 py-1.5 text-xs text-text">
            Total with standard delivery: <b>{formatMoney(subtotal + standardFee)}</b>
            <span className="text-text-secondary"> + est. tax</span>
          </p>
        </>
      )}
      <p className="flex items-center gap-1 text-xs text-link">
        <MapPin className="h-3.5 w-3.5" aria-hidden />
        {p.locationLabel ? `Deliver to ${p.locationLabel}` : "Set your location in the header for exact dates"}
      </p>
      {p.international && inStock && (
        <p className="rounded-md bg-[#fff8e6] px-2 py-1.5 text-xs text-text">
          Dates above are for US delivery. International orders usually arrive in 7–14 business days; checkout currently ships to US addresses.
        </p>
      )}
      <p className={inStock ? (p.stock <= 5 ? "text-lg text-deal" : "text-lg text-in-stock") : "text-lg text-deal"}>
        {!inStock ? "Currently unavailable." : p.stock <= 5 ? `Only ${p.stock} left in stock - order soon.` : "In Stock"}
      </p>
      {inStock && (
        <>
          <label className="flex items-center gap-2 text-sm">
            <span>Quantity:</span>
            <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className="cursor-pointer rounded-lg border border-border bg-[#f0f2f2] px-2 py-1 shadow-sm">
              {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <AddToCartButton productId={p.productId} quantity={qty} className="w-full" />
          <Link href={`/checkout?buy=${p.productId}&qty=${qty}`} className="btn-buy block w-full">
            Buy Now
          </Link>
          <p className="flex items-center gap-1 text-xs text-text-secondary">
            <Lock className="h-3 w-3" aria-hidden /> Secure transaction · Ships from and sold by Kartly
          </p>
        </>
      )}
    </div>
  );
}
