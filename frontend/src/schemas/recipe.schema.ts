import { z } from "zod";
import { DIFFICULTIES, type Recipe, type RecipePayload } from "../types/recipe";

// Schema del FORMULARIO (lo que tipea el usuario). Las mismas reglas que el backend
// (backend/src/schemas/recipe.schema.ts), pero los ingredientes van en un textarea, uno por linea.
const numberField = (label: string, max: number) =>
  z
    .number({ error: `${label} debe ser un número` })
    .int({ error: `${label} debe ser un número entero` })
    .min(1, { error: `${label} debe ser al menos 1` })
    .max(max, { error: `${label} no puede superar ${max}` });

export const recipeFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { error: "El título debe tener al menos 3 caracteres" })
    .max(120, { error: "El título no puede superar los 120 caracteres" }),
  description: z
    .string()
    .trim()
    .min(10, { error: "La descripción debe tener al menos 10 caracteres" })
    .max(2000, { error: "La descripción no puede superar los 2000 caracteres" }),
  ingredientsText: z.string().refine((text) => splitLines(text).length > 0, {
    error: "Cargá al menos un ingrediente (uno por línea)",
  }),
  prepMinutes: numberField("El tiempo", 1440),
  servings: numberField("Las porciones", 100),
  difficulty: z.enum(DIFFICULTIES, { error: "Elegí una dificultad" }),
  vegetarian: z.boolean(),
  publishedAt: z.iso.date({ error: "Elegí una fecha válida" }),
});

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;

function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

// Fecha local (no UTC): a la noche en Argentina toISOString() ya devuelve el dia siguiente.
const today = () => new Date().toLocaleDateString("sv-SE"); // formato YYYY-MM-DD

export const emptyRecipe = (): RecipeFormValues => ({
  title: "",
  description: "",
  ingredientsText: "",
  prepMinutes: 30,
  servings: 4,
  difficulty: "media",
  vegetarian: false,
  publishedAt: today(),
});

export const toRecipeFormValues = (recipe: Recipe): RecipeFormValues => ({
  title: recipe.title,
  description: recipe.description,
  ingredientsText: recipe.ingredients.join("\n"),
  prepMinutes: recipe.prepMinutes,
  servings: recipe.servings,
  difficulty: recipe.difficulty,
  vegetarian: recipe.vegetarian,
  publishedAt: recipe.publishedAt.slice(0, 10),
});

export const toRecipePayload = ({ ingredientsText, ...rest }: RecipeFormValues): RecipePayload => ({
  ...rest,
  ingredients: splitLines(ingredientsText),
});
