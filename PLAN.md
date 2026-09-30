# Amazon Clone: Build Plan for Claude Code

Sep 30, 2026 · @Shahmeer

## How to use this plan

Build the core shopping loop (find, decide, buy, track) end to end first, deploy it early, then add polish. Target about 12 hours of work, well inside the 24-hour window, since speed is judged. You do Phase 0 once (about 45 minutes); the agent does everything after it, apart from the videos and pressing submit.

### Rules for the agent

- Do every step yourself from the terminal. Stop to ask me only for what needs my browser (an account sign-up or a CLI login), and give me the one exact command to run.
- Work one phase at a time. Finish every Tier 1 feature end to end before starting any Tier 2 work.
- After each phase, run `npm run lint`, `npm run typecheck` and `npm run build`. Fix every error before moving on.
- Commit and push after each phase, including `.agent-logs/`. Use small commits with conventional messages (`feat: cart page`).
- Deploy at the end of Phase 1 and keep production working after every push.
- If your context resets or you are unsure where you are, re-read PLAN.md and PROGRESS.md and continue from the first unticked item.
- Never put secrets in prompts, code or commits, and never print a secret value to the terminal. `.agent-logs/` is public, so anything in a prompt or command output can get published. Write secret values straight into `.env.local` (gitignored) or pipe them into `vercel env add` through stdin; `.env.example` holds placeholders only.
- Prefer server components for reads and server actions for writes. Add a dependency only when it saves real time.
- Every page has loading, empty and error states. No dead links or buttons that do nothing: a feature that is not built is hidden, not stubbed.
- Guests can browse, search and use the cart. Sign-in is required only for checkout, orders, account and lists.
- If the store name is still the placeholder `YOUR_STORE_NAME`, pick a short original name and use it everywhere.
- Log each decision in `DECISIONS.md` as one line (what and why). The README is written from it.

## Phase 0: your setup (about 45 minutes, once)

1. Install Node.js (LTS), Git, the GitHub CLI (`gh`) and the Vercel CLI (`npm i -g vercel`).
2. Create free GitHub, Vercel and Neon accounts. Sign in to Vercel with your GitHub account.
3. Log in from your own terminal, not through a prompt: `gh auth login`, `vercel login` and `npx neonctl auth`.
4. Sign up on amazon.com and go through every flow for about 30 minutes. Screenshot each one. Write down 3 things that annoy you.
5. Put `PLAN.md` in the project folder, the screenshots in `docs/reference/`, and your 3 annoyances in `docs/reference/notes.md`.
6. Set up 8x agent capture from the brief and check the capture test passes.
7. Send the hand-off prompt.

## Product scope

### Tier 1: must ship (the core loop)

| # | Feature | Why it comes first |
| --- | --- | --- |
| 1 | Header and navigation: search with category select, deliver-to ZIP, account menu, orders, live cart count, "All" side drawer | On every page; the first thing reviewers see |
| 2 | Homepage: hero carousel, category cards, product rows | Entry point from the live link |
| 3 | Search and category browse: filters, sort, pagination, instant suggestions | The main way people find products |
| 4 | Product page: gallery, price, delivery date, Add to Cart, Buy Now, reviews | Where the buying decision happens |
| 5 | Cart: guest and signed-in, quantity, delete, save for later, subtotal | Required to buy |
| 6 | Auth: register, sign in, sign out, one-click demo account | Required for checkout; the demo account lets reviewers skip sign-up |
| 7 | Checkout: address, delivery speed, mock payment, review, place order | Completes the loop |
| 8 | Orders: history, detail, cancel, buy it again | Proves the loop closed |

### Tier 2: after Tier 1 is live and tested

1. Wish list: add from the product page, move to cart.
2. Write a review: users who bought the item get a Verified Purchase badge.
3. Recently viewed row on the homepage and product page.
4. Your Account page and address book.
5. Today's Deals page, sorted by biggest discount.
6. Playwright test of the full guest-to-order flow.

### Tier 3: stretch, only with spare time

- Stripe Checkout in test mode instead of the mock payment.
- Returns flow on delivered orders.
- Dark mode.

### Better than the original

- Instant search suggestions with thumbnail and price, fully keyboard navigable.
- Filters apply instantly, show result counts and appear as removable chips. All filter state lives in the URL.
- No sponsored results or ad clutter.
- The full price including delivery shows on the product page, before checkout.
- One-page checkout where each section edits in place.
- Accessible by default: visible focus states, alt text, labeled inputs, WCAG AA contrast.

### Deliberately left out

| Left out | Reason |
| --- | --- |
| Prime Video, Music, Kindle, Alexa, Fresh | Separate products, not the shopping loop |
| Third-party sellers and a seller dashboard | Doubles the data model for little demo value |
| Real payments, carriers and regional tax | Need business accounts; mocked and clearly labeled (flat 8% estimated tax) |
| Multiple currencies and languages | One market (USD, English) is enough to judge the UX |
| Subscribe & Save, gift cards, coupons | Secondary purchase paths |
| Email notifications | Confirmation shows on screen instead |
| Ads and sponsored placements | Removed on purpose as an improvement |

## Tech stack and architecture

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router) + TypeScript strict |
| Styling | Tailwind CSS, shadcn/ui, lucide-react |
| Database | Postgres on Neon + Prisma ORM |
| Auth | Auth.js (NextAuth v5), Credentials (bcrypt), JWT sessions |
| Validation | Zod on every form and server action |
| Images | next/image with seed image host in remotePatterns |
| Testing | Playwright (Tier 2) |
| Hosting | Vercel, deploying on every push to main |

### Key design decisions

- **Reads and writes:** reads in server components through `lib/data/*`. Writes are server actions in `lib/actions/*`; each validates with Zod and checks the session.
- **Cart:** every visitor has a cart. A guest gets an httpOnly `guestCartId` cookie on first add. On sign-in, guest items merge into the user's cart (quantities add, capped by stock) and the cookie clears.
- **Search:** Postgres case-insensitive matching on title, brand, category and tags. Suggestions from `/api/search/suggest?q=`, debounced 150 ms, top 8.
- **Money:** integer cents everywhere, formatted only in the UI.
- **Delivery dates:** Standard 5 days (free over $35, else $5.99); Express 2 days ($9.99). Shown as real dates.
- **Order status:** stored as Placed or Cancelled. Displayed status: Shipped after 1 hour, Delivered after 3 hours, derived from `createdAt`. Cancel only while Placed.
- **Recently viewed:** cookie with last 10 product ids.

### Folder structure

```
app/ page.tsx s/ dp/[slug]/ cart/ checkout/ orders/ orders/[id]/ signin/ register/ account/ wishlist/ deals/
     api/search/suggest/route.ts api/auth/[...nextauth]/route.ts
components/ header/ product/ cart/ checkout/ ui/
lib/ db.ts auth.ts format.ts delivery.ts data/ actions/
prisma/ schema.prisma seed.ts seed-data/
tests/e2e/
docs/reference/
```

## Data model and seed data

Models: User, Address, Category, Product, Review, Cart, CartItem, Order (status PLACED|CANCELLED, snapshots), OrderItem (snapshots), WishlistItem. Money in cents.

### Seed data

- Source: DummyJSON `https://dummyjson.com/products?limit=0`; save to `prisma/seed-data/products.json` and commit.
- `discountPercentage` sets `listPriceCents`. 4-5 "About this item" bullets. Specs: brand, dimensions, weight, SKU, warranty.
- Keep source reviews + ~5 generated per product. `ratingCount` derived from id (50–25,000), stable.
- Map to Amazon-style departments; merge categories with fewer than 5 products.
- Demo user `demo@example.com`, password from `DEMO_USER_PASSWORD`, 1 address, 2 past orders (delivered + shipped).
- `npm run db:seed` is idempotent.

## Pages and acceptance criteria

### Global header, sub-nav and footer
- Dark top bar: wordmark; "Deliver to" ZIP modal (cookie); search with category dropdown; account hover dropdown (sign in, demo account, lists, orders, account, sign out); "Returns & Orders"; cart with live count.
- Search suggestions: thumbnail, title, price; arrows/Enter/Esc; last row "See all results for …".
- Sub-nav: "All" drawer of departments + quick links.
- Footer: "Back to top", link columns to real pages only.
- Mobile <768px: two rows, drawer behind menu button.

### Homepage `/`
- Hero carousel 3–4 in-house gradient banners, auto-advance 6s, arrows, pause on hover.
- 4-image category cards overlapping hero.
- ≥3 product rows: Today's Deals, Top rated in a department, Recently viewed.

### Search `/s` — params `k, cat, min, max, rating, brand, stock, sort, page`
- "1-24 of 83 results for "phone"". Sidebar: department, rating, price ranges + custom, brands (top 10), in stock.
- Sort: Featured, Price low/high, high/low, Avg. review, Newest. Cards with image, 2-line title, stars, price + list + % off, delivery date, Add to cart.
- 24/page, pagination, empty state, URL state, removable chips, mobile bottom sheet.

### Product `/dp/[slug]`
- Breadcrumb; gallery with thumbnails + hover zoom; title, store link, stars, price block, bullets.
- Buy box: price, delivery, ZIP, stock, qty select (min(stock,10)), Add to Cart, Buy Now, Add to List.
- Added-to-cart side sheet; header count updates. Buy Now → `/checkout?buy=<id>&qty=<n>`.
- Specs, "Customers also viewed", reviews with histogram filter, sort, Verified Purchase. 404 on unknown slug.

### Cart `/cart`
- Items with qty (optimistic), Delete, Save for later; subtotal; Saved for later; empty state; guest cart persists and merges; stock caps.

### Auth `/signin` `/register`
- Two-step sign-in; register (name, email, password ≥8, confirm); "Try the demo account"; inline errors; callbackUrl; middleware guards `/checkout`, `/orders`, `/account`, `/wishlist`.

### Checkout `/checkout`
- Minimal header; 3 in-place sections: address, payment (mock, Luhn, test card 4242…), review + delivery speed.
- Summary with 8% tax; one transaction (re-check stock, decrement, create order with snapshots, clear cart items); no double orders.
- Redirect to `/orders/[id]?placed=1`.

### Orders
- List newest first with details, thumbnails; View, Buy it again, Cancel (Placed only), Write a review (delivered). Period filter.
- Detail: progress bar, address, last 4, breakdown, items.

### Tier 2 pages
- `/wishlist`, `/account`, `/account/addresses`, `/deals`, review form.

## UI and design system

Colors: header #131921, subnav #232F3E, footer-top #37475A, accent #FF9900, search-btn #FEBD69, cart-btn #FFD814 (hover #F7CA00), buy-btn #FFA41C (hover #FA8900), link #007185 (hover #C7511F), deal #CC0C39, in-stock #007600, star #FFA41C, page-bg #EAEDED, text #0F1111 (secondary #565959), border #D5D9D9.

Font Arial stack, 14px base, product title 24px. `<Price>` with superscript $ and cents. `<Stars>` with half stars + aria label. Pill buttons; 8px radius cards/inputs. Skeletons, toasts, inline errors. Max width 1500px. Focus outlines. Title + meta on every route, favicon. Never use Amazon logos or assets.

## Build phases

| Phase | Build | Done when |
| --- | --- | --- |
| 1. Scaffold and deploy | Preflight, public repo, Neon, Vercel, Next.js, Tailwind, shadcn/ui, Prisma, Auth.js, `.env.example` | Blank homepage on production URL |
| 2. Data and shell | Schema, migration, seed, header, sub-nav, drawer, footer, homepage | Homepage shows real products on production |
| 3. Discovery | Search, suggestions, filters, sort, pagination, product page | Any product can be found and opened |
| 4. Cart and auth | Guest cart, register, sign-in, demo, merge | Guest adds 2 items, signs in, keeps both |
| 5. Checkout and orders | Addresses, checkout, order transaction, orders pages | Full loop in incognito on prod; tag `v1-core-loop` |
| 6. Tier 2 | Wish list, reviews, recently viewed, account, deals | Each shipped item works |
| 7. Polish and QA | Mobile, states, a11y, Playwright | Test passes; Lighthouse 90+ |
| 8. Docs | README with Playwright screenshots | Submission |

## Repo, database and deployment (Phase 1)

1. Preflight: `node -v`, `git --version`, `gh auth status`, `vercel whoami`, `npx neonctl me`.
2. Repo: `.gitignore` covering `.env*` but not `.env.example`; `gh repo create <name>-amazon-clone --public --source=. --remote=origin --push`.
3. Database: `npx neonctl projects create`; write pooled/direct strings to `.env.local` as `DATABASE_URL` / `DIRECT_URL`, never to the terminal.
4. Secrets: `AUTH_SECRET`, `DEMO_USER_PASSWORD` via `openssl rand -base64 32` straight into `.env.local`.
5. `.env.example` with placeholders only.
6. `vercel link --yes`, `vercel env add` from stdin for production and preview, `vercel git connect`.
7. Build command `prisma generate && prisma migrate deploy && next build`; image host in `images.remotePatterns`.
8. `npm run db:seed`, `vercel deploy --prod`; URL in README.md and PROGRESS.md.
9. After every phase: push, `vercel ls`, curl home, search, product, `/cart` for 200.

## README (Phase 8)

Name + pitch + live/walkthrough links; "Try it in 30 seconds"; 4 screenshots; built checklist; product judgement; architecture; running locally; limitations; AI usage (`.agent-logs/`); time spent.
