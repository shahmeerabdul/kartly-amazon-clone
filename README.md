# Kartly

A fast, ad-free Amazon-style store: find, decide, buy and track, end to end.

**Live:** https://kartly-amazon-clone.vercel.app

## Try it in 30 seconds

1. Search "phone" in the header. Suggestions appear as you type, and the arrow keys work.
2. Open a product and click **Add to Cart** as a guest.
3. Click **Proceed to checkout**, then **Try the demo account**. Your guest cart comes with you.
4. Click **Use test card** (4242 4242 4242 4242), then **Place your order**.
5. See it under **Returns & Orders**, where you can cancel it or buy it again.

Checkout is a demo: no real payment is taken, and tax is a flat 8% estimate.

## What's built

- **Header:** search by department with instant suggestions, a location picker (saved address, US ZIP or country and city), an account menu, and a live cart count.
- **"All" drawer:** 12 departments and 37 subcategories, with Amazon-style sliding panels.
- **Homepage:** photo tiles, four-photo cards, Today's Deals, top-rated rows and recently viewed items.
- **Search:** department, subcategory, rating, price, brand and stock filters. Every filter lives in the URL and shows as a removable chip. Six sort orders and pagination.
- **Product page:** gallery with zoom, a buy box showing the total including delivery, Add to List, a star histogram filter, and Verified Purchase reviews.
- **Cart:** guest and signed-in carts, save for later, and stock limits. The guest cart merges on sign-in.
- **Checkout:** one page with sections that edit in place. The order runs in a single database transaction and is safe against double submits.
- **Orders:** a list with a period filter, a detail page with a progress bar, cancel, buy it again, and review prompts.
- **Your Account:** login and security settings, an address book, the Wish List, and a Today's Deals page.

## Stack

Next.js 16 (App Router, server actions), TypeScript, Tailwind CSS 4, Prisma 7 on Neon Postgres, Auth.js v5, Zod, Playwright, Vercel.

## Run locally

```bash
cp .env.example .env.local   # fill in your own values
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Tests: `npm run test:e2e` runs locally. Set `BASE_URL=https://kartly-amazon-clone.vercel.app` to run them against the live site.

## Built with AI

Built with Claude Code. The full record of prompts, responses and commands is in [`.agent-logs/`](.agent-logs/). It is captured automatically by a Claude Code hook (`.claude/hooks/capture.mjs`), which redacts connection strings, tokens, passwords and personal emails.

Product data comes from DummyJSON. Homepage photos are CC0 images from StockSnap; credits are in `public/hero/CREDITS.json` and `public/cards/CREDITS.json`. Design decisions are logged in `DECISIONS.md`.
