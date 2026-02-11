import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/src/db/client";
import { categories, recipes } from "@/src/db/schema";
import { getRecentRecipes } from "@/src/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const recent = await getRecentRecipes();
  const cats = await db
    .select({ id: categories.id, name: categories.name, total: count(recipes.id) })
    .from(categories)
    .leftJoin(recipes, eq(recipes.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.name);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">Recently Updated</h1>
        <div className="mt-3 space-y-2">
          {recent.map((item) => (
            <Link key={item.id} href={`/recipes/${item.id}`} className="block rounded-md border border-slate-200 bg-white p-3">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-slate-500">{item.categoryName}</p>
            </Link>
          ))}
          {recent.length === 0 && <p className="text-slate-500">No dishes yet.</p>}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Categories</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((category) => (
            <Link key={category.id} href={`/categories/${category.id}`} className="rounded-md border border-slate-200 bg-white p-4">
              <p className="font-medium">{category.name}</p>
              <p className="text-sm text-slate-500">{category.total} dishes</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
