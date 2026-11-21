// Presentacional: recibe una receta por props. Toda la card es un <Link> al detalle.
import { Link } from "react-router";
import { DIFFICULTY_LABELS, type Recipe } from "../types/recipe";

export const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  return (
    <Link
      to={`/recipes/${recipe._id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
    >
      <article>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
            {DIFFICULTY_LABELS[recipe.difficulty]}
          </span>
          {recipe.vegetarian && (
            <span className="rounded bg-green-50 px-2 py-0.5 text-xs text-green-700">Vegetariana</span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{recipe.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{recipe.description}</p>
        <p className="mt-3 text-xs text-slate-500">
          {recipe.prepMinutes} min · {recipe.servings} porciones · {recipe.ingredients.length}{" "}
          ingredientes
        </p>
      </article>
    </Link>
  );
};
