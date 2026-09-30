"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getReviewEligibility } from "@/lib/data/product";
import { toFieldErrors, type FieldErrors } from "@/lib/validation";

export type ReviewState = { ok?: boolean; error?: string; fieldErrors?: FieldErrors };

const schema = z.object({
  productId: z.string().regex(/^p\d+$/),
  rating: z.coerce.number().int().min(1, "Select a star rating").max(5),
  title: z.string().trim().min(2, "Add a headline").max(100),
  body: z.string().trim().min(10, "Tell others a little more (at least 10 characters)").max(2000),
});

export async function submitReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in to write a review." };
  const parsed = schema.safeParse({ ...Object.fromEntries(formData), rating: formData.get("rating") ?? 0 });
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };
  const { productId, rating, title, body } = parsed.data;
  const userId = session.user.id;

  const { purchased, existing } = await getReviewEligibility(userId, productId);
  if (!purchased) return { error: "Only customers who bought this item can review it." };

  // Keep the product's average in step: add a new rating, or swap an edited one.
  await db.$transaction(async (tx) => {
    const product = await tx.product.findUniqueOrThrow({ where: { id: productId }, select: { rating: true, ratingCount: true } });
    const total = product.rating * product.ratingCount;
    if (existing) {
      await tx.review.update({ where: { id: existing.id }, data: { rating, title, body, verified: true } });
      const avg = (total - existing.rating + rating) / product.ratingCount;
      await tx.product.update({ where: { id: productId }, data: { rating: Math.round(avg * 10) / 10 } });
    } else {
      await tx.review.create({
        data: { productId, userId, authorName: session.user.name ?? "Kartly customer", rating, title, body, verified: true },
      });
      const count = product.ratingCount + 1;
      await tx.product.update({ where: { id: productId }, data: { rating: Math.round(((total + rating) / count) * 10) / 10, ratingCount: count } });
    }
  });
  refresh();
  return { ok: true };
}
