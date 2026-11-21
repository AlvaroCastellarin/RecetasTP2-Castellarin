// Arbol de rutas centralizado (data router). Publico, y privado por rol (admin).
import { createBrowserRouter } from "react-router";
import { Layout } from "../layouts/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { Home } from "../pages/Home";
import { RecipeDetail } from "../pages/RecipeDetail";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { AdminRecipes } from "../pages/admin/AdminRecipes";
import { AdminUsers } from "../pages/admin/AdminUsers";
import { NotFound } from "../pages/NotFound";

export const router = createBrowserRouter([
  // Fuera del Layout: pantalla completa, sin header
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/",
    element: <Layout />,
    children: [
      // Publicas
      { index: true, element: <Home /> },
      { path: "recipes/:id", element: <RecipeDetail /> },

      // Solo admin
      {
        element: <ProtectedRoute roles={["admin"]} />,
        children: [
          {
            path: "admin",
            children: [
              { index: true, element: <AdminRecipes /> },
              { path: "usuarios", element: <AdminUsers /> },
            ],
          },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);
