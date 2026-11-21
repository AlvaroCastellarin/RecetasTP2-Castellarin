// Ruta "/admin/sesiones" (solo admin): ver las sesiones abiertas de cada usuario y revocarlas.
// Todo sale del plugin admin de Better Auth, sin codigo propio en el backend.
// La sesion vive en Mongo: al revocarla, el proximo request de ese navegador ya no esta autenticado.
// Con JWT (clases 4 y 5) esto era imposible: el token seguia valiendo hasta vencer.
import { useEffect, useState } from "react";
import { authClient, useSession } from "../../lib/auth-client";

type AdminUser = { id: string; name: string; email: string; role?: string | null };
type UserSession = {
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: Date;
  expiresAt: Date;
};

// "Mozilla/5.0 (Windows NT 10.0...) Chrome/142..." → "Chrome · Windows"
function describeAgent(userAgent?: string | null): string {
  if (!userAgent) return "Navegador desconocido";
  const browser =
    ["Edg", "OPR", "Firefox", "Chrome", "Safari"].find((name) => userAgent.includes(name)) ?? "Otro";
  const os =
    ["Windows", "Android", "iPhone", "Mac OS", "Linux"].find((name) => userAgent.includes(name)) ??
    "otro sistema";
  const names: Record<string, string> = { Edg: "Edge", OPR: "Opera", "Mac OS": "macOS" };
  return `${names[browser] ?? browser} · ${names[os] ?? os}`;
}

const formatDate = (date: Date) =>
  new Date(date).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });

export const AdminSessions = () => {
  const { data: current } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sessions, setSessions] = useState<Record<string, UserSession[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    authClient.admin
      .listUsers({ query: { limit: 100, sortBy: "name", sortDirection: "asc" } })
      .then(({ data, error }) => {
        if (error) setError(error.message ?? "No se pudieron cargar los usuarios");
        else setUsers(data.users as AdminUser[]);
      });
  }, []);

  const loadSessions = async (userId: string) => {
    const { data, error } = await authClient.admin.listUserSessions({ userId });
    if (error) return setError(error.message ?? "No se pudieron cargar las sesiones");
    setSessions((prev) => ({ ...prev, [userId]: data.sessions as UserSession[] }));
  };

  const revoke = async (user: AdminUser, sessionToken: string) => {
    const { error } = await authClient.admin.revokeUserSession({ sessionToken });
    if (error) return setError(error.message ?? "No se pudo revocar la sesión");
    setNotice(`Sesión de ${user.name} revocada`);
    await loadSessions(user.id);
  };

  const revokeAll = async (user: AdminUser) => {
    if (!window.confirm(`¿Cerrar todas las sesiones de ${user.name}?`)) return;
    const { error } = await authClient.admin.revokeUserSessions({ userId: user.id });
    if (error) return setError(error.message ?? "No se pudieron revocar las sesiones");
    setNotice(`Se cerraron todas las sesiones de ${user.name}`);
    await loadSessions(user.id);
  };

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Sesiones</h2>
        <p className="text-sm text-slate-500">
          Las sesiones se guardan en la base: revocar una desloguea a ese navegador en su próxima acción.
        </p>
      </div>

      {notice && (
        <p role="status" className="rounded bg-green-50 p-3 text-sm text-green-800">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {users.map((user) => {
          const userSessions = sessions[user.id];
          const isSelf = user.id === current?.user.id;
          return (
            <li key={user.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">
                    {user.name} {isSelf && <span className="text-xs text-slate-500">(vos)</span>}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {user.email} · {user.role ?? "user"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => loadSessions(user.id)}
                    className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
                  >
                    {userSessions ? "Actualizar" : "Ver sesiones"}
                  </button>
                  {!isSelf && userSessions && userSessions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => revokeAll(user)}
                      className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                    >
                      Cerrar todas
                    </button>
                  )}
                </div>
              </div>

              {userSessions?.length === 0 && (
                <p className="mt-3 text-sm text-slate-500">Sin sesiones activas.</p>
              )}
              {userSessions && userSessions.length > 0 && (
                <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
                  {userSessions.map((s) => {
                    const isCurrent = s.token === current?.session.token;
                    return (
                      <li key={s.token} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                        <span className="text-slate-700">
                          {describeAgent(s.userAgent)}
                          <span className="text-slate-400">
                            {" "}
                            · desde {formatDate(s.createdAt)} · vence {formatDate(s.expiresAt)}
                          </span>
                          {isCurrent && <strong className="text-brand-700"> (esta sesión)</strong>}
                        </span>
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => revoke(user, s.token)}
                            className="rounded px-2 py-0.5 text-red-600 hover:bg-red-50"
                          >
                            Revocar
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
