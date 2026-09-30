export default function Loading() {
  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-4 py-6 md:grid-cols-2 lg:grid-cols-[5fr_4fr_260px]" aria-busy="true" aria-label="Loading product">
      <div className="aspect-square animate-pulse rounded bg-[#eee]" />
      <div className="space-y-3">
        <div className="h-7 w-5/6 animate-pulse rounded bg-[#eee]" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-[#eee]" />
        <div className="h-10 w-1/4 animate-pulse rounded bg-[#eee]" />
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-[#eee]" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-lg bg-[#eee]" />
    </div>
  );
}
