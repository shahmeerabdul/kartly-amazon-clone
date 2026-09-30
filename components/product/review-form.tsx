"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { submitReview, type ReviewState } from "@/lib/actions/reviews";
import { cn } from "@/lib/format";

type Existing = { rating: number; title: string; body: string } | null;
const LABELS = ["", "I hate it", "I don't like it", "It's okay", "I like it", "I love it"];

export function ReviewForm({ productId, existing }: { productId: string; existing: Existing }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  // Controlled so a failed submit (React resets forms after an action) keeps what was typed.
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [state, action, pending] = useActionState(async (prev: ReviewState, formData: FormData) => {
    const res = await submitReview(prev, formData);
    if (res.ok) {
      toast.success(existing ? "Your review was updated" : "Thanks! Your review is posted");
      setOpen(false);
    }
    return res;
  }, {} as ReviewState);
  const e = state.fieldErrors ?? {};

  if (!open) {
    return (
      <div className="mt-6 border-t border-border pt-5">
        <h3 className="font-bold">Review this product</h3>
        <p className="mb-3 text-sm text-text-secondary">Share your thoughts with other customers</p>
        <button type="button" onClick={() => setOpen(true)} className="btn-secondary w-full">
          {existing ? "Edit your review" : "Write a customer review"}
        </button>
      </div>
    );
  }

  const shown = hover || rating;
  return (
    <form id="write-review" action={action} className="mt-6 space-y-3 border-t border-border pt-5" noValidate>
      <h3 className="font-bold">{existing ? "Edit your review" : "Create review"}</h3>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating || ""} />
      <fieldset>
        <legend className="mb-1 text-sm font-bold">Overall rating</legend>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Overall rating" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}: ${LABELS[n]}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className="p-0.5"
            >
              <Star className={cn("h-7 w-7", n <= shown ? "fill-star text-[#de7921]" : "text-[#c7c7c7]")} aria-hidden />
            </button>
          ))}
          <span className="ml-2 text-sm text-text-secondary">{LABELS[shown]}</span>
        </div>
        {e.rating && <p role="alert" className="mt-1 text-xs text-deal">{e.rating}</p>}
      </fieldset>
      <div>
        <label htmlFor="review-title" className="mb-1 block text-sm font-bold">Add a headline</label>
        <input id="review-title" name="title" maxLength={100} value={title} onChange={(ev) => setTitle(ev.target.value)} placeholder="What's most important to know?" aria-invalid={!!e.title} className="input w-full" />
        {e.title && <p role="alert" className="mt-1 text-xs text-deal">{e.title}</p>}
      </div>
      <div>
        <label htmlFor="review-body" className="mb-1 block text-sm font-bold">Add a written review</label>
        <textarea id="review-body" name="body" rows={4} maxLength={2000} value={body} onChange={(ev) => setBody(ev.target.value)} placeholder="What did you like or dislike? How did you use this product?" aria-invalid={!!e.body} className="input w-full" />
        {e.body && <p role="alert" className="mt-1 text-xs text-deal">{e.body}</p>}
      </div>
      {state.error && <p role="alert" className="text-sm text-deal">{state.error}</p>}
      <div className="flex gap-2">
        <button disabled={pending} className="btn-cart">{pending ? "Submitting…" : "Submit"}</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
