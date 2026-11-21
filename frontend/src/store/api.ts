// RTK Query: estado del SERVIDOR (recetas). Cada endpoint genera un hook con cache incluida.
import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig } from "axios";
import { api as http, getErrorMessage } from "../lib/api";
import type { Paginated, Recipe, RecipeFilters, RecipePayload } from "../types/recipe";

// Usa la misma instancia de axios. El error se guarda ya como string, listo para mostrar.
const axiosBaseQuery: BaseQueryFn<AxiosRequestConfig, unknown, string> = async (config) => {
  try {
    const { data } = await http.request(config);
    return { data };
  } catch (err) {
    return { error: getErrorMessage(err) };
  }
};

export const recipesApi = createApi({
  reducerPath: "recipesApi",
  baseQuery: axiosBaseQuery,
  // Las queries "proveen" el tag y las mutations lo "invalidan" -> RTK Query vuelve a pedir solo.
  tagTypes: ["Recipes"],
  endpoints: (build) => ({
    // GET /api/recipes?search=...&page=... (axios arma el query string desde `params`)
    getRecipes: build.query<Paginated<Recipe>, RecipeFilters>({
      query: (params) => ({ url: "/recipes", params }),
      providesTags: ["Recipes"],
    }),
    getRecipeById: build.query<Recipe, string>({
      query: (id) => ({ url: `/recipes/${id}` }),
      providesTags: ["Recipes"],
    }),
    createRecipe: build.mutation<Recipe, RecipePayload>({
      query: (data) => ({ url: "/recipes", method: "POST", data }),
      invalidatesTags: ["Recipes"],
    }),
    updateRecipe: build.mutation<Recipe, { id: string; values: RecipePayload }>({
      query: ({ id, values }) => ({ url: `/recipes/${id}`, method: "PUT", data: values }),
      invalidatesTags: ["Recipes"],
    }),
    deleteRecipe: build.mutation<void, string>({
      query: (id) => ({ url: `/recipes/${id}`, method: "DELETE" }),
      invalidatesTags: ["Recipes"],
    }),
  }),
});

export const {
  useGetRecipesQuery,
  useGetRecipeByIdQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
} = recipesApi;
