// Ruta "/admin/usuarios" (solo admin): listar usuarios y cambiar su rol.
// Todo sale del plugin admin de Better Auth (authClient.admin.*): no hay codigo propio en el backend.
// El backend valida que quien llama sea admin; esta pagina igual esta detras de ProtectedRoute.
import { useCallback, useEffect, useState } from "react";
import { authClient, useSession } from "../../lib/auth-client";
import type { UserRole } from "../../types/auth";

type AdminUser = { id: string; name: string; email: string; role?: string | null; createdAt: Date };

const PAGE_SIZE = 20;

export const AdminUsers = () => {
  const { data: current } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const term = search.trim();
    const { data, error } = await authClient.admin.listUsers({
      query: {
        limit: PAGE_SIZE,
        offset,
        sortBy: "createdAt",
        sortDirection: "desc",
        ...(term && { searchValue: term, searchField: "email", searchOperator: "contains" }),
      },
    });
    if (error) {
      setError(error.message ?? "No se pudieron cargar los usuarios");
      return;
    }
    setError(null);
    setUsers(data.users as AdminUser[]);
    setTotal(data.total);
  }, [offset, search]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  const changeRole = async (user: AdminUser, role: UserRole) => {
    setSavingId(user.id);
    setNotice(null);
    const { error } = await authClient.admin.setRole({ userId: user.id, role });
    setSavingId(null);
    if (error) {
      setError(error.message ?? "No se pudo cambiar el rol");
      return;
    }
    setNotice(`${user.name} ahora es ${role}. El cambio aplica en su próxima request.`);
    await load();
  };

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Usuarios y roles</h2>
        <p className="text-sm text-slate-500">
          Los usuarios nuevos se registran como <strong>user</strong> (solo lectura). Un{" "}
          <strong>admin</strong> puede crear, editar y eliminar recetas.
        </p>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOffset(0);
        }}
        placeholder="Buscar por email..."
        aria-label="Buscar usuarios por email"
        className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
      />

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

      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
        {users.map((user) => {
          const isSelf = user.id === current?.user.id;
          const role = (user.role ?? "user") as UserRole;
          return (
            <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-900">
                  {user.name} {isSelf && <span className="text-xs text-slate-500">(vos)</span>}
                </p>
                <p className="truncate text-sm text-slate-500">{user.email}</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                Rol
                <select
                  value={role}
                  // No te podes sacar el rol de admin a vos mismo: te quedarias afuera del panel.
                  disabled={isSelf || savingId === user.id}
                  onChange={(e) => changeRole(user, e.target.value as UserRole)}
                  className="rounded border border-slate-300 bg-white px-2 py-1 disabled:opacity-50"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </label>
            </li>
          );
        })}
        {users.length === 0 && !error && (
          <li className="px-4 py-3 text-sm text-slate-500">No hay usuarios.</li>
        )}
      </ul>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <button
            type="button"
            disabled={offset === 0}
            onClick={() => setOffset(offset - PAGE_SIZE)}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setOffset(offset + PAGE_SIZE)}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      )}
    </section>
  );
};
