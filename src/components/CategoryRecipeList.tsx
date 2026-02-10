"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Item = { id: string; title: string; notes: string | null };

export function CategoryRecipeList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          (item.notes ?? "").toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query],
  );

  return (
    <div className="space-y-4">
      <input placeholder="Filter in category..." value={query} onChange={(event) => setQuery(event.target.value)} className="w-full max-w-sm" />
      <div className="space-y-2">
        {filtered.map((item) => (
          <Link key={item.id} href={`/recipes/${item.id}`} className="block rounded-md border border-slate-200 bg-white p-3">
            <p className="font-medium">{item.title}</p>
            {item.notes && <p className="line-clamp-2 text-sm text-slate-500">{item.notes}</p>}
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-slate-500">No dishes in this category yet.</p>}
      </div>
    </div>
  );
}
