import { z } from "zod";
import { DIFFICULTIES } from "../models/Recipe.js";

export const ALLOWED_SORT_FIELDS = ["createdAt", "title", "prepMinutes", "publishedAt"] as const;

// Query string: todo llega como texto, por eso coerce. "true"/"false" se convierten a mano
// (z.coerce.boolean() convierte "false" en true).
const booleanFromQuery = z.enum(["true", "false"]).transform((value) => value === "true");

export const listRecipesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
  sortBy: z.enum(ALLOWED_SORT_FIELDS, { error: `sortBy debe ser: ${ALLOWED_SORT_FIELDS.join(", ")}` }).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"], { error: "sortOrder debe ser asc o desc" }).default("desc"),
  search: z.string().trim().min(1).max(120).optional(),
  difficulty: z.enum(DIFFICULTIES, { error: "La dificultad debe ser facil, media o dificil" }).optional(),
  vegetarian: booleanFromQuery.optional(),
  maxMinutes: z.coerce.number().int().min(1).optional(),
});

export const createRecipeSchema = z.object({
  title: z
    .string({ error: "El titulo es obligatorio" })
    .trim()
    .min(3, { error: "El titulo debe tener al menos 3 caracteres" })
    .max(120, { error: "El titulo no puede superar los 120 caracteres" }),
  description: z
    .string({ error: "La descripcion es obligatoria" })
    .trim()
    .min(10, { error: "La descripcion debe tener al menos 10 caracteres" })
    .max(2000, { error: "La descripcion no puede superar los 2000 caracteres" }),
  ingredients: z
    .array(z.string().trim().min(1, { error: "Un ingrediente no puede estar vacio" }), {
      error: "Los ingredientes deben ser una lista de textos",
    })
    .min(1, { error: "Debe tener al menos un ingrediente" })
    .max(50, { error: "Maximo 50 ingredientes" }),
  prepMinutes: z
    .number({ error: "El tiempo de preparacion debe ser un numero" })
    .int({ error: "El tiempo debe ser un numero entero" })
    .min(1, { error: "El tiempo minimo es 1 minuto" })
    .max(1440, { error: "El tiempo maximo es 1440 minutos" }),
  servings: z
    .number({ error: "Las porciones deben ser un numero" })
    .int({ error: "Las porciones deben ser un numero entero" })
    .min(1, { error: "Debe rendir al menos 1 porcion" })
    .max(100, { error: "Maximo 100 porciones" }),
  difficulty: z.enum(DIFFICULTIES, { error: "La dificultad debe ser facil, media o dificil" }).optional(),
  vegetarian: z.boolean({ error: "vegetarian debe ser true o false" }).optional(),
  // Acepta "2026-11-20" o un ISO completo.
  publishedAt: z.coerce.date({ error: "La fecha de publicacion no es valida" }).optional(),
});

// PUT/PATCH: los mismos campos, todos opcionales, pero al menos uno.
export const updateRecipeSchema = createRecipeSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { error: "Hay que enviar al menos un campo para editar" });

export type ListRecipesInput = z.infer<typeof listRecipesSchema>;
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
