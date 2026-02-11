"use client";

import { useMemo, useState } from "react";

type Category = { id: string; name: string };
type Source = { url: string; notes?: string | null };

type Props = {
  categories: Category[];
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: {
    id?: string;
    categoryId: string;
    title: string;
    notes?: string | null;
    sources: Source[];
  };
};

export function RecipeForm({ categories, action, defaultValues }: Props) {
  const [sources, setSources] = useState<Source[]>(defaultValues?.sources?.length ? defaultValues.sources : [{ url: "", notes: "" }]);
  const serializedSources = useMemo(() => JSON.stringify(sources), [sources]);

  return (
    <form action={action} className="space-y-4">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}
      <input type="hidden" name="sourcesJson" value={serializedSources} />
      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <select name="categoryId" defaultValue={defaultValues?.categoryId ?? ""} className="w-full" required>
          <option value="" disabled>Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input name="title" className="w-full" defaultValue={defaultValues?.title ?? ""} required />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Notes</label>
        <textarea name="notes" className="w-full" rows={4} defaultValue={defaultValues?.notes ?? ""} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Source links</h3>
          <button type="button" className="bg-slate-200" onClick={() => setSources((prev) => [...prev, { url: "", notes: "" }])}>Add source</button>
        </div>
        {sources.map((source, index) => (
          <div key={index} className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <input
                placeholder="https://..."
                value={source.url}
                onChange={(event) => setSources((prev) => prev.map((item, i) => i === index ? { ...item, url: event.target.value } : item))}
                required
              />
              <input
                placeholder="Link notes (optional)"
                value={source.notes ?? ""}
                onChange={(event) => setSources((prev) => prev.map((item, i) => i === index ? { ...item, notes: event.target.value } : item))}
              />
            </div>
            <button type="button" className="bg-red-100 text-red-700" onClick={() => setSources((prev) => prev.filter((_, i) => i !== index))} disabled={sources.length === 1}>Remove</button>
          </div>
        ))}
      </div>

      <button className="bg-slate-900 text-white">Save dish</button>
    </form>
  );
}
