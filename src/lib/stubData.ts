export type Category = {
  id: string;
  name: string;
};

export type RecipeSource = {
  id: string;
  recipeId: string;
  url: string;
  notes: string | null;
};

export type Recipe = {
  id: string;
  categoryId: string;
  title: string;
  notes: string | null;
  updatedAt: string;
  lastCookedAt: string | null;
};

const categories: Category[] = [
  { id: "instapot", name: "InstaPot" },
  { id: "grill", name: "Grill" },
];

const recipes: Recipe[] = [
  {
    id: "pulled-pork",
    categoryId: "instapot",
    title: "Pulled Pork",
    notes: "Rub pork shoulder with brown sugar + spices, pressure cook 75 min, then shred and broil with sauce.",
    updatedAt: "2026-01-10T10:00:00.000Z",
    lastCookedAt: "2026-01-09T18:30:00.000Z",
  },
  {
    id: "swordfish-steaks",
    categoryId: "grill",
    title: "Swordfish",
    notes: "Pat dry, olive oil, salt, pepper, lemon zest. Grill 4-5 min per side until just opaque.",
    updatedAt: "2026-01-07T15:00:00.000Z",
    lastCookedAt: null,
  },
  {
    id: "instapot-rice",
    categoryId: "instapot",
    title: "Jasmine Rice",
    notes: "1:1 water ratio, 4 min high pressure, 10 min natural release.",
    updatedAt: "2026-01-05T12:00:00.000Z",
    lastCookedAt: "2026-01-08T12:00:00.000Z",
  },
];

const recipeSources: RecipeSource[] = [
  {
    id: "src-pork-1",
    recipeId: "pulled-pork",
    url: "https://www.seriouseats.com/easy-pressure-cooker-pork-shoulder-ragu-recipe",
    notes: "Good pressure timing reference",
  },
  {
    id: "src-pork-2",
    recipeId: "pulled-pork",
    url: "https://www.foodnetwork.com/recipes/pulled-pork-recipe",
    notes: "Sauce inspiration",
  },
  {
    id: "src-swordfish-1",
    recipeId: "swordfish-steaks",
    url: "https://www.bonappetit.com/recipe/grilled-swordfish-with-lemon-herb-sauce",
    notes: "Technique and doneness tips",
  },
  {
    id: "src-rice-1",
    recipeId: "instapot-rice",
    url: "https://www.pressurecookrecipes.com/instant-pot-rice/",
    notes: "Rice ratios and timing",
  },
];

export function getCategories() {
  return categories;
}

export function getCategory(id: string) {
  return categories.find((category) => category.id === id) ?? null;
}

export function getRecipesByCategory(categoryId: string) {
  return recipes
    .filter((recipe) => recipe.categoryId === categoryId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getRecipe(id: string) {
  const recipe = recipes.find((entry) => entry.id === id);
  if (!recipe) return null;

  const category = getCategory(recipe.categoryId);
  return {
    ...recipe,
    category: category ?? { id: recipe.categoryId, name: "Unknown" },
    sources: recipeSources.filter((source) => source.recipeId === recipe.id),
  };
}

export function searchRecipes(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return recipes
    .filter((recipe) => {
      const text = `${recipe.title} ${recipe.notes ?? ""}`.toLowerCase();
      return text.includes(normalized);
    })
    .map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      categoryName: getCategory(recipe.categoryId)?.name ?? "Unknown",
    }));
}
