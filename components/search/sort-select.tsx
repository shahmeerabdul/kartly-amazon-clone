"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SORTS, type SortKey } from "@/lib/search-sorts";

export function SortSelect({ value }: { value: SortKey }) {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-text-secondary">Sort by:</span>
      <select
        value={value}
        onChange={(e) => {
          const sp = new URLSearchParams(params);
          if (e.target.value === "featured") sp.delete("sort");
          else sp.set("sort", e.target.value);
          sp.delete("page");
          router.push(`/s?${sp.toString()}`);
        }}
        className="cursor-pointer rounded-lg border border-border bg-[#f0f2f2] px-2 py-1 shadow-sm hover:bg-[#e3e6e6]"
      >
        {Object.entries(SORTS).map(([k, label]) => (
          <option key={k} value={k}>{label}</option>
        ))}
      </select>
    </label>
  );
}
