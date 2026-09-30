"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signInAction, type AuthState } from "@/lib/actions/auth";
import { FieldError } from "@/components/auth/auth-shell";

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action, pending] = useActionState(signInAction, {} as AuthState);
  const [editingEmail, setEditingEmail] = useState(false);
  const step = editingEmail ? "email" : (state.step ?? "email");

  return (
    <form action={action} onSubmit={() => setEditingEmail(false)} className="space-y-3" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <input type="hidden" name="step" value={step} />
      {step === "email" ? (
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-bold">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            defaultValue={state.email}
            aria-invalid={!!state.error}
            aria-describedby={state.error ? "signin-error" : undefined}
            className="input w-full"
          />
          <FieldError id="signin-error" message={state.error} />
        </div>
      ) : (
        <>
          <input type="hidden" name="email" value={state.email ?? ""} />
          <p className="text-sm">
            {state.email}{" "}
            <button type="button" className="link" onClick={() => setEditingEmail(true)}>Change</button>
          </p>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-bold">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              aria-invalid={!!state.error}
              aria-describedby={state.error ? "signin-error" : undefined}
              className="input w-full"
            />
            <FieldError id="signin-error" message={state.error} />
          </div>
        </>
      )}
      <button disabled={pending} className="btn-cart w-full">
        {pending ? "Please wait…" : step === "email" ? "Continue" : "Sign in"}
      </button>
      <p className="text-xs text-text-secondary">
        By continuing, you agree that this is a demo store and no real orders are fulfilled.
      </p>
      {step === "email" && (
        <p className="text-xs">
          New to Kartly?{" "}
          <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="link">Create your account</Link>
        </p>
      )}
    </form>
  );
}
