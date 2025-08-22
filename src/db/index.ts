import { env } from "@/env";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.NODE_ENV === "production" ? env.DATABASE_AUTH_TOKEN : undefined,
});

export const db = drizzle({ client });
