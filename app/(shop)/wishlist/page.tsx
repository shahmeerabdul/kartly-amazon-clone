import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { productCardSelect } from "@/lib/data/catalog";
import { ProductCard } from "@/components/product/product-card";
import { WishlistActions } from "@/components/wishlist/wishlist-actions";

export const metadata: Metadata = { title: "Your Wish List", description: "Items you've saved on Kartly." };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/wishlist");
  const items = await db.wishlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { product: { select: productCardSelect } },
  });

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6">
      <nav aria-label="Breadcrumb" className="mb-2 text-xs text-text-secondary">
        <Link href="/account" className="hover:underline">Your Account</Link> › <span className="text-[#c45500]">Your Lists</span>
      </nav>
      <h1 className="mb-1 text-[28px]">Your Wish List</h1>
      <p className="mb-5 text-sm text-text-secondary">
        {items.length} {items.length === 1 ? "item" : "items"} · Private to you
      </p>
      {items.length === 0 ? (
        <div className="card flex flex-col items-center p-10 text-center">
          <Heart className="h-12 w-12 text-[#c7c7c7]" aria-hidden />
          <p className="mt-3 text-lg font-bold">Your Wish List is empty</p>
          <p className="mt-1 text-sm text-text-secondary">Tap &ldquo;Add to List&rdquo; on any product page to save it here for later.</p>
          <Link href="/deals" className="btn-cart mt-4">Browse today&apos;s deals</Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {items.map(({ product }) => (
            <li key={product.id}>
              <ProductCard product={product}>
                <WishlistActions productId={product.id} inStock={product.stock > 0} />
              </ProductCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
