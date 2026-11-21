// Manejo global de "sesion vencida o revocada".
// Si CUALQUIER request que necesita sesion responde 401, se manda al usuario al login,
// guardando la URL donde estaba para volver despues (?redirect=/recipes/123).
// Es el equivalente al interceptor de 401 de la clase 9, ahora con Better Auth.

const PUBLIC_PATHS = ["/login", "/register"];

// Recarga completa (no navigate): limpia la cache de useSession y de RTK Query, que todavia
// creen que hay sesion. Asi el login arranca de cero.
export function redirectToLogin(): void {
  const { pathname, search, hash } = window.location;
  if (PUBLIC_PATHS.includes(pathname)) return; // ya esta en una pantalla publica
  const redirect = encodeURIComponent(`${pathname}${search}${hash}`);
  window.location.replace(`/login?redirect=${redirect}&expired=1`);
}

// Solo rutas internas ("/algo"). Evita redirecciones abiertas a otro sitio ("//evil.com", "https://...").
export function safeRedirect(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return null;
  }
  return value;
}
