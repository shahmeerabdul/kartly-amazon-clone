"use client";

import { useActionState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { setZip, type ZipState } from "@/lib/actions/prefs";

export function DeliverTo({ zip, name, compact = false }: { zip: string | null; name?: string | null; compact?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(setZip, {} as ZipState);

  useEffect(() => {
    if (state.ok) ref.current?.close();
  }, [state]);

  const label = name ? `Deliver to ${name.split(" ")[0]}` : "Deliver to";
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className={
          compact
            ? "flex w-full items-center gap-1 bg-footer-top px-3 py-2 text-sm text-white md:hidden"
            : "hidden items-end gap-0.5 rounded-sm border border-transparent px-2 py-1 text-left hover:border-white lg:flex"
        }
      >
        <MapPin className="h-4 w-4 shrink-0" aria-hidden />
        {compact ? (
          <span>
            {label} {zip ?? "· set your location"}
          </span>
        ) : (
          <span className="leading-tight">
            <span className="block text-xs text-[#ccc]">{label}</span>
            <span className="block text-sm font-bold">{zip ? `ZIP ${zip}` : "Update location"}</span>
          </span>
        )}
      </button>
      <dialog
        ref={ref}
        className="m-auto w-[min(92vw,360px)] rounded-lg p-0 text-text backdrop:bg-black/50"
        aria-labelledby="zip-title"
      >
        <div className="bg-[#f0f2f2] px-5 py-4">
          <h2 id="zip-title" className="font-bold">
            Choose your location
          </h2>
        </div>
        <form action={action} className="space-y-3 p-5">
          <p className="text-xs text-text-secondary">
            Delivery dates and options shown across Kartly use this ZIP code.
          </p>
          <label htmlFor="zip-input" className="block text-sm font-bold">
            US ZIP code
          </label>
          <div className="flex gap-2">
            <input
              id="zip-input"
              name="zip"
              inputMode="numeric"
              maxLength={5}
              defaultValue={zip ?? ""}
              aria-invalid={!!state.error}
              aria-describedby={state.error ? "zip-error" : undefined}
              className="input min-w-0 flex-1"
            />
            <button disabled={pending} className="btn-secondary px-3">
              Apply
            </button>
          </div>
          {state.error && (
            <p id="zip-error" role="alert" className="text-xs text-deal">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <button type="button" onClick={() => ref.current?.close()} className="btn-cart px-4">
              Done
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
