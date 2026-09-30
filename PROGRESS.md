# Progress

Production URL: https://kartly-amazon-clone.vercel.app

## Phase 1: Scaffold and deploy
- [x] Preflight (node, git, gh)
- [x] Preflight (vercel, neonctl logins)
- [x] Next.js 16 + TypeScript strict + Tailwind 4
- [x] Prisma schema + client, Auth.js wiring, proxy guard
- [x] `.env.example` with placeholders
- [x] Public GitHub repo
- [x] Neon database + `.env.local`
- [x] Vercel project, env vars, git connect
- [x] First production deploy

## Phase 2: Data and shell
- [x] Migration + idempotent seed (products, categories, reviews, demo user + orders)
- [x] Header, sub-nav, "All" drawer, footer
- [x] Homepage: hero carousel, category cards, product rows

## Phase 3: Discovery
- [x] Search page with filters, chips, sort, pagination
- [x] Instant suggestions
- [x] Product page

## Phase 4: Cart and auth
- [x] Guest cart + cookie
- [x] Register, two-step sign-in, demo account, sign out
- [x] Cart merge on sign-in (Playwright verified)

## Phase 5: Checkout and orders
- [x] Checkout (address, payment, review, place order transaction)
- [x] Orders list + detail, cancel, buy again
- [x] Tag `v1-core-loop` (all 11 e2e tests pass on production)

## Phase 6: Tier 2
- [x] Wish list (Add to List, /wishlist, move to cart)
- [x] Write a review (buyers only, Verified Purchase, updates average)
- [x] Recently viewed
- [x] Account + address book (drawer section, /account, login & security, addresses)
- [x] Today's Deals (/deals)

## Phase 7: Polish and QA
- [ ] Mobile pass, loading/empty/error states, a11y pass
- [x] Playwright guest-to-order test (11 e2e tests)

## Phase 8: Docs
- [ ] README with screenshots
