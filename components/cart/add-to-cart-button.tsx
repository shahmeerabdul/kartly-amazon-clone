"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { addToCart, type AddToCartResult } from "@/lib/actions/cart";
import { formatMoney, cn } from "@/lib/format";

type Props = {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
};

export function AddToCartButton({ productId, quantity = 1, disabled, className, label = "Add to Cart" }: Props) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<Extract<AddToCartResult, { ok: true }> | null>(null);
  const sheet = useRef<HTMLDialogElement>(null);

  function add() {
    start(async () => {
      const res = await addToCart(productId, quantity);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setResult(res);
      sheet.current?.showModal();
    });
  }

  return (
    <>
      <button type="button" onClick={add} disabled={disabled || pending} className={cn("btn-cart", className)}>
        {pending ? "Adding…" : label}
      </button>
      <dialog
        ref={sheet}
        aria-labelledby={`added-${productId}`}
        className="fixed inset-y-0 left-auto right-0 m-0 h-full max-h-none w-[min(100vw,380px)] bg-white p-0 text-text shadow-2xl backdrop:bg-black/40"
        onClick={(e) => e.target === e.currentTarget && sheet.current?.close()}
      >
        {result && (
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-in-stock" aria-hidden />
                <h2 id={`added-${productId}`} className="text-lg font-bold">Added to cart</h2>
              </div>
              <button type="button" onClick={() => sheet.current?.close()} aria-label="Close">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="flex gap-3 p-4">
              <span className="relative h-20 w-20 shrink-0 bg-[#f7f7f7]">
                <Image src={result.added.thumbnail} alt="" fill sizes="80px" className="object-contain mix-blend-multiply" />
              </span>
              <p className="line-clamp-3 text-sm">
                {result.added.title}
                {result.added.quantity > 1 && <span className="text-text-secondary"> × {result.added.quantity}</span>}
              </p>
            </div>
            <div className="space-y-3 border-t border-border p-4">
              <p className="text-lg">
                Cart subtotal ({result.itemCount} {result.itemCount === 1 ? "item" : "items"}):{" "}
                <b>{formatMoney(result.subtotalCents)}</b>
              </p>
              <Link href="/checkout" className="btn-buy block w-full">Proceed to checkout</Link>
              <Link href="/cart" className="btn-secondary block w-full">Go to Cart</Link>
              <button type="button" onClick={() => sheet.current?.close()} className="link w-full text-sm">
                Continue shopping
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
