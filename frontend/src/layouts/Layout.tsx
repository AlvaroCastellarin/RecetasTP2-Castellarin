// Layout: header con navegacion y sesion. Se monta una vez; al navegar solo cambia <Outlet />.
import { Link, NavLink, Outlet } from "react-router";
import { signOut, useSession } from "../lib/auth-client";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-1.5 text-sm hover:bg-white/10 ${isActive ? "bg-white/15" : ""}`;

export const Layout = () => {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  // signOut borra la sesion EN LA BASE (no solo la cookie). Recarga completa para limpiar caches.
  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      alert(error.message ?? "No se pudo cerrar sesión");
      return;
    }
    window.location.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-brand-600 px-4 py-3 text-white sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <Link to="/" className="text-2xl font-bold">
            Recetario
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Recetas
            </NavLink>
            {isAdmin && (
              <>
                <NavLink to="/admin" end className={navClass}>
                  Admin recetas
                </NavLink>
                <NavLink to="/admin/usuarios" className={navClass}>
                  Usuarios
                </NavLink>
                <NavLink to="/admin/sesiones" className={navClass}>
                  Sesiones
                </NavLink>
              </>
            )}
            {!isPending && !user && (
              <>
                <NavLink to="/login" className={navClass}>
                  Ingresar
                </NavLink>
                <Link
                  to="/register"
                  className="rounded bg-white px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
                >
                  Crear cuenta
                </Link>
              </>
            )}
            {user && (
              <>
                <NavLink to="/perfil" className={navClass}>
                  {user.name} · {user.role ?? "user"}
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded px-3 py-1.5 text-sm hover:bg-white/10"
                >
                  Salir
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
};
