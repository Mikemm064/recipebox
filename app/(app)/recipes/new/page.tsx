import { RecipeForm } from "@/src/components/RecipeForm";
import { createRecipeAction } from "@/src/lib/actions";
import { getAllCategories } from "@/src/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewRecipePage({ searchParams }: { searchParams: Promise<{ categoryId?: string }> }) {
  const categories = await getAllCategories();
  const { categoryId } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl rounded-md border border-slate-200 bg-white p-4">
      <h1 className="mb-4 text-2xl font-semibold">New Dish</h1>
      <RecipeForm
        categories={categories}
        defaultValues={{ categoryId: categoryId ?? "", title: "", notes: "", sources: [{ url: "", notes: "" }] }}
        action={createRecipeAction}
      />
    </div>
  );
}
