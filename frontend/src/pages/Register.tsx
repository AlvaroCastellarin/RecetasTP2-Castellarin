// Ruta publica "/register". Crea el usuario (siempre rol "user") y Better Auth abre la sesion en el mismo paso.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate } from "react-router";
import { signUp, useSession } from "../lib/auth-client";
import { registerSchema, type RegisterFormValues } from "../schemas/auth.schema";
import { FormField, inputClass } from "../components/FormField";
import { SocialButtons } from "../components/SocialButtons";

export const Register = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  if (session && !isSubmitting) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async ({ name, email, password }: RegisterFormValues) => {
    const { error } = await signUp.email({ name, email, password });
    if (error) {
      setError("root.server", {
        message:
          error.code === "USER_ALREADY_EXISTS" || error.status === 422
            ? "Ya existe una cuenta con ese email"
            : (error.message ?? "No se pudo crear la cuenta"),
      });
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans">
      <section className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link to="/" className="text-sm text-slate-500 underline">
          ← Recetario
        </Link>
        <h2 className="mt-2 mb-4 text-xl font-semibold text-slate-900">Crear cuenta</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
          <FormField label="Nombre" error={errors.name?.message}>
            <input
              type="text"
              autoComplete="name"
              aria-invalid={!!errors.name}
              {...register("name")}
              className={inputClass}
            />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <input
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
              className={inputClass}
            />
          </FormField>
          <FormField label="Contraseña" error={errors.password?.message}>
            <input
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register("password")}
              className={inputClass}
            />
          </FormField>
          <FormField label="Repetir contraseña" error={errors.confirmPassword?.message}>
            <input
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
              className={inputClass}
            />
          </FormField>
          {errors.root?.server && (
            <p role="alert" className="text-sm text-red-600">
              {errors.root.server.message}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-slate-900 py-2 font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creando..." : "Crear cuenta"}
          </button>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />o<span className="h-px flex-1 bg-slate-200" />
        </div>
        <SocialButtons callbackURL="/" />
        <p className="mt-4 text-center text-sm text-slate-600">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="font-medium text-slate-900 underline">
            Ingresar
          </Link>
        </p>
      </section>
    </main>
  );
};
