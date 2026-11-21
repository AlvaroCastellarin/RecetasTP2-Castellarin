// Ruta privada "/perfil": cualquier usuario logueado (user o admin).
// Muestra los datos de la sesion y permite vincular Google / GitHub a la cuenta.
// Vincular = poder entrar a ESTA misma cuenta (mismas recetas, mismo rol) tambien con ese proveedor.
import { useEffect, useState } from "react";
import { authClient, useSession } from "../lib/auth-client";
import type { SocialProvider } from "../components/SocialButtons";

const PROVIDERS: { id: SocialProvider; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
];

export const Profile = () => {
  const { data: session } = useSession();
  const [linked, setLinked] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // listAccounts: cuentas asociadas al usuario ("credential" = email+contraseña, "google", "github").
  useEffect(() => {
    authClient.listAccounts().then(({ data, error }) => {
      if (error) setError(error.message ?? "No se pudieron cargar las cuentas vinculadas");
      else setLinked(data.map((account) => account.providerId));
    });
  }, []);

  if (!session) return null;
  const { user } = session;

  // linkSocial: el usuario ya probo que es dueño de la cuenta (esta logueado), asi que se puede
  // unir con el proveedor aunque el email sea distinto. Redirige y vuelve a /perfil ya vinculado.
  const handleLink = async (provider: SocialProvider) => {
    setError(null);
    const { error } = await authClient.linkSocial({ provider, callbackURL: "/perfil" });
    if (error) setError(error.message ?? "No se pudo vincular la cuenta");
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {user.image ? (
          <img src={user.image} alt="" className="h-16 w-16 rounded-full" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-700">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{user.name}</h2>
          <p className="text-slate-600">{user.email}</p>
          <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
            {user.role ?? "user"}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Cuentas vinculadas</h3>
        <p className="mt-1 text-sm text-slate-500">
          Vinculá Google o GitHub para entrar a esta misma cuenta con un clic, sin contraseña.
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {PROVIDERS.map(({ id, label }) => {
            const isLinked = linked?.includes(id);
            return (
              <li
                key={id}
                className="flex items-center justify-between gap-3 rounded border border-slate-200 px-4 py-2"
              >
                <span className="font-medium text-slate-900">{label}</span>
                {linked === null ? (
                  <span className="text-sm text-slate-400">...</span>
                ) : isLinked ? (
                  <span className="text-sm text-green-700">Vinculada ✓</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLink(id)}
                    className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
                  >
                    Vincular {label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </section>
  );
};
