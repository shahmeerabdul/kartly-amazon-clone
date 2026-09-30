"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { changePassword, deleteAddress, saveAddress, setDefaultAddress, updateName, type FormState } from "@/lib/actions/account";

function Field({ id, name, label, error, ...rest }: { id: string; name: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-bold">{label}</label>
      <input id={id} name={name} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className="input w-full" {...rest} />
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-deal">{error}</p>}
    </div>
  );
}

function Message({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p role="status" className={`rounded-md p-2 text-sm ${state.ok ? "bg-[#f1f8f1] text-in-stock" : "bg-[#fff5f6] text-deal"}`}>
      {state.message}
    </p>
  );
}

export function NameForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(updateName, {} as FormState);
  return (
    <form action={action} className="space-y-3" noValidate>
      <Field id="name" name="name" label="Name" defaultValue={name} autoComplete="name" error={state.fieldErrors?.name} />
      <Message state={state} />
      <button disabled={pending} className="btn-cart">{pending ? "Saving…" : "Save changes"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {} as FormState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-3" noValidate>
      <Field id="current" name="current" type="password" label="Current password" autoComplete="current-password" error={state.fieldErrors?.current} />
      <Field id="password" name="password" type="password" label="New password" autoComplete="new-password" placeholder="At least 8 characters" error={state.fieldErrors?.password} />
      <Field id="confirm" name="confirm" type="password" label="Re-enter new password" autoComplete="new-password" error={state.fieldErrors?.confirm} />
      <Message state={state} />
      <button disabled={pending} className="btn-cart">{pending ? "Saving…" : "Change password"}</button>
    </form>
  );
}

type Address = { id: string; fullName: string; line1: string; line2: string | null; city: string; state: string; zip: string; phone: string; isDefault: boolean };

export function AddressForm({ address, onDone }: { address?: Address; onDone: () => void }) {
  const [state, action, pending] = useActionState(saveAddress, {} as FormState);
  const e = state.fieldErrors ?? {};
  const p = address?.id ?? "new";
  useEffect(() => {
    if (state.ok) {
      toast.success(state.message);
      onDone();
    }
  }, [state, onDone]);
  return (
    <form action={action} className="card grid gap-3 p-4 sm:grid-cols-2" noValidate>
      <h2 className="text-lg font-bold sm:col-span-2">{address ? "Edit address" : "Add a new address"}</h2>
      {address && <input type="hidden" name="id" value={address.id} />}
      <div className="sm:col-span-2"><Field id={`${p}-fullName`} name="fullName" label="Full name" defaultValue={address?.fullName} autoComplete="name" error={e.fullName} /></div>
      <div className="sm:col-span-2"><Field id={`${p}-line1`} name="line1" label="Street address" defaultValue={address?.line1} autoComplete="address-line1" error={e.line1} /></div>
      <div className="sm:col-span-2"><Field id={`${p}-line2`} name="line2" label="Apt, suite, unit (optional)" defaultValue={address?.line2 ?? ""} autoComplete="address-line2" error={e.line2} /></div>
      <Field id={`${p}-city`} name="city" label="City" defaultValue={address?.city} autoComplete="address-level2" error={e.city} />
      <Field id={`${p}-state`} name="state" label="State" maxLength={2} placeholder="WA" defaultValue={address?.state} autoComplete="address-level1" error={e.state} />
      <Field id={`${p}-zip`} name="zip" label="ZIP code" inputMode="numeric" defaultValue={address?.zip} autoComplete="postal-code" error={e.zip} />
      <Field id={`${p}-phone`} name="phone" label="Phone number" type="tel" defaultValue={address?.phone} autoComplete="tel" error={e.phone} />
      {!address?.isDefault && (
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="isDefault" className="accent-[#e77600]" /> Make this my default address
        </label>
      )}
      <div className="flex gap-2 sm:col-span-2">
        <button disabled={pending} className="btn-cart">{pending ? "Saving…" : address ? "Save changes" : "Add address"}</button>
        <button type="button" onClick={onDone} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(addresses.length ? null : "new");
  const [pending, start] = useTransition();
  const done = () => setEditing(null);

  if (editing) {
    return <AddressForm address={addresses.find((a) => a.id === editing)} onDone={done} />;
  }

  return (
    <ul className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${pending ? "opacity-60" : ""}`}>
      <li>
        <button type="button" onClick={() => setEditing("new")} className="flex h-full min-h-60 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#c7c7c7] text-text-secondary hover:bg-[#f7fafa]">
          <span className="text-5xl leading-none" aria-hidden>+</span>
          <span className="mt-2 text-lg font-bold">Add address</span>
        </button>
      </li>
      {addresses.map((a) => (
        <li key={a.id} className="card flex min-h-60 flex-col overflow-hidden">
          {a.isDefault && <p className="border-b border-border px-4 py-1.5 text-xs text-text-secondary">Default</p>}
          <div className="flex-1 p-4 text-sm">
            <p className="font-bold">{a.fullName}</p>
            <p>{a.line1}</p>
            {a.line2 && <p>{a.line2}</p>}
            <p>{a.city}, {a.state} {a.zip}</p>
            <p>United States</p>
            <p>Phone number: {a.phone}</p>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 pb-4 text-sm">
            <button type="button" className="link" onClick={() => setEditing(a.id)}>Edit</button>
            <span className="text-border" aria-hidden>|</span>
            <button
              type="button"
              className="link"
              onClick={() => {
                if (!confirm("Remove this address?")) return;
                start(async () => {
                  await deleteAddress(a.id);
                  toast.success("Address removed");
                });
              }}
            >
              Remove
            </button>
            {!a.isDefault && (
              <>
                <span className="text-border" aria-hidden>|</span>
                <button
                  type="button"
                  className="link"
                  onClick={() =>
                    start(async () => {
                      await setDefaultAddress(a.id);
                      toast.success("Default address updated");
                    })
                  }
                >
                  Set as Default
                </button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
