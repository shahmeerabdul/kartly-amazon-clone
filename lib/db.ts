import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // Neon closes idle connections, so recycle them quickly and fail fast on a bad connect
  // instead of reusing a dead socket ("Connection terminated unexpectedly").
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
    keepAlive: true,
    allowExitOnIdle: true,
  });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

// Keep one client across hot reloads in dev and across warm invocations in production.
globalForPrisma.prisma = db;
