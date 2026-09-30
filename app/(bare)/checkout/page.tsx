import type { Metadata } from "next";
import Link from "next/link";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAddresses, getCheckoutLines, parseBuyParam } from "@/lib/data/checkout";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { deliveryDate, EXPRESS_FEE_CENTS, FREE_SHIPPING_THRESHOLD_CENTS, STANDARD_FEE_CENTS, TAX_RATE } from "@/lib/delivery";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Secure checkout", description: "Review and place your Kartly order." };

export default async function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  const sp = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/checkout");
  const buy = parseBuyParam(sp.buy, sp.qty);
  const [lines, addresses] = await Promise.all([getCheckoutLines(session.user.id, buy), getAddresses(session.user.id)]);

  return (
    <div className="flex flex-1 flex-col bg-white">
      <header className="border-b border-border bg-gradient-to-b from-white to-[#f3f3f3]">
        <div className="mx-auto flex max-w-[1150px] items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-baseline text-text" aria-label="Kartly home">
            <span className="text-2xl font-bold tracking-tight">kartly</span>
            <span className="text-2xl font-bold text-accent">.</span>
          </Link>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl">
            Secure checkout <Lock className="h-5 w-5 text-text-secondary" aria-hidden />
          </h1>
          <Link href="/cart" className="link text-sm">Cart</Link>
        </div>
      </header>
      {lines.length === 0 ? (
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold">There&apos;s nothing to check out</h2>
          <p className="mt-2 text-text-secondary">Your cart is empty, or the item you chose is no longer available.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/cart" className="btn-cart">Go to Cart</Link>
            <Link href="/s" className="btn-secondary">Continue shopping</Link>
          </div>
        </div>
      ) : (
        <CheckoutForm
          checkoutKey={randomUUID()}
          lines={lines}
          addresses={addresses}
          buy={buy}
          pricing={{
            freeThresholdCents: FREE_SHIPPING_THRESHOLD_CENTS,
            standardFeeCents: STANDARD_FEE_CENTS,
            expressFeeCents: EXPRESS_FEE_CENTS,
            taxRate: TAX_RATE,
            standardDate: formatDate(deliveryDate("standard"), { weekday: "long", month: "long", day: "numeric" }),
            expressDate: formatDate(deliveryDate("express"), { weekday: "long", month: "long", day: "numeric" }),
          }}
        />
      )}
    </div>
  );
}
