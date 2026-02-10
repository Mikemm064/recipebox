"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

type SearchResult = {
  id: string;
  title: string;
  categoryName: string;
};

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "/" && (event.target as HTMLElement)?.tagName !== "INPUT" && (event.target as HTMLElement)?.tagName !== "TEXTAREA") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) return;
        const data = (await response.json()) as SearchResult[];
        setResults(data);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-lg">
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search dishes (/)..."
        className="w-full"
      />
      {(isPending || results.length > 0) && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-md">
          {isPending && <p className="p-2 text-sm text-slate-500">Searching...</p>}
          {!isPending && results.length === 0 && <p className="p-2 text-sm text-slate-500">No matches.</p>}
          {results.map((item) => (
            <Link key={item.id} href={`/recipes/${item.id}`} className="block border-b border-slate-100 p-2 last:border-none hover:bg-slate-50" onClick={() => setQuery("")}>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-slate-500">{item.categoryName}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
