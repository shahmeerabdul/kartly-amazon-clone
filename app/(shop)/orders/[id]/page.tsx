import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { getOrder, type ShippingSnapshot } from "@/lib/data/orders";
import { canCancel, displayStatus } from "@/lib/order-status";
import { BuyAgainButton, CancelOrderButton } from "@/components/orders/order-actions";
import { formatDate, formatMoney, cn } from "@/lib/format";

export const metadata: Metadata = { title: "Order details", description: "Status, delivery and payment details for your Kartly order." };

const STEPS = ["Placed", "Shipped", "Delivered"] as const;

export default async function OrderDetailPage({ params, searchParams }: PageProps<"/orders/[id]">) {
  const session = await auth();
  const { id } = await params;
  if (!session?.user?.id) redirect(`/signin?callbackUrl=/orders/${id}`);
  const order = await getOrder(session.user.id, id);
  if (!order) notFound();
  const placed = (await searchParams).placed === "1";
  const status = displayStatus(order);
  const ship = order.shippingAddress as ShippingSnapshot;
  const stepIndex = STEPS.indexOf(status as (typeof STEPS)[number]);

  return (
    <div className="mx-auto w-full max-w-[920px] px-4 py-5">
      {placed && (
        <div role="status" className="mb-5 flex gap-3 rounded-lg border border-in-stock bg-[#f1f8f1] p-4">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-in-stock" aria-hidden />
          <div>
            <p className="text-lg font-bold text-in-stock">Order placed, thanks!</p>
            <p className="text-sm">
              Estimated delivery: <b>{formatDate(order.estimatedDelivery, { weekday: "long", month: "long", day: "numeric" })}</b>. A confirmation is shown here
              instead of an email.
            </p>
          </div>
        </div>
      )}
      <nav aria-label="Breadcrumb" className="mb-2 text-xs text-text-secondary">
        <Link href="/orders" className="hover:underline">Your Orders</Link> › <span className="text-[#c45500]">Order details</span>
      </nav>
      <h1 className="text-[28px]">Order details</h1>
      <p className="mb-4 text-sm text-text-secondary">
        Ordered on {formatDate(order.createdAt, { month: "long", day: "numeric", year: "numeric" })} · Order # {order.id.slice(-10).toUpperCase()}
      </p>

      <section className="card mb-4 p-5" aria-labelledby="status-title">
        <h2 id="status-title" className={cn("text-lg font-bold", status === "Cancelled" && "text-deal")}>
          {status === "Cancelled" ? "Cancelled" : status === "Delivered" ? "Delivered" : `Arriving ${formatDate(order.estimatedDelivery, { weekday: "long", month: "long", day: "numeric" })}`}
        </h2>
        {status !== "Cancelled" && (
          <ol className="mt-4 grid grid-cols-3" aria-label="Shipment progress">
            {STEPS.map((s, i) => (
              <li key={s} className="relative flex flex-col items-center text-xs" aria-current={i === stepIndex ? "step" : undefined}>
                {i > 0 && <span className={cn("absolute right-1/2 top-2 h-1 w-full", i <= stepIndex ? "bg-in-stock" : "bg-[#ddd]")} aria-hidden />}
                <span className={cn("relative z-10 h-5 w-5 rounded-full border-2", i <= stepIndex ? "border-in-stock bg-in-stock" : "border-[#bbb] bg-white")} aria-hidden />
                <span className={cn("mt-1", i <= stepIndex ? "font-bold text-in-stock" : "text-text-secondary")}>{s}</span>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-3 text-xs text-text-secondary">Demo tracking: orders show as shipped after 1 hour and delivered after 3 hours.</p>
      </section>

      <div className="card mb-4 grid gap-5 p-5 text-sm sm:grid-cols-3">
        <div>
          <h2 className="mb-1 font-bold">Shipping Address</h2>
          <p>{ship.fullName}</p>
          <p>{ship.line1}</p>
          {ship.line2 && <p>{ship.line2}</p>}
          <p>{ship.city}, {ship.state} {ship.zip}</p>
          <p className="text-text-secondary">{ship.phone}</p>
        </div>
        <div>
          <h2 className="mb-1 font-bold">Payment Method</h2>
          <p>Card ending in {order.paymentLast4}</p>
          <p className="text-xs text-text-secondary">Demo payment: not charged</p>
          <h2 className="mb-1 mt-3 font-bold">Delivery</h2>
          <p className="capitalize">{order.deliveryOption} delivery</p>
        </div>
        <div>
          <h2 className="mb-1 font-bold">Order Summary</h2>
          <dl className="space-y-0.5">
            <div className="flex justify-between"><dt>Item(s) Subtotal:</dt><dd>{formatMoney(order.subtotalCents)}</dd></div>
            <div className="flex justify-between"><dt>Shipping &amp; Handling:</dt><dd>{order.shippingCents ? formatMoney(order.shippingCents) : "FREE"}</dd></div>
            <div className="flex justify-between"><dt>Estimated tax:</dt><dd>{formatMoney(order.taxCents)}</dd></div>
            <div className="flex justify-between pt-1 font-bold"><dt>Grand Total:</dt><dd>{formatMoney(order.totalCents)}</dd></div>
          </dl>
        </div>
      </div>

      <section className="card p-5" aria-labelledby="items-title">
        <h2 id="items-title" className="mb-3 text-lg font-bold">Items</h2>
        <div className="flex flex-col gap-4 sm:flex-row">
          <ul className="flex-1 space-y-4">
            {order.items.map((i) => (
              <li key={i.id} className="flex gap-3">
                <Link href={`/dp/${i.product.slug}`} className="relative h-24 w-24 shrink-0 bg-[#f7f7f7]">
                  <Image src={i.image} alt={i.title} fill sizes="96px" className="object-contain mix-blend-multiply" />
                </Link>
                <div className="text-sm">
                  <Link href={`/dp/${i.product.slug}`} className="link line-clamp-2">{i.title}</Link>
                  <p className="text-xs text-text-secondary">Qty {i.quantity}</p>
                  <p className="font-bold text-[#b12704]">{formatMoney(i.priceCents)}</p>
                  <div className="mt-2 w-40">
                    <BuyAgainButton productIds={[i.productId]} className="btn-cart w-full py-1 text-xs" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {canCancel(order) && (
            <div className="w-full sm:w-56">
              <CancelOrderButton orderId={order.id} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
