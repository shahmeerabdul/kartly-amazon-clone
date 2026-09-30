export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-4" aria-busy="true" aria-label="Loading results">
      <div className="mb-4 h-5 w-64 animate-pulse rounded bg-[#eee]" />
      <div className="flex gap-6">
        <div className="hidden w-60 shrink-0 space-y-3 md:block">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-[#eee]" style={{ width: `${60 + ((i * 17) % 40)}%` }} />
          ))}
        </div>
        <ul className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <li key={i} className="card p-3">
              <div className="aspect-square animate-pulse rounded bg-[#eee]" />
              <div className="mt-3 h-4 animate-pulse rounded bg-[#eee]" />
              <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-[#eee]" />
              <div className="mt-2 h-6 w-1/3 animate-pulse rounded bg-[#eee]" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
