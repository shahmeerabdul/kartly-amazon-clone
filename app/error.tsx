"use client";

import Link from "next/link";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-text-secondary">We hit a problem loading this page. Please try again.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={retry} className="btn-cart">Try again</button>
        <Link href="/" className="btn-secondary">Go to homepage</Link>
      </div>
    </div>
  );
}
