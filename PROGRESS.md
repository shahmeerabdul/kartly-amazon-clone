# Progress

Production URL: _pending_

## Phase 1: Scaffold and deploy
- [x] Preflight (node, git, gh)
- [ ] Preflight (vercel, neonctl logins)
- [x] Next.js 16 + TypeScript strict + Tailwind 4
- [x] Prisma schema + client, Auth.js wiring, proxy guard
- [x] `.env.example` with placeholders
- [x] Public GitHub repo
- [x] Neon database + `.env.local`
- [ ] Vercel project, env vars, git connect
- [ ] First production deploy

## Phase 2: Data and shell
- [x] Migration + idempotent seed (products, categories, reviews, demo user + orders)
- [x] Header, sub-nav, "All" drawer, footer
- [x] Homepage: hero carousel, category cards, product rows

## Phase 3: Discovery
- [x] Search page with filters, chips, sort, pagination
- [x] Instant suggestions
- [x] Product page

## Phase 4: Cart and auth
- [ ] Guest cart + cookie
- [ ] Register, two-step sign-in, demo account, sign out
- [ ] Cart merge on sign-in

## Phase 5: Checkout and orders
- [ ] Checkout (address, payment, review, place order transaction)
- [ ] Orders list + detail, cancel, buy again
- [ ] Tag `v1-core-loop`

## Phase 6: Tier 2
- [ ] Wish list
- [ ] Write a review (Verified Purchase)
- [ ] Recently viewed
- [ ] Account + address book
- [ ] Today's Deals

## Phase 7: Polish and QA
- [ ] Mobile pass, loading/empty/error states, a11y pass
- [ ] Playwright guest-to-order test

## Phase 8: Docs
- [ ] README with screenshots
