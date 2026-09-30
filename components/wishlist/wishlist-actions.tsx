"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { moveWishlistItemToCart, removeFromWishlist } from "@/lib/actions/wishlist";

export function WishlistActions({ productId, inStock }: { productId: string; inStock: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className={`mt-2 flex flex-col gap-2 ${pending ? "opacity-60" : ""}`}>
      <button
        type="button"
        disabled={pending || !inStock}
        className="btn-cart w-full py-1 text-sm"
        onClick={() =>
          start(async () => {
            const res = await moveWishlistItemToCart(productId);
            if (res.ok) toast.success("Moved to your cart");
            else toast.error(res.error);
          })
        }
      >
        {inStock ? "Move to cart" : "Currently unavailable"}
      </button>
      <button
        type="button"
        disabled={pending}
        className="link text-sm"
        onClick={() =>
          start(async () => {
            await removeFromWishlist(productId);
            toast.success("Removed from your Wish List");
          })
        }
      >
        Remove
      </button>
    </div>
  );
}
