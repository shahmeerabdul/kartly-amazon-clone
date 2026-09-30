"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { setLocation, type LocationState } from "@/lib/actions/prefs";
import { COUNTRIES, locationLabel, type DeliveryLocation } from "@/lib/locations";
import { cn } from "@/lib/format";

export type SavedAddress = { id: string; fullName: string; line1: string; city: string; state: string; zip: string; isDefault: boolean };
type Props = { location: DeliveryLocation; name?: string | null; addresses?: SavedAddress[]; compact?: boolean };

const INTERNATIONAL = COUNTRIES.filter((c) => c.code !== "US");

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm text-text-secondary">
      <span className="h-px flex-1 bg-border" aria-hidden />
      {children}
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  );
}

export function DeliverTo({ location, name, addresses = [], compact = false }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [state, action, pending] = useActionState(setLocation, {} as LocationState);
  const [country, setCountry] = useState(location.country === "US" ? "" : location.country);
  const [city, setCity] = useState(location.country === "US" ? "" : (location.city ?? ""));
  const cities = INTERNATIONAL.find((c) => c.code === country)?.cities ?? [];

  useEffect(() => {
    if (state.ok) ref.current?.close();
  }, [state]);

  const open = () => {
    // Start from the saved location each time the dialog opens.
    setCountry(location.country === "US" ? "" : location.country);
    setCity(location.country === "US" ? "" : (location.city ?? ""));
    ref.current?.showModal();
  };
  const close = () => ref.current?.close();

  const label = name ? `Deliver to ${name.split(" ")[0]}` : "Deliver to";
  const place = locationLabel(location);
  const selectedZip = location.country === "US" ? location.zip : null;

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
        className="m-auto w-[min(94vw,560px)] overflow-hidden rounded-xl p-0 text-text shadow-2xl backdrop:bg-black/50"
        aria-labelledby="loc-title"
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <div className="flex items-center justify-between border-b border-border bg-[#f0f2f2] px-6 py-4">
          <h2 id="loc-title" className="text-xl font-bold">Choose your location</h2>
          <button type="button" onClick={close} aria-label="Close" className="rounded-full p-1 hover:bg-[#e3e6e6]">
            <X className="h-6 w-6" strokeWidth={2.5} aria-hidden />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-[15px] text-text-secondary">Delivery options and delivery speeds may vary for different locations</p>

          {name ? (
            addresses.length > 0 ? (
              <ul className="space-y-2" aria-label="Your addresses">
                {addresses.map((a) => {
                  const active = location.country === "US" && location.zip === a.zip.slice(0, 5);
                  return (
                    <li key={a.id}>
                      <form action={action}>
                        <input type="hidden" name="mode" value="address" />
                        <input type="hidden" name="addressId" value={a.id} />
                        <button
                          disabled={pending}
                          aria-pressed={active}
                          className={cn(
                            "w-full rounded-lg border px-4 py-2.5 text-left text-sm hover:bg-[#f7fafa]",
                            active ? "border-[#e77600] bg-[#fcf5ee] ring-1 ring-[#e77600]" : "border-border",
                          )}
                        >
                          <b>{a.fullName}</b> {a.line1}, {a.city}, {a.state} {a.zip}
                          {a.isDefault && <span className="block text-xs text-text-secondary">Default address</span>}
                        </button>
                      </form>
                    </li>
                  );
                })}
                <li>
                  <Link href="/account/addresses" onClick={close} className="link text-sm">Manage address book</Link>
                </li>
              </ul>
            ) : (
              <Link href="/account/addresses" onClick={close} className="link block text-sm">Add an address to your address book</Link>
            )
          ) : (
            <Link
              href={`/signin?callbackUrl=${encodeURIComponent(pathname)}`}
              onClick={close}
              className="block w-full rounded-full bg-cart-btn py-2.5 text-center text-[15px] hover:bg-cart-btn-hover"
            >
              Sign in to see your addresses
            </Link>
          )}

          <Divider>or enter a US zip code</Divider>
          <form action={action} className="flex gap-3" noValidate>
            <input type="hidden" name="mode" value="zip" />
            <label htmlFor="loc-zip" className="sr-only">US zip code</label>
            <input
              id="loc-zip"
              name="zip"
              inputMode="numeric"
              maxLength={5}
              defaultValue={selectedZip ?? ""}
              aria-invalid={state.field === "zip"}
              aria-describedby={state.field === "zip" ? "loc-error" : undefined}
              className="input min-w-0 flex-1 py-2"
            />
            <button disabled={pending} className="btn-secondary w-36 shrink-0 py-2">Apply</button>
          </form>

          <Divider>or ship outside the US</Divider>
          <form action={action} className="space-y-3" id="loc-country-form">
            <input type="hidden" name="mode" value="country" />
            <label htmlFor="loc-country" className="sr-only">Ship outside the US</label>
            <select
              id="loc-country"
              name="country"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setCity("");
              }}
              aria-invalid={state.field === "country"}
              className="input w-full cursor-pointer py-2.5"
            >
              <option value="">Ship outside the US</option>
              {INTERNATIONAL.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            {country && (
              <>
                <label htmlFor="loc-city" className="sr-only">City (optional)</label>
                <select id="loc-city" name="city" value={city} onChange={(e) => setCity(e.target.value)} className="input w-full cursor-pointer py-2.5">
                  <option value="">City (optional)</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </>
            )}
          </form>

          {state.error && (
            <p id="loc-error" role="alert" className="text-sm text-deal">{state.error}</p>
          )}

          <div className="flex justify-end pt-1">
            {/* Done saves the country choice; with no country picked it simply closes, as on Amazon. */}
            {country ? (
              <button type="submit" form="loc-country-form" disabled={pending} className="rounded-full bg-cart-btn px-5 py-2 text-[15px] hover:bg-cart-btn-hover disabled:opacity-60">
                {pending ? "Saving…" : "Done"}
              </button>
            ) : (
              <button type="button" onClick={close} className="rounded-full bg-cart-btn px-5 py-2 text-[15px] hover:bg-cart-btn-hover">
                Done
              </button>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
