// Arbol de rutas centralizado (data router).
// Solo /login y /register son publicas. TODO lo demas (incluida cualquier URL inventada) esta
// adentro de <ProtectedRoute />: sin sesion → /login, y despues del login vuelve a la URL pedida.
// /admin/* ademas pide rol admin.
import { createBrowserRouter } from "react-router";
import { Layout } from "../layouts/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { Home } from "../pages/Home";
import { RecipeDetail } from "../pages/RecipeDetail";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { AdminRecipes } from "../pages/admin/AdminRecipes";
import { AdminUsers } from "../pages/admin/AdminUsers";
import { AdminSessions } from "../pages/admin/AdminSessions";
import { Profile } from "../pages/Profile";
import { NotFound } from "../pages/NotFound";

export const router = createBrowserRouter([
  // Publicas, fuera del Layout: pantalla completa, sin header
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  // Guard global: envuelve al Layout, asi sin sesion no se llega a dibujar ni el header.
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          // Cualquier usuario logueado (user o admin)
          { index: true, element: <Home /> },
          { path: "recipes/:id", element: <RecipeDetail /> },
          { path: "perfil", element: <Profile /> },

          // Solo admin: un user logueado ve "Sin permisos"
          {
            element: <ProtectedRoute roles={["admin"]} />,
            children: [
              {
                path: "admin",
                children: [
                  { index: true, element: <AdminRecipes /> },
                  { path: "usuarios", element: <AdminUsers /> },
                  { path: "sesiones", element: <AdminSessions /> },
                ],
              },
            ],
          },

          // 404: tambien protegido, una URL inexistente sin sesion lleva al login
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
