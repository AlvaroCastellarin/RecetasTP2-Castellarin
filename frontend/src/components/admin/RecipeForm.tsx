// Formulario de alta / edicion de recetas: React Hook Form + Zod. Muestra los errores por campo.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "../../lib/api";
import {
  emptyRecipe,
  recipeFormSchema,
  toRecipeFormValues,
  type RecipeFormValues,
} from "../../schemas/recipe.schema";
import { DIFFICULTIES, DIFFICULTY_LABELS, type Recipe } from "../../types/recipe";
import { FormField, inputClass } from "../FormField";

interface RecipeFormProps {
  recipe: Recipe | null;
  onSave: (values: RecipeFormValues) => Promise<void>;
  onCancel: () => void;
}

export const RecipeForm = ({ recipe, onSave, onCancel }: RecipeFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(recipeFormSchema),
    // `values` re-sincroniza el form cuando cambia la receta que se esta editando.
    values: recipe ? toRecipeFormValues(recipe) : emptyRecipe(),
  });

  const onSubmit = async (values: RecipeFormValues) => {
    try {
      await onSave(values);
      reset(emptyRecipe());
    } catch (err) {
      setError("root.server", { message: getErrorMessage(err) });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900">
        {recipe ? `Editando: ${recipe.title}` : "Nueva receta"}
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Título" error={errors.title?.message} className="sm:col-span-2">
          <input aria-invalid={!!errors.title} {...register("title")} className={inputClass} />
        </FormField>

        <FormField label="Descripción" error={errors.description?.message} className="sm:col-span-2">
          <textarea
            rows={3}
            aria-invalid={!!errors.description}
            {...register("description")}
            className={inputClass}
          />
        </FormField>

        <FormField
          label="Ingredientes (uno por línea)"
          error={errors.ingredientsText?.message}
          className="sm:col-span-2"
        >
          <textarea
            rows={4}
            aria-invalid={!!errors.ingredientsText}
            {...register("ingredientsText")}
            className={inputClass}
          />
        </FormField>

        <FormField label="Tiempo de preparación (min)" error={errors.prepMinutes?.message}>
          <input
            type="number"
            min={1}
            aria-invalid={!!errors.prepMinutes}
            {...register("prepMinutes", { valueAsNumber: true })}
            className={inputClass}
          />
        </FormField>

        <FormField label="Porciones" error={errors.servings?.message}>
          <input
            type="number"
            min={1}
            aria-invalid={!!errors.servings}
            {...register("servings", { valueAsNumber: true })}
            className={inputClass}
          />
        </FormField>

        <FormField label="Dificultad" error={errors.difficulty?.message}>
          <select aria-invalid={!!errors.difficulty} {...register("difficulty")} className={inputClass}>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABELS[d]}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Fecha de publicación" error={errors.publishedAt?.message}>
          <input
            type="date"
            aria-invalid={!!errors.publishedAt}
            {...register("publishedAt")}
            className={inputClass}
          />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" {...register("vegetarian")} />
        Vegetariana
      </label>

      {errors.root?.server && (
        <p role="alert" className="text-sm text-red-600">
          {errors.root.server.message}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : recipe ? "Guardar cambios" : "Crear receta"}
        </button>
        {recipe && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
          >
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  );
};
