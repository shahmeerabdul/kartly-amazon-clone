"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type AuthState } from "@/lib/actions/auth";
import { FieldError } from "@/components/auth/auth-shell";

const FIELDS = [
  { name: "name", label: "Your name", type: "text", autoComplete: "name", placeholder: "First and last name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password", placeholder: "At least 8 characters" },
  { name: "confirm", label: "Re-enter password", type: "password", autoComplete: "new-password" },
] as const;

export function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action, pending] = useActionState(registerAction, {} as AuthState);
  return (
    <form action={action} className="space-y-3" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      {FIELDS.map((f) => {
        const err = state.fieldErrors?.[f.name];
        return (
          <div key={f.name}>
            <label htmlFor={f.name} className="mb-1 block text-sm font-bold">{f.label}</label>
            <input
              id={f.name}
              name={f.name}
              type={f.type}
              autoComplete={f.autoComplete}
              placeholder={"placeholder" in f ? f.placeholder : undefined}
              defaultValue={f.name === "email" ? state.email : undefined}
              aria-invalid={!!err}
              aria-describedby={err ? `${f.name}-error` : undefined}
              className="input w-full"
            />
            <FieldError id={`${f.name}-error`} message={err} />
          </div>
        );
      })}
      {state.error && <p role="alert" className="text-xs text-deal">{state.error}</p>}
      <button disabled={pending} className="btn-cart w-full">{pending ? "Creating account…" : "Create your Kartly account"}</button>
      <p className="text-xs">
        Already have an account?{" "}
        <Link href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="link">Sign in</Link>
      </p>
    </form>
  );
}
