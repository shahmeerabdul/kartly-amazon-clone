"use client";

import { useFormStatus } from "react-dom";
import { demoSignInAction } from "@/lib/actions/auth";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="btn-secondary w-full">
      {pending ? "Signing in…" : "Try the demo account"}
    </button>
  );
}

export function DemoButton({ callbackUrl }: { callbackUrl: string }) {
  return (
    <form action={demoSignInAction}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <Submit />
    </form>
  );
}
