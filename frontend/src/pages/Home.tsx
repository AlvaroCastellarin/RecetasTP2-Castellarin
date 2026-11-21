// Ruta publica "/": listado con busqueda, filtros y paginacion.
// Los filtros viven en la URL (?search=...&page=2): sobreviven al F5 y se pueden compartir.
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { getErrorMessage } from "../lib/api";
import { useGetRecipesQuery } from "../store/api";
import { RecipeCard } from "../components/RecipeCard";
import { Pagination } from "../components/Pagination";
import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty, type RecipeFilters } from "../types/recipe";

const PAGE_SIZE = 9;

function readFilters(params: URLSearchParams): RecipeFilters {
  const difficulty = params.get("difficulty");
  const vegetarian = params.get("vegetarian");
  const maxMinutes = Number(params.get("maxMinutes"));
  return {
    page: Math.max(1, Number(params.get("page")) || 1),
    limit: PAGE_SIZE,
    search: params.get("search") || undefined,
    difficulty: DIFFICULTIES.includes(difficulty as Difficulty) ? (difficulty as Difficulty) : undefined,
    vegetarian: vegetarian === "true" ? true : undefined,
    maxMinutes: maxMinutes > 0 ? maxMinutes : undefined,
    sortBy: "publishedAt",
    sortOrder: "desc",
  };
}

export const Home = () => {
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const { data, isFetching, isLoading, error } = useGetRecipesQuery(filters);
  const [search, setSearch] = useState(filters.search ?? "");

  // Cambia un parametro de la URL y vuelve a la pagina 1 (salvo que se este cambiando la pagina).
  const update = (key: string, value: string | undefined) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "page") next.delete("page");
      return next;
    });
  };

  // Busqueda con debounce: no pide al backend en cada tecla.
  useEffect(() => {
    const current = params.get("search") ?? "";
    if (search.trim() === current) return;
    const timeout = setTimeout(() => update("search", search.trim() || undefined), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe reaccionar al texto tipeado
  }, [search]);

  const recipes = data?.data ?? [];
  const meta = data?.meta;
  const field = "rounded border border-slate-300 bg-white px-3 py-2 text-sm";

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Recetas</h2>
        <p className="text-sm text-slate-500">Buscá por nombre, descripción o ingrediente.</p>
      </div>

      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4"
      >
        <label className="flex flex-col gap-1 text-sm text-slate-700 sm:col-span-2">
          Buscar
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ej: papas, empanadas..."
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Dificultad
          <select
            value={filters.difficulty ?? ""}
            onChange={(e) => update("difficulty", e.target.value || undefined)}
            className={field}
          >
            <option value="">Todas</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABELS[d]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Tiempo máximo
          <select
            value={filters.maxMinutes ?? ""}
            onChange={(e) => update("maxMinutes", e.target.value || undefined)}
            className={field}
          >
            <option value="">Sin límite</option>
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="60">1 hora</option>
            <option value="120">2 horas</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-4">
          <input
            type="checkbox"
            checked={filters.vegetarian === true}
            onChange={(e) => update("vegetarian", e.target.checked ? "true" : undefined)}
          />
          Solo vegetarianas
        </label>
      </form>

      {isLoading && <p className="text-slate-500">Cargando recetas...</p>}
      {error && (
        <p role="alert" className="text-red-600">
          No se pudieron cargar las recetas: {getErrorMessage(error)}
        </p>
      )}

      {!isLoading && !error && recipes.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
          No hay recetas que coincidan con la búsqueda.
        </p>
      )}

      {recipes.length > 0 && (
        <div
          className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}
        >
          {recipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
      )}

      {meta && meta.total > 0 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          onChange={(page) => update("page", String(page))}
        />
      )}
    </section>
  );
};
