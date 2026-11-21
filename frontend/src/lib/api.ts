import axios from "axios";
import { redirectToLogin } from "./session-redirect";

// Ruta relativa: mismo origen que el front, el navegador manda la cookie de sesion solo.
// En local la resuelve el proxy de Vite; en Render, el rewrite /api/* del Static Site.
export const api = axios.create({
  baseURL: "/api",
});

// Interceptor: cualquier 401 de la API (buscar, ver detalle, crear, editar, borrar...) significa
// que la sesion vencio o fue revocada → al login, y despues vuelve a donde estaba.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      redirectToLogin();
    }
    return Promise.reject(error);
  },
);

// Los errores del backend vienen como { success: false, error: { message, details? } }.
// Los de RTK Query (unwrap) ya llegan como string: ver axiosBaseQuery en store/api.ts.
export const getErrorMessage = (err: unknown): string => {
  if (typeof err === "string") return err;
  if (axios.isAxiosError(err)) {
    const error = err.response?.data?.error;
    return typeof error === "string" ? error : (error?.message ?? err.message);
  }
  if (err instanceof Error) return err.message;
  return "Error desconocido";
};
