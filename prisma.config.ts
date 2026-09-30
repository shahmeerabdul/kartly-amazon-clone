import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Local dev keeps secrets in .env.local; on Vercel they come from the environment.
config({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // The CLI (migrations) uses the direct connection; the app uses the pooled one.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
