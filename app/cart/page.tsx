import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { getCart } from "@/lib/data/cart";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/delivery";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Shopping Cart", description: "Review the items in your Kartly cart." };

export default async function CartPage() {
  const [{ active, saved }, session] = await Promise.all([getCart(), auth()]);
  const count = active.reduce((s, i) => s + i.quantity, 0);
  const subtotal = active.reduce((s, i) => s + i.quantity * i.product.priceCents, 0);
  const blocked = active.filter((i) => i.product.stock < 1 || i.quantity > i.product.stock);
  const free = subtotal >= FREE_SHIPPING_THRESHOLD_CENTS;

  return (
    <div className="bg-page-bg py-5">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-4 lg:flex-row lg:items-start">
        <section className="min-w-0 flex-1 bg-white p-5" aria-labelledby="cart-title">
          {active.length === 0 ? (
            <div className="py-6">
              <h1 id="cart-title" className="text-2xl font-bold">Your Kartly Cart is empty</h1>
              <p className="mt-2 text-sm">
                <Link href="/s?sort=discount" className="link">Shop today&apos;s deals</Link>
              </p>
              {!session && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/signin?callbackUrl=/cart" className="btn-cart">Sign in to your account</Link>
                  <Link href="/register?callbackUrl=/cart" className="btn-secondary">Sign up now</Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between border-b border-border pb-2">
                <h1 id="cart-title" className="text-2xl sm:text-[28px]">Shopping Cart</h1>
                <span className="hidden text-sm text-text-secondary sm:block">Price</span>
              </div>
              <ul>
                {active.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </ul>
              <p className="pt-3 text-right text-lg">
                Subtotal ({count} {count === 1 ? "item" : "items"}): <b>{formatMoney(subtotal)}</b>
              </p>
            </>
          )}
        </section>

        {active.length > 0 && (
          <aside className="w-full space-y-3 bg-white p-5 lg:w-[300px]" aria-label="Order summary">
            {free ? (
              <p className="flex gap-1 text-xs text-in-stock">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                <span>Your order qualifies for FREE Standard Delivery.</span>
              </p>
            ) : (
              <p className="text-xs">
                Add <b>{formatMoney(FREE_SHIPPING_THRESHOLD_CENTS - subtotal)}</b> of eligible items for FREE delivery.
              </p>
            )}
            <p className="text-lg">
              Subtotal ({count} {count === 1 ? "item" : "items"}): <b>{formatMoney(subtotal)}</b>
            </p>
            {blocked.length > 0 ? (
              <>
                <p role="alert" className="rounded-md border border-deal bg-[#fff5f6] p-2 text-xs text-deal">
                  {blocked.length === 1 ? "One item isn't" : `${blocked.length} items aren't`} available in the quantity requested.
                  Update the quantity or save {blocked.length === 1 ? "it" : "them"} for later to check out.
                </p>
                <button disabled className="btn-buy w-full">Proceed to checkout</button>
              </>
            ) : (
              <Link href="/checkout" className="btn-buy block w-full">Proceed to checkout</Link>
            )}
          </aside>
        )}
      </div>

      {saved.length > 0 && (
        <section className="mx-auto mt-5 max-w-[1500px] px-4" aria-labelledby="saved-title">
          <div className="bg-white p-5">
            <h2 id="saved-title" className="border-b border-border pb-2 text-xl font-bold">
              Saved for later ({saved.length} {saved.length === 1 ? "item" : "items"})
            </h2>
            <ul>
              {saved.map((item) => (
                <CartItemRow key={item.id} item={item} saved />
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
