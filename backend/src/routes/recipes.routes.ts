// Mapeo (metodo HTTP + ruta) → controller. Sin logica de negocio.
import { Router } from "express";
import {
  listRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "../controllers/recipes.controller.js";
import { validateBody } from "../middlewares/validate.js";
import { createRecipeSchema, updateRecipeSchema } from "../schemas/recipe.schema.js";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();
const onlyAdmin = [authMiddleware, requireRole("admin")];

// Lectura: cualquier usuario logueado (401 sin sesion)
router.get("/", authMiddleware, listRecipes);
router.get("/:id", authMiddleware, getRecipeById);

// Escritura: solo admin (401 sin sesion, 403 sin rol admin, 400 si Zod rechaza el body)
router.post("/", onlyAdmin, validateBody(createRecipeSchema), createRecipe);
router.put("/:id", onlyAdmin, validateBody(updateRecipeSchema), updateRecipe);
router.patch("/:id", onlyAdmin, validateBody(updateRecipeSchema), updateRecipe);
router.delete("/:id", onlyAdmin, deleteRecipe);

export default router;
