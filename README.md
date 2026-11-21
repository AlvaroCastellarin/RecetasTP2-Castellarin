# Recetario — TP2 Desarrollo y Metodologías Web

App full-stack para consultar y administrar **recetas de cocina**. Para entrar hay que iniciar sesión
(email/contraseña, GitHub o Google): los usuarios con rol `user` pueden buscar y ver recetas, y los
**administradores** además cargan, editan y eliminan recetas y gestionan los roles de los demás usuarios.

Stack: **Express 5 + TypeScript + MongoDB (Mongoose)** · **Better Auth** (email, GitHub, Google, plugin admin) ·
**React 19 + Vite + React Router + RTK Query** · **React Hook Form + Zod** · **Tailwind** · deploy en **Render**.

## URLs de producción

| | URL |
|---|---|
| Frontend (Static Site) | `https://<COMPLETAR>.onrender.com` |
| Backend (Web Service) | `https://<COMPLETAR>.onrender.com` |
| Repositorio | `https://github.com/<COMPLETAR>` |

> El backend está en el plan free de Render: si estuvo 15 minutos sin uso, el primer request tarda ~50 s.

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| admin | `admin@recetario.test` | `AdminReceta2026` |
| user | `user@recetario.test` | `UserReceta2026` |

Se crean con `npm run seed` (ver abajo). Todo usuario que se registra desde la app recibe el rol `user`.

## Entidad: `Recipe`

| Campo | Tipo | Reglas |
|---|---|---|
| `title` | texto | obligatorio, 3–120 caracteres |
| `description` | texto | obligatorio, 10–2000 caracteres |
| `ingredients` | lista de textos | al menos 1, máximo 50 |
| `prepMinutes` | número (entero) | 1–1440 |
| `servings` | número (entero) | 1–100 |
| `difficulty` | texto (enum) | `facil` \| `media` \| `dificil` (default `media`) |
| `vegetarian` | booleano | default `false` |
| `publishedAt` | fecha | default: fecha de alta |
| `createdBy` | texto | id del admin que la creó (lo pone el backend) |
| `createdAt` / `updatedAt` | fecha | automáticos (timestamps) |

## API

Base: `/api`. Los errores tienen la forma `{ "success": false, "error": { "message": "...", "details": { campo: [errores] } } }`.

| Método | Ruta | Rol requerido | Respuestas |
|---|---|---|---|
| GET | `/api/recipes` | logueado (`user` o `admin`) | 200, 400 (query inválida), 401 |
| GET | `/api/recipes/:id` | logueado (`user` o `admin`) | 200, 400 (id inválido), 401, 404 |
| POST | `/api/recipes` | **admin** | 201, 400 (Zod), 401, 403 |
| PUT | `/api/recipes/:id` | **admin** | 200, 400, 401, 403, 404 |
| PATCH | `/api/recipes/:id` | **admin** | 200, 400, 401, 403, 404 |
| DELETE | `/api/recipes/:id` | **admin** | 204, 400, 401, 403, 404 |
| * | `/api/auth/*` | — | Endpoints de Better Auth (sign-up, sign-in, OAuth, sesión, `admin/set-role`, `admin/list-users`…) |
| GET | `/health` | público | 200 |

Las rutas de lectura usan `authMiddleware` (401 sin sesión). Las de escritura usan `authMiddleware` +
`requireRole("admin")` (403 sin permisos) + `validateBody(schema)` (400 con el detalle de Zod).

**Query params de `GET /api/recipes`** (búsqueda, filtros y paginación):

| Param | Ejemplo | Descripción |
|---|---|---|
| `search` | `papa` | busca en título, descripción e ingredientes (sin distinguir mayúsculas) |
| `difficulty` | `facil` | `facil` \| `media` \| `dificil` |
| `vegetarian` | `true` | `true` \| `false` |
| `maxMinutes` | `30` | tiempo de preparación máximo |
| `page` / `limit` | `2` / `9` | paginación (`limit` máx. 50) |
| `sortBy` / `sortOrder` | `title` / `asc` | `createdAt` \| `title` \| `prepMinutes` \| `publishedAt` |

Respuesta: `{ "data": [...], "meta": { "total", "page", "limit", "totalPages" } }`.

## Frontend

| Ruta | Acceso | Contenido |
|---|---|---|
| `/` | logueado | listado con búsqueda, filtros y paginación (los filtros viven en la URL) |
| `/recipes/:id` | logueado | detalle de la receta |
| `/login`, `/register` | público | email/contraseña, GitHub y Google |
| `/admin` | **admin** | ABM de recetas (React Hook Form + Zod) |
| `/admin/usuarios` | **admin** | cambiar roles con `authClient.admin.setRole` |

Sin sesión, cualquier ruta (salvo `/login` y `/register`) redirige a `/login`, y después de iniciar sesión
vuelve a la URL pedida **con su query string** (ej: `/?vegetarian=true`). Un usuario con rol `user` que
entra a `/admin` ve **"Sin permisos"**.
La sesión se lee con `useSession()`, así que se mantiene al recargar.

### Sesiones (Better Auth en lugar de JWT)

La autenticación usa **Better Auth**, como pide la consigna, en lugar del JWT con access/refresh token de
las primeras clases. La sesión se guarda en Mongo (colección `session`) y el navegador recibe una cookie
`httpOnly`. Cubre lo mismo que el par access/refresh: la sesión dura 7 días y se renueva sola con el uso,
y además se puede **revocar** desde el servidor (logout real), cosa que un JWT no permite hasta que vence.

## Correr en local

Requisitos: Node 22+, una base MongoDB (Atlas o local) y una OAuth App de GitHub para desarrollo.

```bash
# 1. Backend
cd backend
cp .env.example .env      # completar las variables (ver tabla)
npm install
npm run seed              # crea los usuarios de prueba y 10 recetas de ejemplo
npm run dev               # http://localhost:3000

# 2. Frontend (otra terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173
```

Abrir **http://localhost:5173**. El proxy de Vite manda `/api` al backend, así que la cookie de sesión es
del mismo origen y no hace falta CORS.

### Variables de entorno (`backend/.env`)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del backend (local `3000`; en Render no se configura) |
| `NODE_ENV` | `development` / `production` |
| `MONGODB_URI` | URI de MongoDB |
| `BETTER_AUTH_SECRET` | Secreto de Better Auth: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `BETTER_AUTH_URL` | URL pública del **frontend** (`http://localhost:5173` en local) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth App de GitHub |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Opcional. OAuth Client de Google; si se dejan vacías, Google queda deshabilitado |
| `SEED_ADMIN_PASSWORD` / `SEED_USER_PASSWORD` | Opcional. Pisan las contraseñas de prueba del seed |

### OAuth: callbacks

| Proveedor | Local | Producción |
|---|---|---|
| GitHub (OAuth App) | `http://localhost:5173/api/auth/callback/github` | `https://<front>.onrender.com/api/auth/callback/github` |
| Google (OAuth Client, tipo Web) | `http://localhost:5173/api/auth/callback/google` | `https://<front>.onrender.com/api/auth/callback/google` |

GitHub acepta una sola callback por OAuth App: se usan dos apps (local y producción). En Google se
pueden cargar las dos URIs en el mismo cliente, y en "Orígenes autorizados" las URLs del front.

## Deploy en Render

1. **Atlas** → Network Access → `0.0.0.0/0`.
2. **Backend — Web Service**
   - Root Directory: `backend`
   - Build Command: `npm install --include=dev && npm run build`
   - Start Command: `npm start`
   - Env: `NODE_ENV=production`, `NODE_VERSION=22`, `MONGODB_URI`, `BETTER_AUTH_SECRET` (uno nuevo),
     `BETTER_AUTH_URL=https://<front>.onrender.com`, `GITHUB_CLIENT_ID/SECRET` (app de producción),
     `GOOGLE_CLIENT_ID/SECRET`.
3. **Frontend — Static Site**
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Env: `NODE_VERSION=22`
   - Redirects/Rewrites, **en este orden**:

     | Source | Destination | Action |
     |---|---|---|
     | `/api/*` | `https://<back>.onrender.com/api/*` | Rewrite |
     | `/*` | `/index.html` | Rewrite |

   La primera regla hace que el front llame siempre a `/api` (como el proxy de Vite); la segunda hace
   que F5 en cualquier ruta (`/admin`, `/recipes/:id`) funcione.
4. Correr el seed contra la base de producción (desde local, con `MONGODB_URI` de Atlas en `.env`):
   `npm run seed`.

## Estructura

```
backend/
  src/
    config/db.ts                  conexión Mongoose
    lib/auth.ts                   Better Auth (email, GitHub, Google, plugin admin)
    middlewares/                  authMiddleware, requireRole, validateBody (Zod)
    models/Recipe.ts              schema Mongoose
    schemas/recipe.schema.ts      schemas Zod (crear, editar, listar)
    services/recipes.service.ts   lógica y acceso a datos
    controllers/                  capa HTTP (status codes)
    routes/recipes.routes.ts      rutas + middlewares
  scripts/seed.ts                 usuarios de prueba + recetas de ejemplo
frontend/
  src/
    lib/                          axios (/api) y cliente de Better Auth
    store/                        RTK Query
    router/                       rutas + ProtectedRoute por rol
    pages/                        Home, RecipeDetail, Login, Register, admin/*
    components/                   RecipeCard, Pagination, RecipeForm, SocialButtons...
```

## Opcionales implementados

- Búsqueda, filtros (dificultad, vegetariana, tiempo máximo) y paginación en el listado.
- Login con Google además de GitHub.
- Página de admin para cambiar roles (`authClient.admin.setRole`).
