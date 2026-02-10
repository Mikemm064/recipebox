import { notFound } from "next/navigation";
import { RecipeForm } from "@/src/components/RecipeForm";
import { updateRecipeAction } from "@/src/lib/actions";
import { getAllCategories, getRecipe } from "@/src/lib/data";

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [recipe, categories] = await Promise.all([getRecipe(id), getAllCategories()]);
  if (!recipe) notFound();

  return (
    <div className="mx-auto max-w-2xl rounded-md border border-slate-200 bg-white p-4">
      <h1 className="mb-4 text-2xl font-semibold">Edit Dish</h1>
      <RecipeForm
        categories={categories}
        defaultValues={{
          id: recipe.id,
          categoryId: recipe.categoryId,
          title: recipe.title,
          notes: recipe.notes,
          rating: recipe.rating,
          sources: recipe.sources.map((source) => ({ url: source.url, notes: source.notes })),
        }}
        action={updateRecipeAction}
      />
    </div>
  );
}
