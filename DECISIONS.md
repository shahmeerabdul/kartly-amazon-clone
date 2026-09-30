# Decisions

- Store name "Kartly": the plan's name was a placeholder; short, original, not Amazon's.
- Next.js 16.3 App Router: latest stable; auth guard lives in `proxy.ts` (Next 16 renamed middleware).
- Prisma 7.10 with the `@prisma/adapter-pg` driver adapter: Prisma 7 requires an adapter; npm's default tag was an 8.0 release candidate, so pinned stable.
- Prisma CLI uses `DIRECT_URL`, the app uses pooled `DATABASE_URL`: migrations need a direct connection on Neon.
- Auth.js v5 split into `auth.config.ts` (no DB) and `auth.ts` (credentials + bcrypt): keeps the proxy light.
- Seed data from DummyJSON (194 products) saved to `prisma/seed-data/products.json`: seeding never depends on the network.
