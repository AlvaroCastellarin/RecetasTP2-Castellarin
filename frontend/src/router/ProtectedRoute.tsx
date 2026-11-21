import { Link, Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "../lib/auth-client";
import type { UserRole } from "../types/auth";

interface ProtectedRouteProps {
  roles?: UserRole[];
}

// Sin sesion → /login (y vuelve a donde estaba). Con sesion pero sin el rol → "sin permisos".
export const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  // isPending: true hasta que responde /api/auth/get-session (por eso F5 no desloguea).
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) {
    return <p className="text-slate-500">Verificando sesión...</p>;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(session.user.role as UserRole)) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <h2 className="text-xl font-semibold text-amber-900">Sin permisos</h2>
        <p className="mt-1 text-sm text-amber-800">
          Esta sección es solo para administradores. Tu rol actual es{" "}
          <strong>{session.user.role ?? "user"}</strong>.
        </p>
        <Link to="/" className="mt-3 inline-block text-sm text-amber-900 underline">
          Volver a las recetas
        </Link>
      </section>
    );
  }

  return <Outlet />;
};
