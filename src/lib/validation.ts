import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
});

const sourceSchema = z.object({
  url: z.string().trim().url("Source must be a valid URL"),
  notes: z.string().trim().optional().or(z.literal("")),
});

export const recipeSchema = z.object({
  categoryId: z.string().trim().min(1, "Category is required"),
  title: z.string().trim().min(1, "Title is required"),
  notes: z.string().trim().optional().or(z.literal("")),
  rating: z
    .union([z.literal(""), z.coerce.number().int().min(1).max(5)])
    .optional(),
  sources: z.array(sourceSchema).min(1, "At least one source URL is required"),
});

export type RecipeInput = z.infer<typeof recipeSchema>;
