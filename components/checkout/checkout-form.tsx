"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { CreditCard, Info } from "lucide-react";
import { addAddress, placeOrder } from "@/lib/actions/checkout";
import type { CheckoutLine } from "@/lib/data/checkout";
import { addressSchema, cardBrand, cardSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { formatMoney, cn } from "@/lib/format";

type Address = { id: string; fullName: string; line1: string; line2: string | null; city: string; state: string; zip: string; phone: string; isDefault: boolean };
type Pricing = {
  freeThresholdCents: number;
  standardFeeCents: number;
  expressFeeCents: number;
  taxRate: number;
  standardDate: string;
  expressDate: string;
};
type Props = {
  checkoutKey: string;
  lines: CheckoutLine[];
  addresses: Address[];
  buy?: { productId: string; qty: number };
  pricing: Pricing;
};
type Card = { name: string; number: string; exp: string; cvc: string };

const EMPTY_CARD: Card = { name: "", number: "", exp: "", cvc: "" };
const TEST_CARD = (name: string): Card => ({ name: name || "Demo Shopper", number: "4242 4242 4242 4242", exp: "12/30", cvc: "123" });

function Field({ id, label, error, ...rest }: { id: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-bold">{label}</label>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className="input w-full" {...rest} />
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-deal">{error}</p>}
    </div>
  );
}

function Section({ n, title, done, summary, onEdit, children, editing }: {
  n: number;
  title: string;
  done: boolean;
  summary: React.ReactNode;
  onEdit: () => void;
  editing: boolean;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`sec-${n}`} className="border-b border-border py-4">
      <div className="flex gap-4">
        <span className="text-lg font-bold">{n}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <h2 id={`sec-${n}`} className={cn("text-lg font-bold", editing && "text-[#c45500]")}>{title}</h2>
            {done && !editing && (
              <button type="button" onClick={onEdit} className="link text-sm">Change</button>
            )}
          </div>
          {editing ? <div className="mt-3">{children}</div> : <div className="mt-1 text-sm">{summary}</div>}
        </div>
      </div>
    </section>
  );
}

export function CheckoutForm({ checkoutKey, lines, addresses: initialAddresses, buy, pricing }: Props) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [addressId, setAddressId] = useState(initialAddresses[0]?.id ?? "");
  const [editing, setEditing] = useState<"address" | "payment" | null>(initialAddresses.length ? "payment" : "address");
  const [showNewAddress, setShowNewAddress] = useState(initialAddresses.length === 0);
  const [addrErrors, setAddrErrors] = useState<FieldErrors>({});
  const [card, setCard] = useState<Card>(EMPTY_CARD);
  const [cardOk, setCardOk] = useState(false);
  const [cardErrors, setCardErrors] = useState<FieldErrors>({});
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [savingAddress, startSaving] = useTransition();

  const address = addresses.find((a) => a.id === addressId);
  const subtotal = lines.reduce((s, l) => s + l.priceCents * l.quantity, 0);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const shipping = delivery === "express" ? pricing.expressFeeCents : subtotal >= pricing.freeThresholdCents ? 0 : pricing.standardFeeCents;
  const tax = Math.round(subtotal * pricing.taxRate);
  const total = subtotal + shipping + tax;
  const stockProblem = lines.find((l) => l.quantity > l.stock);
  const ready = !!address && cardOk && !stockProblem;

  function saveAddress(form: HTMLFormElement) {
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const parsed = addressSchema.safeParse(data);
    if (!parsed.success) {
      setAddrErrors(toFieldErrors(parsed.error));
      return;
    }
    startSaving(async () => {
      const res = await addAddress(data);
      if (!res.ok) {
        setAddrErrors(res.fieldErrors);
        return;
      }
      setAddresses((a) => [...a, res.address]);
      setAddressId(res.address.id);
      setAddrErrors({});
      setShowNewAddress(false);
      setEditing(cardOk ? null : "payment");
    });
  }

  function savePayment(c = card) {
    const parsed = cardSchema.safeParse(c);
    if (!parsed.success) {
      setCardErrors(toFieldErrors(parsed.error));
      setCardOk(false);
      return;
    }
    setCardErrors({});
    setCardOk(true);
    setEditing(address ? null : "address");
  }

  function submit() {
    if (!ready || pending) return;
    setError(null);
    start(async () => {
      const res = await placeOrder({ checkoutKey, addressId, deliveryOption: delivery, card, buy });
      if (res && !res.ok) setError(res.error);
    });
  }

  const summary = (
    <div className="card space-y-2 p-4 text-sm">
      <button type="button" onClick={submit} disabled={!ready || pending} className="btn-buy w-full">
        {pending ? "Placing your order…" : "Place your order"}
      </button>
      {!ready && (
        <p className="text-center text-xs text-text-secondary">
          {stockProblem ? "Update quantities in your cart to continue." : !address ? "Add a delivery address to continue." : "Add a payment method to continue."}
        </p>
      )}
      <hr className="border-border" />
      <h2 className="text-lg font-bold">Order Summary</h2>
      <dl className="space-y-1">
        <div className="flex justify-between"><dt>Items ({itemCount}):</dt><dd>{formatMoney(subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Shipping &amp; handling:</dt><dd>{shipping === 0 ? "FREE" : formatMoney(shipping)}</dd></div>
        <div className="flex justify-between"><dt>Estimated tax (8%):</dt><dd>{formatMoney(tax)}</dd></div>
        <div className="flex justify-between border-t border-border pt-2 text-lg font-bold text-[#b12704]"><dt>Order total:</dt><dd>{formatMoney(total)}</dd></div>
      </dl>
    </div>
  );

  return (
    <div className="mx-auto grid w-full max-w-[1150px] gap-6 px-4 py-4 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0">
        {error && (
          <div role="alert" className="mb-3 rounded-lg border border-deal bg-[#fff5f6] p-3 text-sm text-deal">{error}</div>
        )}

        <Section
          n={1}
          title={editing === "address" ? "Choose a delivery address" : "Delivering to"}
          done={!!address}
          editing={editing === "address"}
          onEdit={() => setEditing("address")}
          summary={address ? <p>{address.fullName}, {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.zip}</p> : <p className="text-deal">No address yet</p>}
        >
          {addresses.length > 0 && (
            <fieldset className="card mb-3 divide-y divide-border">
              <legend className="sr-only">Saved addresses</legend>
              {addresses.map((a) => (
                <label key={a.id} className={cn("flex cursor-pointer gap-3 p-3 text-sm", a.id === addressId && "bg-[#fcf5ee]")}>
                  <input type="radio" name="address" checked={a.id === addressId} onChange={() => setAddressId(a.id)} className="mt-1 accent-[#e77600]" />
                  <span>
                    <b>{a.fullName}</b> {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state}, {a.zip}
                    <span className="block text-text-secondary">Phone: {a.phone}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          )}
          {showNewAddress ? (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                saveAddress(e.currentTarget);
              }}
              className="card grid gap-3 p-4 sm:grid-cols-2"
            >
              <h3 className="font-bold sm:col-span-2">Add a new address</h3>
              <div className="sm:col-span-2"><Field id="fullName" name="fullName" label="Full name" autoComplete="name" error={addrErrors.fullName} /></div>
              <div className="sm:col-span-2"><Field id="line1" name="line1" label="Street address" autoComplete="address-line1" error={addrErrors.line1} /></div>
              <div className="sm:col-span-2"><Field id="line2" name="line2" label="Apt, suite, unit (optional)" autoComplete="address-line2" error={addrErrors.line2} /></div>
              <Field id="city" name="city" label="City" autoComplete="address-level2" error={addrErrors.city} />
              <Field id="state" name="state" label="State" maxLength={2} placeholder="WA" autoComplete="address-level1" error={addrErrors.state} />
              <Field id="zip" name="zip" label="ZIP code" inputMode="numeric" autoComplete="postal-code" error={addrErrors.zip} />
              <Field id="phone" name="phone" label="Phone number" type="tel" autoComplete="tel" error={addrErrors.phone} />
              <div className="flex gap-2 sm:col-span-2">
                <button disabled={savingAddress} className="btn-cart">{savingAddress ? "Saving…" : "Use this address"}</button>
                {addresses.length > 0 && (
                  <button type="button" onClick={() => setShowNewAddress(false)} className="btn-secondary">Cancel</button>
                )}
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap gap-3">
              {address && <button type="button" onClick={() => setEditing(cardOk ? null : "payment")} className="btn-cart">Use this address</button>}
              <button type="button" onClick={() => setShowNewAddress(true)} className="link text-sm">+ Add a new address</button>
            </div>
          )}
        </Section>

        <Section
          n={2}
          title={editing === "payment" ? "Payment method" : "Paying with"}
          done={cardOk}
          editing={editing === "payment"}
          onEdit={() => setEditing("payment")}
          summary={
            cardOk ? (
              <p className="flex items-center gap-2"><CreditCard className="h-4 w-4" aria-hidden /> {cardBrand(card.number)} ending in {card.number.replace(/\D/g, "").slice(-4)}</p>
            ) : (
              <button type="button" onClick={() => setEditing("payment")} className="link">Add a payment method</button>
            )
          }
        >
          <p className="mb-3 flex items-start gap-2 rounded-md border border-[#8c9eff] bg-[#f3f5ff] p-2 text-xs">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span><b>Demo checkout, no real payment.</b> No card is charged and card details are never stored; only the last 4 digits are kept on the order.</span>
          </p>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              savePayment();
            }}
            className="card grid gap-3 p-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2"><Field id="cc-name" label="Name on card" autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} error={cardErrors.name} /></div>
            <div className="sm:col-span-2">
              <Field
                id="cc-number"
                label="Card number"
                inputMode="numeric"
                autoComplete="cc-number"
                value={card.number}
                onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d ]/g, "").slice(0, 23) })}
                error={cardErrors.number}
              />
            </div>
            <Field id="cc-exp" label="Expiry (MM/YY)" placeholder="MM/YY" autoComplete="cc-exp" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value.slice(0, 5) })} error={cardErrors.exp} />
            <Field id="cc-cvc" label="Security code (CVC)" inputMode="numeric" autoComplete="cc-csc" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} error={cardErrors.cvc} />
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button className="btn-cart">Use this payment method</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const c = TEST_CARD(address?.fullName ?? "");
                  setCard(c);
                  savePayment(c);
                }}
              >
                Use test card
              </button>
            </div>
          </form>
        </Section>

        <section aria-labelledby="sec-3" className="py-4">
          <div className="flex gap-4">
            <span className="text-lg font-bold">3</span>
            <div className="min-w-0 flex-1">
              <h2 id="sec-3" className="text-lg font-bold">Review items and delivery</h2>
              <div className="card mt-3 p-4">
                <fieldset>
                  <legend className="mb-2 text-sm font-bold">Choose your delivery speed:</legend>
                  {(["standard", "express"] as const).map((opt) => {
                    const fee = opt === "express" ? pricing.expressFeeCents : subtotal >= pricing.freeThresholdCents ? 0 : pricing.standardFeeCents;
                    return (
                      <label key={opt} className="flex cursor-pointer items-start gap-2 py-1 text-sm">
                        <input type="radio" name="delivery" checked={delivery === opt} onChange={() => setDelivery(opt)} className="mt-1 accent-[#e77600]" />
                        <span>
                          <b className="text-in-stock">{opt === "express" ? pricing.expressDate : pricing.standardDate}</b>
                          <span className="block text-text-secondary">
                            {fee === 0 ? "FREE" : formatMoney(fee)} {opt === "express" ? "Express Delivery" : "Standard Delivery"}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
                <ul className="mt-3 divide-y divide-border border-t border-border">
                  {lines.map((l) => (
                    <li key={l.productId} className="flex gap-3 py-3">
                      <span className="relative h-20 w-20 shrink-0 bg-[#f7f7f7]">
                        <Image src={l.thumbnail} alt={l.title} fill sizes="80px" className="object-contain mix-blend-multiply" />
                      </span>
                      <div className="min-w-0 text-sm">
                        <Link href={`/dp/${l.slug}`} className="line-clamp-2 font-bold hover:text-link-hover">{l.title}</Link>
                        <p className="font-bold text-[#b12704]">{formatMoney(l.priceCents)}</p>
                        <p>Qty: {l.quantity}</p>
                        {l.quantity > l.stock && (
                          <p className="text-deal">{l.stock > 0 ? `Only ${l.stock} left in stock.` : "Currently unavailable."}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 hidden items-center gap-4 rounded-lg border border-border p-4 lg:flex">
                <button type="button" onClick={submit} disabled={!ready || pending} className="btn-buy shrink-0">
                  {pending ? "Placing your order…" : "Place your order"}
                </button>
                <p className="text-lg font-bold text-[#b12704]">Order total: {formatMoney(total)}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <aside className="lg:sticky lg:top-4 lg:self-start" aria-label="Order summary">{summary}</aside>
    </div>
  );
}
