"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { buyAgain, cancelOrder } from "@/lib/actions/orders";

export function BuyAgainButton({ productIds, label = "Buy it again", className = "btn-cart w-full text-sm" }: { productIds: string[]; label?: string; className?: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={() =>
        start(async () => {
          const res = await buyAgain(productIds);
          if (res.ok) {
            toast.success(`Added ${res.added} ${res.added === 1 ? "item" : "items"} to your cart`, {
              action: { label: "View cart", onClick: () => router.push("/cart") },
            });
          } else toast.error(res.error ?? "Couldn't add these items to your cart.");
        })
      }
    >
      {pending ? "Adding…" : label}
    </button>
  );
}

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="btn-secondary w-full text-sm"
      onClick={() => {
        if (!confirm("Cancel this order? Items that haven't shipped will not be sent.")) return;
        start(async () => {
          const res = await cancelOrder(orderId);
          if (res.ok) toast.success("Your order has been cancelled.");
          else toast.error(res.error);
        });
      }}
    >
      {pending ? "Cancelling…" : "Cancel order"}
    </button>
  );
}
