import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`nav-item flex h-[50px] shrink-0 items-center px-2 ${className}`} aria-label="Kartly home">
      <span className="-mt-1 text-[28px] font-bold tracking-tight">kartly</span>
      <span className="-mt-1 text-[28px] font-bold text-accent">.</span>
    </Link>
  );
}
