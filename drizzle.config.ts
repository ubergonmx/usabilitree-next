import { env } from "@/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.NODE_ENV === "production" ? env.DATABASE_AUTH_TOKEN : undefined,
  },
  verbose: true,
  strict: true,
});
