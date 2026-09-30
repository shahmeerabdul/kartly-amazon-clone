export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1000px] space-y-4 px-4 py-6" aria-busy="true" aria-label="Loading your account">
      <div className="h-8 w-48 animate-pulse rounded bg-[#eee]" />
      <div className="h-28 animate-pulse rounded-lg bg-[#eee]" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-[#eee]" />
        ))}
      </div>
    </div>
  );
}
