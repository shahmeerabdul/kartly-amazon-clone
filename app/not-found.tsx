import Link from "next/link";
import { Header } from "@/components/header/header";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Sorry, we couldn&apos;t find that page</h1>
          <p className="mt-2 text-text-secondary">Try searching, or head back to the homepage.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/" className="btn-cart">Go to homepage</Link>
            <Link href="/s" className="btn-secondary">Browse all products</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
