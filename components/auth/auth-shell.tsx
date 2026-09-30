import Link from "next/link";

// Minimal Amazon-style auth layout: wordmark, a bordered card, and a quiet footer.
export function AuthShell({ title, children, below }: { title: string; children: React.ReactNode; below?: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center bg-white px-4 py-6">
      <Link href="/" className="mb-4 flex items-baseline text-text" aria-label="Kartly home">
        <span className="text-3xl font-bold tracking-tight">kartly</span>
        <span className="text-3xl font-bold text-accent">.</span>
      </Link>
      <div className="w-full max-w-[350px] rounded-lg border border-border px-6 py-5">
        <h1 className="mb-3 text-[28px] font-normal">{title}</h1>
        {children}
      </div>
      {below && <div className="mt-5 w-full max-w-[350px]">{below}</div>}
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-deal">
      <span aria-hidden>! </span>
      {message}
    </p>
  );
}
