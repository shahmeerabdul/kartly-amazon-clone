export default function Loading() {
  return (
    <div className="bg-page-bg py-5" aria-busy="true" aria-label="Loading cart">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-4 lg:flex-row">
        <div className="flex-1 space-y-4 bg-white p-5">
          <div className="h-8 w-56 animate-pulse rounded bg-[#eee]" />
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-44 w-44 animate-pulse rounded bg-[#eee]" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 animate-pulse rounded bg-[#eee]" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-[#eee]" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-40 w-full animate-pulse bg-white lg:w-[300px]" />
      </div>
    </div>
  );
}
