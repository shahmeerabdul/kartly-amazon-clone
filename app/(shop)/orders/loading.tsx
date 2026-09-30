export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[920px] space-y-5 px-4 py-5" aria-busy="true" aria-label="Loading orders">
      <div className="h-8 w-48 animate-pulse rounded bg-[#eee]" />
      {[0, 1].map((i) => (
        <div key={i} className="h-56 animate-pulse rounded-lg bg-[#eee]" />
      ))}
    </div>
  );
}
