// Capa de servicio: logica de negocio y acceso a datos de recetas. No sabe nada de HTTP.
import { QueryFilter } from "mongoose";
import Recipe, { IRecipeDocument } from "../models/Recipe.js";
import { escapeRegex } from "../lib/escape-regex.js";
import { CreateRecipeInput, ListRecipesInput, UpdateRecipeInput } from "../schemas/recipe.schema.js";
import { Paginated } from "../types/pagination.types.js";

// El filtro se arma campo por campo desde input ya validado por Zod: nunca se pasa el input crudo
// a Mongo (eso permitiria inyectar operadores como { "$gt": "" }).
function buildFilter({ search, difficulty, vegetarian, maxMinutes }: ListRecipesInput): QueryFilter<IRecipeDocument> {
  const filter: QueryFilter<IRecipeDocument> = {};
  if (difficulty) filter.difficulty = difficulty;
  if (vegetarian !== undefined) filter.vegetarian = vegetarian;
  if (maxMinutes !== undefined) filter.prepMinutes = { $lte: maxMinutes };
  if (search) {
    const safe = escapeRegex(search);
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { description: { $regex: safe, $options: "i" } },
      { ingredients: { $regex: safe, $options: "i" } },
    ];
  }
  return filter;
}

export async function listRecipes(input: ListRecipesInput): Promise<Paginated<IRecipeDocument>> {
  const { page, limit, sortBy, sortOrder } = input;
  const filter = buildFilter(input);

  const [data, total] = await Promise.all([
    Recipe.find(filter)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Recipe.countDocuments(filter),
  ]);

  return { data, meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

export function findRecipeById(id: string): Promise<IRecipeDocument | null> {
  return Recipe.findById(id);
}

export function createRecipe(input: CreateRecipeInput, createdBy: string): Promise<IRecipeDocument> {
  return Recipe.create({ ...input, createdBy });
}

export function updateRecipe(id: string, input: UpdateRecipeInput): Promise<IRecipeDocument | null> {
  return Recipe.findByIdAndUpdate(id, input, { returnDocument: "after", runValidators: true });
}

export function deleteRecipe(id: string): Promise<IRecipeDocument | null> {
  return Recipe.findByIdAndDelete(id);
}
