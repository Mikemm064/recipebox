import {
  getCategories,
  getCategory,
  getRecipe as getRecipeById,
  getRecipesByCategory,
  searchRecipes,
} from "@/src/lib/stubData";

export async function globalSearch(query: string) {
  return searchRecipes(query);
}

export async function getSidebarCategories() {
  return getCategories().map((category) => ({
    ...category,
    count: getRecipesByCategory(category.id).length,
  }));
}

export async function getRecentRecipes() {
  return getCategories()
    .flatMap((category) =>
      getRecipesByCategory(category.id).map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        updatedAt: recipe.updatedAt,
        categoryName: category.name,
      })),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 10);
}

export async function getCategoryWithRecipes(id: string) {
  const category = getCategory(id);
  if (!category) return null;

  return {
    category,
    items: getRecipesByCategory(id),
  };
}

export async function getRecipe(id: string) {
  return getRecipeById(id);
}

export async function getAllCategories() {
  return getCategories();
}
