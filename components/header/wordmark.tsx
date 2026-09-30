import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`nav-item flex items-baseline px-2 py-1 ${className}`} aria-label="Kartly home">
      <span className="text-2xl font-bold tracking-tight">kartly</span>
      <span className="text-2xl font-bold text-accent">.</span>
    </Link>
  );
}
