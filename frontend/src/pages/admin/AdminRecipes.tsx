// Ruta "/admin" (solo admin): ABM de recetas.
import { useState } from "react";
import { Link } from "react-router";
import { getErrorMessage } from "../../lib/api";
import { toRecipePayload, type RecipeFormValues } from "../../schemas/recipe.schema";
import {
  useCreateRecipeMutation,
  useDeleteRecipeMutation,
  useGetRecipesQuery,
  useUpdateRecipeMutation,
} from "../../store/api";
import { DIFFICULTY_LABELS, type Recipe } from "../../types/recipe";
import { RecipeForm } from "../../components/admin/RecipeForm";
import { Pagination } from "../../components/Pagination";

export const AdminRecipes = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, error: loadError } = useGetRecipesQuery({
    page,
    limit: 10,
    search: search.trim() || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [createRecipe] = useCreateRecipeMutation();
  const [updateRecipe] = useUpdateRecipeMutation();
  const [deleteRecipe, { error: deleteError }] = useDeleteRecipeMutation();
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const recipes = data?.data ?? [];

  // Cada mutation invalida el tag "Recipes" y RTK Query vuelve a pedir el listado.
  // unwrap() lanza el error para que lo muestre el formulario.
  const handleSave = async (values: RecipeFormValues) => {
    const payload = toRecipePayload(values);
    if (editing) {
      await updateRecipe({ id: editing._id, values: payload }).unwrap();
      setNotice(`Receta "${payload.title}" actualizada`);
      setEditing(null);
    } else {
      await createRecipe(payload).unwrap();
      setNotice(`Receta "${payload.title}" creada`);
      setPage(1);
    }
  };

  const handleDelete = async (recipe: Recipe) => {
    if (!window.confirm(`¿Eliminar la receta "${recipe.title}"?`)) return;
    const result = await deleteRecipe(recipe._id);
    if (!result.error) {
      setNotice(`Receta "${recipe.title}" eliminada`);
      if (editing?._id === recipe._id) setEditing(null);
      if (recipes.length === 1 && page > 1) setPage(page - 1);
    }
  };

  const error = loadError ?? deleteError;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Administrar recetas</h2>
          <p className="text-sm text-slate-500">Alta, edición y baja del recetario.</p>
        </div>
        <Link to="/admin/usuarios" className="text-sm text-slate-600 underline">
          Gestionar roles de usuarios →
        </Link>
      </div>

      <RecipeForm
        recipe={editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />

      {notice && (
        <p role="status" className="rounded bg-green-50 p-3 text-sm text-green-800">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {getErrorMessage(error)}
        </p>
      )}

      <input
        type="search"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Filtrar recetas..."
        aria-label="Filtrar recetas"
        className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
      />

      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
        {recipes.map((recipe) => (
          <li key={recipe._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <Link to={`/recipes/${recipe._id}`} className="font-medium text-slate-900 hover:underline">
                {recipe.title}
              </Link>
              <p className="text-sm text-slate-500">
                {DIFFICULTY_LABELS[recipe.difficulty]} · {recipe.prepMinutes} min · {recipe.servings}{" "}
                porciones{recipe.vegetarian ? " · Vegetariana" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(recipe);
                  setNotice(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(recipe)}
                className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
        {recipes.length === 0 && (
          <li className="px-4 py-3 text-sm text-slate-500">No hay recetas.</li>
        )}
      </ul>

      {data && data.meta.total > 0 && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          onChange={setPage}
        />
      )}
    </section>
  );
};
