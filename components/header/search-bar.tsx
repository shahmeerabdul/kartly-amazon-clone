"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";
import { formatMoney } from "@/lib/format";

type Suggestion = { id: string; slug: string; title: string; thumbnail: string; priceCents: number };

export function SearchBar({ categories }: { categories: { slug: string; name: string }[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("k") ?? "");
  const [cat, setCat] = useState(params.get("cat") ?? "");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const boxRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const url = `/api/search/suggest?q=${encodeURIComponent(term)}${cat ? `&cat=${cat}` : ""}`;
        const res = await fetch(url, { signal: ctrl.signal });
        const data = (await res.json()) as { results: Suggestion[] };
        setResults(data.results);
        setActive(-1);
      } catch {
        // Aborted or offline: keep the previous suggestions.
      }
    }, 150);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, cat]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const shown = q.trim().length >= 2 ? results : [];
  const rows = shown.length ? shown.length + 1 : 0; // last row is "See all results"

  function submit() {
    setOpen(false);
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("k", q.trim());
    if (cat) sp.set("cat", cat);
    router.push(`/s?${sp.toString()}`);
  }

  function go(slug: string) {
    setOpen(false);
    router.push(`/dp/${slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!rows) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % rows);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? rows - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (e.key === "Enter" && open && active >= 0) {
      e.preventDefault();
      if (active < shown.length) go(shown[active].slug);
      else submit();
    }
  }

  return (
    <form
      ref={boxRef}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="relative flex h-10 w-full rounded-md focus-within:ring-[3px] focus-within:ring-accent"
    >
      <label htmlFor="search-cat" className="sr-only">
        Search in department
      </label>
      <select
        id="search-cat"
        value={cat}
        onChange={(e) => setCat(e.target.value)}
        className="hidden max-w-40 cursor-pointer rounded-l-md border-r border-border bg-[#e6e6e6] px-2 text-xs text-text-secondary hover:bg-[#d4d4d4] sm:block"
      >
        <option value="">All</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <label htmlFor="search-input" className="sr-only">
        Search Kartly
      </label>
      <input
        id="search-input"
        type="search"
        autoComplete="off"
        placeholder="Search Kartly"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={open && rows > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        className="min-w-0 flex-1 rounded-l-md bg-white px-3 text-[15px] text-text outline-none sm:rounded-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex w-12 items-center justify-center rounded-r-md bg-search-btn hover:bg-[#f3a847]"
      >
        <Search className="h-5 w-5 text-text" aria-hidden />
      </button>
      {open && rows > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-border bg-white text-text shadow-lg"
        >
          {shown.map((s, i) => (
            <li
              key={s.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={active === i}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                go(s.slug);
              }}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${active === i ? "bg-[#eef3f5]" : ""}`}
            >
              <span className="relative h-10 w-10 shrink-0 bg-[#f7f7f7]">
                <Image src={s.thumbnail} alt="" fill sizes="40px" className="object-contain mix-blend-multiply" />
              </span>
              <span className="line-clamp-1 flex-1 text-sm">{s.title}</span>
              <span className="text-sm font-bold">{formatMoney(s.priceCents)}</span>
            </li>
          ))}
          <li
            id={`${listId}-${shown.length}`}
            role="option"
            aria-selected={active === shown.length}
            onMouseEnter={() => setActive(shown.length)}
            onMouseDown={(e) => {
              e.preventDefault();
              submit();
            }}
            className={`cursor-pointer border-t border-border px-3 py-2 text-sm text-link ${active === shown.length ? "bg-[#eef3f5]" : ""}`}
          >
            See all results for &ldquo;<b>{q.trim()}</b>&rdquo;
          </li>
        </ul>
      )}
    </form>
  );
}
