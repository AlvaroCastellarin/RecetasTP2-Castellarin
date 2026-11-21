import { Schema, model, Document, Model, Types } from "mongoose";

export const DIFFICULTIES = ["facil", "media", "dificil"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface IRecipe {
  title: string; // texto
  description: string; // texto
  ingredients: string[]; // lista de textos
  prepMinutes: number; // numero
  servings: number; // numero
  difficulty: Difficulty; // texto (enum)
  vegetarian: boolean; // booleano
  publishedAt: Date; // fecha
  createdBy?: string; // id del usuario (Better Auth) que la cargo
}

export interface IRecipeDocument extends IRecipe, Document {
  _id: Types.ObjectId;
}

const recipeSchema = new Schema<IRecipeDocument>(
  {
    title: {
      type: String,
      required: [true, "El titulo es obligatorio"],
      trim: true,
      maxlength: [120, "El titulo no puede superar los 120 caracteres"],
    },
    description: {
      type: String,
      required: [true, "La descripcion es obligatoria"],
      trim: true,
      maxlength: [2000, "La descripcion no puede superar los 2000 caracteres"],
    },
    ingredients: {
      type: [String],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "Debe tener al menos un ingrediente",
      },
    },
    prepMinutes: {
      type: Number,
      required: [true, "El tiempo de preparacion es obligatorio"],
      min: [1, "El tiempo minimo es 1 minuto"],
    },
    servings: {
      type: Number,
      required: [true, "Las porciones son obligatorias"],
      min: [1, "Debe rendir al menos 1 porcion"],
    },
    difficulty: {
      type: String,
      enum: DIFFICULTIES,
      default: "media",
    },
    vegetarian: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: () => new Date(),
    },
    createdBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indice de texto liviano para ordenar/buscar por titulo.
recipeSchema.index({ title: 1 });

const Recipe: Model<IRecipeDocument> = model<IRecipeDocument>("Recipe", recipeSchema);

export default Recipe;
