// Misma forma que IRecipe en el backend (backend/src/models/Recipe.ts).
export const DIFFICULTIES = ["facil", "media", "dificil"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  facil: "Fácil",
  media: "Media",
  dificil: "Difícil",
};

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: string[];
  prepMinutes: number;
  servings: number;
  difficulty: Difficulty;
  vegetarian: boolean;
  publishedAt: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Envelope de los listados paginados del backend: { data, meta }.
export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// Query string de GET /api/recipes
export interface RecipeFilters {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: Difficulty;
  vegetarian?: boolean;
  maxMinutes?: number;
  sortBy?: "createdAt" | "title" | "prepMinutes" | "publishedAt";
  sortOrder?: "asc" | "desc";
}

// Body de POST / PUT
export interface RecipePayload {
  title: string;
  description: string;
  ingredients: string[];
  prepMinutes: number;
  servings: number;
  difficulty: Difficulty;
  vegetarian: boolean;
  publishedAt: string;
}
