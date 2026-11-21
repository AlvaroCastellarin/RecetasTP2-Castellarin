// Carga datos de prueba: un admin, un usuario comun y algunas recetas.
// Uso: npm run seed  (lee backend/.env; es idempotente, se puede correr varias veces)
import "dotenv/config";
import mongoose from "mongoose";
import { auth, mongoClient } from "../src/lib/auth.js";
import Recipe from "../src/models/Recipe.js";

// Usuarios de prueba para la correccion (tambien estan en el README).
// Las contraseñas se pueden pisar con SEED_ADMIN_PASSWORD / SEED_USER_PASSWORD.
const TEST_USERS = [
  {
    name: "Admin Recetario",
    email: "admin@recetario.test",
    password: process.env.SEED_ADMIN_PASSWORD || "AdminReceta2026",
    role: "admin",
  },
  {
    name: "Usuario Recetario",
    email: "user@recetario.test",
    password: process.env.SEED_USER_PASSWORD || "UserReceta2026",
    role: "user",
  },
] as const;

const SAMPLE_RECIPES = [
  {
    title: "Milanesas a la napolitana",
    description: "Clasico argentino: milanesas de carne con salsa de tomate, jamon y queso gratinado.",
    ingredients: ["4 milanesas de nalga", "200 g de salsa de tomate", "4 fetas de jamon", "200 g de mozzarella", "Oregano"],
    prepMinutes: 40,
    servings: 4,
    difficulty: "media",
    vegetarian: false,
    publishedAt: new Date("2026-03-10"),
  },
  {
    title: "Ensalada caprese",
    description: "Tomate, mozzarella fresca y albahaca con aceite de oliva. Lista en minutos.",
    ingredients: ["3 tomates", "250 g de mozzarella fresca", "Hojas de albahaca", "Aceite de oliva", "Sal"],
    prepMinutes: 10,
    servings: 2,
    difficulty: "facil",
    vegetarian: true,
    publishedAt: new Date("2026-04-02"),
  },
  {
    title: "Empanadas de carne cortada a cuchillo",
    description: "Empanadas tucumanas jugosas, con carne picada a cuchillo, cebolla de verdeo y comino.",
    ingredients: ["12 tapas de empanada", "500 g de carne", "2 cebollas de verdeo", "1 huevo duro", "Comino", "Pimenton"],
    prepMinutes: 90,
    servings: 6,
    difficulty: "dificil",
    vegetarian: false,
    publishedAt: new Date("2026-05-25"),
  },
  {
    title: "Guiso de lentejas",
    description: "Guiso bien de invierno, con lentejas, verduras y chorizo colorado.",
    ingredients: ["400 g de lentejas", "1 chorizo colorado", "1 zanahoria", "1 cebolla", "1 morron", "Pure de tomate"],
    prepMinutes: 75,
    servings: 6,
    difficulty: "media",
    vegetarian: false,
    publishedAt: new Date("2026-06-20"),
  },
  {
    title: "Tortilla de papas",
    description: "Tortilla de papas jugosa por dentro, con o sin cebolla segun el gusto.",
    ingredients: ["4 papas", "5 huevos", "1 cebolla", "Aceite", "Sal"],
    prepMinutes: 35,
    servings: 4,
    difficulty: "media",
    vegetarian: true,
    publishedAt: new Date("2026-07-09"),
  },
  {
    title: "Panqueques con dulce de leche",
    description: "Panqueques finitos rellenos de dulce de leche, opcionalmente flambeados.",
    ingredients: ["2 huevos", "250 ml de leche", "120 g de harina", "Manteca", "Dulce de leche"],
    prepMinutes: 25,
    servings: 4,
    difficulty: "facil",
    vegetarian: true,
    publishedAt: new Date("2026-08-15"),
  },
  {
    title: "Locro criollo",
    description: "Locro patrio con maiz blanco, porotos, zapallo y carnes. Ideal para el 25 de mayo.",
    ingredients: ["500 g de maiz blanco", "250 g de porotos", "500 g de zapallo", "Panceta", "Chorizo", "Falda"],
    prepMinutes: 240,
    servings: 8,
    difficulty: "dificil",
    vegetarian: false,
    publishedAt: new Date("2026-05-20"),
  },
  {
    title: "Wok de vegetales",
    description: "Vegetales salteados al wok con salsa de soja y jengibre. Rapido y saludable.",
    ingredients: ["1 morron", "1 zucchini", "1 zanahoria", "Brotes de soja", "Salsa de soja", "Jengibre"],
    prepMinutes: 20,
    servings: 2,
    difficulty: "facil",
    vegetarian: true,
    publishedAt: new Date("2026-09-01"),
  },
  {
    title: "Pastel de papas",
    description: "Carne picada con cebolla y morron, cubierta de pure de papas gratinado.",
    ingredients: ["1 kg de papas", "500 g de carne picada", "1 cebolla", "1 morron", "Aceitunas", "Huevo"],
    prepMinutes: 60,
    servings: 6,
    difficulty: "media",
    vegetarian: false,
    publishedAt: new Date("2026-10-05"),
  },
  {
    title: "Alto Guiso",
    description:
      "Moñitos al dente en una salsa cremosa de jamón cocido y arvejas, terminados con queso rallado. Rápidos y rendidores.",
    ingredients: [
      "500 g de fideos moñito",
      "200 ml de crema de leche",
      "150 g de jamón cocido en cubos",
      "1 lata de arvejas",
      "1 cebolla",
      "1 cucharada de manteca",
      "Queso rallado",
      "Sal, pimienta y nuez moscada",
    ],
    prepMinutes: 25,
    servings: 4,
    difficulty: "facil",
    vegetarian: false,
    publishedAt: new Date("2026-11-21"),
  },
  {
    title: "Chipa",
    description: "Pancitos de queso tipicos del litoral, crocantes por fuera y tiernos por dentro.",
    ingredients: ["500 g de almidon de mandioca", "250 g de queso", "2 huevos", "100 g de manteca", "Leche"],
    prepMinutes: 45,
    servings: 6,
    difficulty: "facil",
    vegetarian: true,
    publishedAt: new Date("2026-11-01"),
  },
];

async function ensureUser(user: (typeof TEST_USERS)[number]): Promise<string> {
  const users = mongoClient.db().collection("user");
  let existing = await users.findOne({ email: user.email });

  if (!existing) {
    // signUpEmail hashea la contraseña igual que el registro normal.
    await auth.api.signUpEmail({ body: { name: user.name, email: user.email, password: user.password } });
    existing = await users.findOne({ email: user.email });
    console.log(`[seed] usuario creado: ${user.email}`);
  } else {
    console.log(`[seed] usuario ya existia: ${user.email}`);
  }

  await users.updateOne({ email: user.email }, { $set: { role: user.role } });
  return String(existing!._id);
}

async function main(): Promise<void> {
  await mongoose.connect(process.env.MONGODB_URI!);
  await mongoClient.connect();

  const [adminId] = await Promise.all(TEST_USERS.map(ensureUser));

  for (const recipe of SAMPLE_RECIPES) {
    await Recipe.updateOne(
      { title: recipe.title },
      { $setOnInsert: { ...recipe, createdBy: adminId } },
      { upsert: true }
    );
  }
  console.log(`[seed] ${SAMPLE_RECIPES.length} recetas de ejemplo aseguradas`);
}

main()
  .catch((error: unknown) => {
    console.error("[seed] error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    await mongoClient.close();
  });
