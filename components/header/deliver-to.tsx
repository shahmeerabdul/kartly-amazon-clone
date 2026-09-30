"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { setLocation, type LocationState } from "@/lib/actions/prefs";
import { COUNTRIES, locationLabel, type DeliveryLocation } from "@/lib/locations";

type Props = { location: DeliveryLocation; name?: string | null; compact?: boolean };

export function DeliverTo({ location, name, compact = false }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(setLocation, {} as LocationState);
  const [country, setCountry] = useState(location.country);
  const [city, setCity] = useState(location.city ?? "");
  const cities = COUNTRIES.find((c) => c.code === country)?.cities ?? [];

  useEffect(() => {
    if (state.ok) ref.current?.close();
  }, [state]);

  const open = () => {
    // Reset the form to the saved location each time it opens.
    setCountry(location.country);
    setCity(location.city ?? "");
    ref.current?.showModal();
  };

  const label = name ? `Deliver to ${name.split(" ")[0]}` : "Deliver to";
  const place = locationLabel(location);
  return (
    <>
      <button
        type="button"
        onClick={open}
        className={
          compact
            ? "flex w-full items-center gap-1 bg-footer-top px-3 py-2 text-sm text-white md:hidden"
            : "nav-item hidden h-[50px] max-w-[190px] shrink-0 items-end gap-0.5 px-2 pb-1.5 text-left md:flex"
        }
      >
        <MapPin className={compact ? "h-4 w-4 shrink-0" : "mb-0.5 h-[18px] w-[18px] shrink-0"} aria-hidden />
        {compact ? (
          <span className="truncate">
            {label} {place}
          </span>
        ) : (
          <span className="min-w-0 leading-tight">
            <span className="block text-xs text-[#ccc]">{label}</span>
            <span className="block truncate text-sm font-bold">{place}</span>
          </span>
        )}
      </button>
      <dialog
        ref={ref}
        className="m-auto w-[min(92vw,380px)] rounded-lg p-0 text-text backdrop:bg-black/50"
        aria-labelledby="loc-title"
      >
        <div className="bg-[#f0f2f2] px-5 py-4">
          <h2 id="loc-title" className="font-bold">Choose your location</h2>
        </div>
        <form action={action} className="space-y-3 p-5">
          <p className="text-xs text-text-secondary">
            Delivery options and dates shown across Kartly are based on this location. Prices are shown in USD.
          </p>
          <div>
            <label htmlFor="loc-country" className="mb-1 block text-sm font-bold">Country/Region</label>
            <select
              id="loc-country"
              name="country"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setCity("");
              }}
              className="input w-full cursor-pointer bg-[#f0f2f2]"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="loc-city" className="mb-1 block text-sm font-bold">City</label>
            <select
              id="loc-city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              aria-invalid={!!state.error}
              aria-describedby={state.error ? "loc-error" : undefined}
              className="input w-full cursor-pointer bg-[#f0f2f2]"
            >
              <option value="">Select a city</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {country === "US" && (
            <div>
              <label htmlFor="loc-zip" className="mb-1 block text-sm font-bold">
                ZIP code <span className="font-normal text-text-secondary">(optional)</span>
              </label>
              <input
                id="loc-zip"
                name="zip"
                inputMode="numeric"
                maxLength={5}
                defaultValue={location.country === "US" ? (location.zip ?? "") : ""}
                aria-describedby={state.error ? "loc-error" : undefined}
                className="input w-full"
              />
            </div>
          )}
          {state.error && (
            <p id="loc-error" role="alert" className="text-xs text-deal">{state.error}</p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => ref.current?.close()} className="btn-secondary px-4">Cancel</button>
            <button disabled={pending} className="btn-cart px-5">{pending ? "Saving…" : "Done"}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
