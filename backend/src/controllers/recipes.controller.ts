// Controller = capa HTTP: lee req, llama al service y traduce el resultado a status + JSON.
import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import * as recipesService from "../services/recipes.service.js";
import { CreateRecipeInput, listRecipesSchema, UpdateRecipeInput } from "../schemas/recipe.schema.js";
import { sendValidationError } from "../middlewares/validate.js";

function sendError(res: Response, status: number, message: string): void {
  res.status(status).json({ success: false, error: { message } });
}

function isMongooseValidationError(error: unknown): error is Error {
  return error instanceof Error && error.name === "ValidationError";
}

// GET /api/recipes?search=pollo&difficulty=facil&vegetarian=true&maxMinutes=30&page=1&limit=9
export async function listRecipes(req: Request, res: Response): Promise<void> {
  // En Express 5 req.query es de solo lectura: se valida aca en vez de en un middleware.
  const parsed = listRecipesSchema.safeParse(req.query);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  try {
    res.status(200).json(await recipesService.listRecipes(parsed.data));
  } catch (error) {
    console.error("[recipes] error listing:", error);
    sendError(res, 500, "No se pudieron obtener las recetas");
  }
}

// GET /api/recipes/:id
export async function getRecipeById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    sendError(res, 400, "El id enviado no es valido");
    return;
  }

  try {
    const recipe = await recipesService.findRecipeById(id);
    if (!recipe) {
      sendError(res, 404, "Receta no encontrada");
      return;
    }
    res.status(200).json(recipe);
  } catch (error) {
    console.error("[recipes] error fetching by id:", error);
    sendError(res, 500, "No se pudo obtener la receta");
  }
}

// POST /api/recipes (admin)
export async function createRecipe(req: Request<{}, {}, CreateRecipeInput>, res: Response): Promise<void> {
  try {
    const recipe = await recipesService.createRecipe(req.body, req.user!.id);
    res.status(201).json(recipe);
  } catch (error) {
    if (isMongooseValidationError(error)) {
      sendError(res, 400, error.message);
      return;
    }
    console.error("[recipes] error creating:", error);
    sendError(res, 500, "No se pudo crear la receta");
  }
}

// PUT / PATCH /api/recipes/:id (admin)
export async function updateRecipe(req: Request<{ id: string }, {}, UpdateRecipeInput>, res: Response): Promise<void> {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    sendError(res, 400, "El id enviado no es valido");
    return;
  }

  try {
    const recipe = await recipesService.updateRecipe(id, req.body);
    if (!recipe) {
      sendError(res, 404, "Receta no encontrada");
      return;
    }
    res.status(200).json(recipe);
  } catch (error) {
    if (isMongooseValidationError(error)) {
      sendError(res, 400, error.message);
      return;
    }
    console.error("[recipes] error updating:", error);
    sendError(res, 500, "No se pudo actualizar la receta");
  }
}

// DELETE /api/recipes/:id (admin)
export async function deleteRecipe(req: Request<{ id: string }>, res: Response): Promise<void> {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    sendError(res, 400, "El id enviado no es valido");
    return;
  }

  try {
    const recipe = await recipesService.deleteRecipe(id);
    if (!recipe) {
      sendError(res, 404, "Receta no encontrada");
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("[recipes] error deleting:", error);
    sendError(res, 500, "No se pudo eliminar la receta");
  }
}
