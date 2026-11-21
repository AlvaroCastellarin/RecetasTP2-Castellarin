// El store: la sesion no vive aca, la maneja useSession() de Better Auth (ver lib/auth-client.ts).
import { configureStore } from "@reduxjs/toolkit";
import { recipesApi } from "./api";

export const store = configureStore({
  reducer: {
    [recipesApi.reducerPath]: recipesApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(recipesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
