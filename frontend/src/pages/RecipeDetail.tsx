// Ruta publica "/recipes/:id". El id sale de la URL con useParams.
import { skipToken } from "@reduxjs/toolkit/query";
import { Link, useParams } from "react-router";
import { getErrorMessage } from "../lib/api";
import { useGetRecipeByIdQuery } from "../store/api";
import { DIFFICULTY_LABELS } from "../types/recipe";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { timeZone: "UTC", dateStyle: "long" });

export const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: recipe, isLoading, error } = useGetRecipeByIdQuery(id ?? skipToken);

  if (isLoading) {
    return <p className="text-slate-500">Cargando receta...</p>;
  }

  if (error || !recipe) {
    return (
      <section>
        <p className="text-red-600">No se pudo cargar la receta: {getErrorMessage(error)}</p>
        <Link to="/" className="mt-2 inline-block text-slate-600 underline">
          Volver al listado
        </Link>
      </section>
    );
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <Link to="/" className="text-sm text-slate-500 underline">
        ← Volver al listado
      </Link>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900">{recipe.title}</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
          {DIFFICULTY_LABELS[recipe.difficulty]}
        </span>
        {recipe.vegetarian && (
          <span className="rounded bg-green-50 px-2 py-0.5 text-xs text-green-700">Vegetariana</span>
        )}
      </div>
      <p className="mt-4 whitespace-pre-line text-slate-700">{recipe.description}</p>

      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-slate-500">Preparación</dt>
          <dd className="font-medium text-slate-900">{recipe.prepMinutes} minutos</dd>
        </div>
        <div>
          <dt className="text-slate-500">Porciones</dt>
          <dd className="font-medium text-slate-900">{recipe.servings}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Publicada</dt>
          <dd className="font-medium text-slate-900">{formatDate(recipe.publishedAt)}</dd>
        </div>
      </dl>

      <h3 className="mt-6 text-lg font-semibold text-slate-900">Ingredientes</h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-slate-700">
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul>
    </article>
  );
};
