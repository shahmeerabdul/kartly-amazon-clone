import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">We couldn&apos;t find that product</h1>
      <p className="mt-2 text-text-secondary">It may have been removed, or the link may be mistyped.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/s" className="btn-cart">Browse all products</Link>
        <Link href="/" className="btn-secondary">Go to homepage</Link>
      </div>
    </div>
  );
}
