// Better Auth: usuarios, sesiones y cuentas OAuth (GitHub / Google) en nuestro Mongo
// (colecciones user, session, account).
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} environment variable. Check your .env file (see .env.example).`);
  return value;
}

// Better Auth usa el driver nativo de Mongo. Pasarlo como `client` habilita transacciones (Atlas = replica set).
export const mongoClient = new MongoClient(requireEnv("MONGODB_URI"));

// Google es opcional: solo se habilita si estan las dos variables.
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleEnabled = Boolean(googleClientId && googleClientSecret);

export const auth = betterAuth({
  // URL publica que ve el navegador: la del FRONT, porque /api llega al back a traves del proxy.
  // El secret se lee solo de BETTER_AUTH_SECRET.
  baseURL: requireEnv("BETTER_AUTH_URL"),
  database: mongodbAdapter(mongoClient.db(), { client: mongoClient }),
  emailAndPassword: {
    enabled: true, // hashea con scrypt; minimo 8 caracteres por defecto
  },
  socialProviders: {
    github: {
      clientId: requireEnv("GITHUB_CLIENT_ID"),
      clientSecret: requireEnv("GITHUB_CLIENT_SECRET"),
    },
    ...(googleEnabled && {
      google: { clientId: googleClientId!, clientSecret: googleClientSecret! },
    }),
  },
  // Si alguien registrado con email+password entra con GitHub/Google (mismo email), une las cuentas.
  // Seguro porque ambos proveedores devuelven emails verificados.
  account: {
    accountLinking: { trustedProviders: ["github", "google"] },
  },
  // Detras del proxy de Render (y del rewrite del Static Site) la IP del visitante llega en
  // X-Forwarded-For. Sin esto el rate limit de Better Auth usa UN contador compartido por todos
  // los usuarios, y unos pocos logins fallidos bloquearian el login para cualquiera.
  advanced: {
    ipAddress: { ipAddressHeaders: ["x-forwarded-for", "x-real-ip"] },
  },
  // admin(): agrega user.role ("user" por defecto) y endpoints para listar usuarios y cambiar roles.
  plugins: [admin()],
});
