import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useLocation, useNavigate, type Location } from "react-router";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";
import { signIn, useSession } from "../lib/auth-client";
import { safeRedirect } from "../lib/session-redirect";
import { FormField, inputClass } from "../components/FormField";
import { SocialButtons } from "../components/SocialButtons";

const OAUTH_ERRORS: Record<string, string> = {
  account_not_linked: "Ya existe una cuenta con ese email. Ingresá con tu contraseña.",
  email_not_found: "Tu cuenta no tiene un email público. Hacelo visible e intentá de nuevo.",
};

export const Login = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // URL completa a la que queria ir antes del login, CON el query string (ej: /?vegetarian=true).
  // Llega por state (ProtectedRoute) o por ?redirect= (sesion vencida en medio de una accion).
  const params = new URLSearchParams(location.search);
  const fromLocation = (location.state as { from?: Location } | null)?.from;
  const from =
    (fromLocation && `${fromLocation.pathname}${fromLocation.search}${fromLocation.hash}`) ||
    safeRedirect(params.get("redirect")) ||
    "/";
  const oauthError = params.get("error");
  const sessionExpired = params.get("expired") === "1";

  if (session && !isSubmitting) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (credentials: LoginFormValues) => {
    // Better Auth no tira excepcion: devuelve { data, error }. Si sale bien setea la cookie.
    const { error } = await signIn.email(credentials);
    if (error) {
      setError("root.server", {
        message: error.status === 401 ? "Email o contraseña incorrectos" : (error.message ?? "No se pudo iniciar sesión"),
      });
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans">
      <section className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-700">Recetario</h1>
        <h2 className="mt-1 mb-4 text-xl font-semibold text-slate-900">Iniciar sesión</h2>
        {sessionExpired && !oauthError && (
          <p role="alert" className="mb-4 rounded bg-amber-50 p-3 text-sm text-amber-800">
            Tu sesión venció o fue cerrada. Volvé a iniciar sesión para continuar.
          </p>
        )}
        {oauthError && (
          <p role="alert" className="mb-4 rounded bg-amber-50 p-3 text-sm text-amber-800">
            {OAUTH_ERRORS[oauthError] ?? "No se pudo iniciar sesión con el proveedor externo."}
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
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
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
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
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />o<span className="h-px flex-1 bg-slate-200" />
        </div>
        <SocialButtons callbackURL={from} />
        <p className="mt-4 text-center text-sm text-slate-600">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="font-medium text-slate-900 underline">
            Crear cuenta
          </Link>
        </p>
      </section>
    </main>
  );
};
