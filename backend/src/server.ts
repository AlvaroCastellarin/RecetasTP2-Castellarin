// dotenv primero: lib/auth.ts lee las variables de entorno apenas se importa.
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import recipesRouter from "./routes/recipes.routes.js";
import { connectMongoDB } from "./config/db.js";

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

// Sin cors ni cookie-parser: el front llama a /api en su mismo origen (proxy de Vite en local,
// rewrite del Static Site en Render), asi que no hay requests cross-origin.

// Render (y cualquier proxy) agrega X-Forwarded-*: necesario para IP y protocolo correctos.
app.set("trust proxy", 1);

// Better Auth ANTES de express.json(): el handler lee el body crudo del request.
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

app.use("/api/recipes", recipesRouter);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptimeSeconds: process.uptime(), timestamp: new Date().toISOString() });
});

// 404 para cualquier ruta /api que no exista
app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: { message: "Ruta no encontrada" } });
});

// JSON mal formado en el body → 400 en vez del 500 por defecto de Express
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ success: false, error: { message: "El body no es un JSON valido" } });
    return;
  }
  next(err);
});

async function startServer(): Promise<void> {
  await connectMongoDB();
  app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("[server] failed to start:", error);
  process.exit(1);
});
