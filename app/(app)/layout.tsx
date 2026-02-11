import Link from "next/link";
import type { ReactNode } from "react";
import { SearchBar } from "@/src/components/SearchBar";
import { createCategoryAction, logoutAction } from "@/src/lib/actions";
import { getSidebarCategories } from "@/src/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AppLayout({ children }: { children: ReactNode }) {
  const categories = await getSidebarCategories();

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-r border-slate-200 bg-white p-4">
        <Link href="/" className="text-xl font-semibold">RecipeBox</Link>
        <div className="mt-4 space-y-2">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.id}`} className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-slate-100">
              <span>{category.name}</span>
              <span className="text-xs text-slate-500">{category.count}</span>
            </Link>
          ))}
          {categories.length === 0 && <p className="text-sm text-slate-500">No categories yet.</p>}
        </div>
        <form action={createCategoryAction} className="mt-4 flex gap-2">
          <input name="name" placeholder="Add category" className="w-full" required />
          <button className="bg-slate-900 text-white">Add</button>
        </form>
      </aside>

      <div>
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white p-4">
          <SearchBar />
          <Link href="/recipes/new" className="rounded-md bg-slate-900 px-3 py-2 text-white">New Dish</Link>
          <form action={logoutAction}>
            <button className="bg-slate-200">Logout</button>
          </form>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
