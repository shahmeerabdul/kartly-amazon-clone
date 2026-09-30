import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrders, PERIODS, type Period, type ShippingSnapshot } from "@/lib/data/orders";
import { displayStatus, canCancel, deliveredAt } from "@/lib/order-status";
import { BuyAgainButton, CancelOrderButton } from "@/components/orders/order-actions";
import { formatDate, formatMoney, cn } from "@/lib/format";

export const metadata: Metadata = { title: "Your Orders", description: "Track, cancel or buy again from your Kartly orders." };

export default async function OrdersPage({ searchParams }: PageProps<"/orders">) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/orders");
  const raw = (await searchParams).period;
  const period: Period = typeof raw === "string" && raw in PERIODS ? (raw as Period) : "3m";
  const orders = await getOrders(session.user.id, period);

  return (
    <div className="mx-auto w-full max-w-[920px] px-4 py-5">
      <nav aria-label="Breadcrumb" className="mb-2 text-xs text-text-secondary">
        <Link href="/" className="hover:underline">Home</Link> › <span className="text-[#c45500]">Your Orders</span>
      </nav>
      <h1 className="text-[28px]">Your Orders</h1>
      <div className="my-3 flex flex-wrap items-center gap-2 text-sm">
        <span>
          <b>{orders.length} {orders.length === 1 ? "order" : "orders"}</b> placed in
        </span>
        {(Object.keys(PERIODS) as Period[]).map((p) => (
          <Link
            key={p}
            href={p === "3m" ? "/orders" : `/orders?period=${p}`}
            aria-current={p === period ? "true" : undefined}
            className={cn("rounded-full border px-3 py-1", p === period ? "border-text bg-[#f0f2f2] font-bold" : "border-border hover:bg-[#f7fafa]")}
          >
            {PERIODS[p]}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-lg font-bold">No orders in the {PERIODS[period]}.</p>
          <div className="mt-4 flex justify-center gap-3">
            {period !== "all" && <Link href="/orders?period=all" className="btn-secondary">View all orders</Link>}
            <Link href="/s?sort=discount" className="btn-cart">Shop today&apos;s deals</Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-5">
          {orders.map((o) => {
            const status = displayStatus(o);
            const ship = o.shippingAddress as ShippingSnapshot;
            return (
              <li key={o.id} className="overflow-hidden rounded-lg border border-border">
                <div className="grid grid-cols-2 gap-3 bg-[#f0f2f2] px-5 py-3 text-xs text-text-secondary sm:grid-cols-[auto_auto_auto_1fr]">
                  <div><p className="uppercase">Order placed</p><p className="text-sm text-text">{formatDate(o.createdAt, { month: "long", day: "numeric", year: "numeric" })}</p></div>
                  <div><p className="uppercase">Total</p><p className="text-sm text-text">{formatMoney(o.totalCents)}</p></div>
                  <div><p className="uppercase">Ship to</p><p className="text-sm text-link">{ship.fullName}</p></div>
                  <div className="sm:text-right">
                    <p className="uppercase">Order # {o.id.slice(-10).toUpperCase()}</p>
                    <Link href={`/orders/${o.id}`} className="link text-sm">View order details</Link>
                  </div>
                </div>
                <div className="flex flex-col gap-4 p-5 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <h2 className={cn("text-lg font-bold", status === "Cancelled" && "text-deal")}>
                      {status === "Delivered" && `Delivered ${formatDate(deliveredAt(o), { month: "long", day: "numeric" })}`}
                      {status === "Shipped" && `Arriving ${formatDate(o.estimatedDelivery, { weekday: "long", month: "long", day: "numeric" })}`}
                      {status === "Placed" && `Arriving ${formatDate(o.estimatedDelivery, { weekday: "long", month: "long", day: "numeric" })}`}
                      {status === "Cancelled" && "Cancelled"}
                    </h2>
                    <p className="mb-3 text-sm text-text-secondary">
                      {status === "Placed" ? "Order placed; preparing for shipment" : status === "Shipped" ? "Shipped: on its way" : status === "Delivered" ? "Your package was delivered" : "This order was cancelled and you were not charged"}
                    </p>
                    <ul className="space-y-3">
                      {o.items.map((i) => (
                        <li key={i.id} className="flex gap-3">
                          <Link href={`/dp/${i.product.slug}`} className="relative h-20 w-20 shrink-0 bg-[#f7f7f7]">
                            <Image src={i.image} alt={i.title} fill sizes="80px" className="object-contain mix-blend-multiply" />
                          </Link>
                          <div className="min-w-0 text-sm">
                            <Link href={`/dp/${i.product.slug}`} className="link line-clamp-2">{i.title}</Link>
                            <p className="text-xs text-text-secondary">Qty {i.quantity} · {formatMoney(i.priceCents)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-56">
                    <BuyAgainButton productIds={o.items.map((i) => i.productId)} />
                    <Link href={`/orders/${o.id}`} className="btn-secondary w-full text-sm">View order details</Link>
                    {canCancel(o) && <CancelOrderButton orderId={o.id} />}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
