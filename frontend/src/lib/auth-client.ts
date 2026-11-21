// Cliente de Better Auth: reemplaza a services/auth.ts + authSlice.
// Sin baseURL: el front y la API comparten origen (proxy de Vite en local, rewrite de Render en produccion).
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { redirectToLogin } from "./session-redirect";

// En sign-in / sign-up un 401 significa "credenciales incorrectas": ese error lo muestra el formulario.
const CREDENTIAL_ENDPOINTS = ["/sign-in/", "/sign-up/"];

export const authClient = createAuthClient({
  plugins: [adminClient()],
  fetchOptions: {
    // Cualquier otra accion de Better Auth (perfil, vincular cuentas, panel admin...) que responda
    // 401 es porque la sesion vencio o la revocaron: al login.
    onError: ({ response, request }) => {
      const url = String(request.url);
      if (response.status === 401 && !CREDENTIAL_ENDPOINTS.some((path) => url.includes(path))) {
        redirectToLogin();
      }
    },
  },
});

// useSession es estado del SERVIDOR (como RTK Query): pide /api/auth/get-session y lo cachea.
export const { useSession, signIn, signUp, signOut } = authClient;
