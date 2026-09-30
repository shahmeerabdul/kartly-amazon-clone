"use client";

import { usePathname, useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { cn } from "@/lib/format";

export function WishlistButton({ productId, saved, className }: { productId: string; saved: boolean; className?: string }) {
  const [pending, start] = useTransition();
  const [isSaved, setSaved] = useOptimistic(saved);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <button
      type="button"
      aria-pressed={isSaved}
      disabled={pending}
      onClick={() =>
        start(async () => {
          setSaved(!isSaved);
          const res = await toggleWishlist(productId);
          if (!res.ok) {
            if (res.needsSignIn) router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`);
            else toast.error(res.error);
            return;
          }
          toast.success(res.saved ? "Added to your Wish List" : "Removed from your Wish List", {
            action: res.saved ? { label: "View list", onClick: () => router.push("/wishlist") } : undefined,
          });
        })
      }
      className={cn("btn-secondary flex w-full items-center justify-center gap-2", className)}
    >
      <Heart className={cn("h-4 w-4", isSaved && "fill-deal text-deal")} aria-hidden />
      {isSaved ? "Saved to Wish List" : "Add to List"}
    </button>
  );
}
