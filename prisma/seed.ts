import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../lib/generated/prisma/client";
import { TAXONOMY, classify } from "../lib/taxonomy";

config({ path: ".env.local", quiet: true });

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }),
});

type SourceReview = { rating: number; comment: string; date: string; reviewerName: string };
type SourceProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string;
  shippingInformation: string;
  returnPolicy: string;
  reviews: SourceReview[];
  images: string[];
  thumbnail: string;
};


// Small deterministic PRNG so reseeds produce identical data.
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const REVIEWERS = [
  "Jordan M.", "Priya S.", "Alex R.", "Taylor K.", "Sam W.", "Chris P.", "Morgan L.", "Riley T.",
  "Jamie D.", "Casey B.", "Avery H.", "Drew N.", "Quinn F.", "Reese G.", "Skyler J.", "Parker V.",
];
const REVIEW_TEXT: Record<number, { title: string; body: string }[]> = {
  5: [
    { title: "Exactly what I wanted", body: "Arrived quickly and works perfectly. The quality is better than I expected for the price." },
    { title: "Five stars, would buy again", body: "I've been using it every day for a few weeks now and have zero complaints." },
    { title: "Great value", body: "Solid build, looks just like the photos, and it was packaged well." },
  ],
  4: [
    { title: "Very good overall", body: "Does the job well. Minor nitpicks, but nothing that would stop me recommending it." },
    { title: "Happy with this purchase", body: "Good quality and fair price. Took a day longer to arrive than expected." },
  ],
  3: [
    { title: "It's okay", body: "Works as described but feels a little cheaper than I hoped. Fine for the price." },
    { title: "Average", body: "Not bad, not great. It does what it says, just nothing special." },
  ],
  2: [
    { title: "Not quite as described", body: "The finish wasn't as nice as the pictures and it stopped working as well after a week." },
  ],
  1: [
    { title: "Disappointed", body: "Didn't meet my expectations at all. I ended up returning it." },
  ],
};

function pickRating(avg: number, r: () => number) {
  const v = avg + (r() - 0.5) * 2.4;
  return Math.max(1, Math.min(5, Math.round(v)));
}

function bulletsFor(p: SourceProduct) {
  const sentences = p.description.split(/(?<=\.)\s+/).filter(Boolean);
  const d = p.dimensions;
  return [
    ...sentences.slice(0, 2),
    `Dimensions: ${d.width} x ${d.height} x ${d.depth} cm; weight ${p.weight} oz.`,
    `${p.warrantyInformation}. ${p.returnPolicy}.`,
    `${p.shippingInformation}.`,
  ].slice(0, 5);
}

async function main() {
  const file = join(process.cwd(), "prisma", "seed-data", "products.json");
  const { products } = JSON.parse(readFileSync(file, "utf8")) as { products: SourceProduct[] };

  console.log("Wiping existing data…");
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.cart.deleteMany();
  await db.wishlistItem.deleteMany();
  await db.review.deleteMany();
  await db.address.deleteMany();
  await db.user.deleteMany();
  await db.product.deleteMany();
  await db.subcategory.deleteMany();
  await db.category.deleteMany();

  // Every department and subcategory in the taxonomy must end up with products.
  const placed = new Map(products.map((p) => [p.id, classify(p.category, p.tags)]));
  const thumbFor = (dept: string) => products.find((p) => placed.get(p.id)![0] === dept)?.thumbnail ?? "";
  await db.category.createMany({
    data: TAXONOMY.map((d, i) => ({ id: `cat_${d.slug}`, slug: d.slug, name: d.name, imageUrl: thumbFor(d.slug), sortOrder: i })),
  });
  await db.subcategory.createMany({
    data: TAXONOMY.flatMap((d) => d.subs.map((s, i) => ({ id: `sub_${s.slug}`, slug: s.slug, name: s.name, sortOrder: i, categoryId: `cat_${d.slug}` }))),
  });
  for (const d of TAXONOMY) for (const sub of d.subs) {
    if (![...placed.values()].some(([dp, sb]) => dp === d.slug && sb === sub.slug)) throw new Error(`Empty subcategory: ${d.slug}/${sub.slug}`);
  }

  const usedSlugs = new Set<string>();
  const productRows: Prisma.ProductCreateManyInput[] = [];
  const reviewRows: Prisma.ReviewCreateManyInput[] = [];
  const now = Date.now();

  for (const p of products) {
    const r = rng(p.id * 7919);
    const [deptSlug, subSlug] = placed.get(p.id)!;
    let slug = slugify(p.title);
    if (usedSlugs.has(slug)) slug = `${slug}-${p.id}`;
    usedSlugs.add(slug);

    const priceCents = Math.round(p.price * 100);
    const listPriceCents =
      p.discountPercentage >= 5 ? Math.round(priceCents / (1 - p.discountPercentage / 100)) : null;
    const id = `p${p.id}`;

    productRows.push({
      id,
      slug,
      title: p.title,
      brand: p.brand ?? null,
      description: p.description,
      bullets: bulletsFor(p),
      priceCents,
      listPriceCents,
      rating: Math.round(p.rating * 10) / 10,
      ratingCount: 50 + Math.floor(r() * 24950),
      stock: p.stock,
      images: p.images,
      thumbnail: p.thumbnail,
      specs: {
        Brand: p.brand ?? "Generic",
        "Product Dimensions": `${p.dimensions.width} x ${p.dimensions.height} x ${p.dimensions.depth} cm`,
        "Item Weight": `${p.weight} ounces`,
        SKU: p.sku,
        Warranty: p.warrantyInformation,
      },
      tags: p.tags,
      categoryId: `cat_${deptSlug}`,
      subcategoryId: `sub_${subSlug}`,
      // Spread creation dates so "Newest arrivals" has a meaningful order.
      createdAt: new Date(now - Math.floor(r() * 180) * 86_400_000),
    });

    for (const sr of p.reviews) {
      reviewRows.push({
        productId: id,
        authorName: sr.reviewerName,
        rating: sr.rating,
        title: sr.comment.replace(/[.!]$/, ""),
        body: sr.comment,
        verified: r() > 0.3,
        createdAt: new Date(now - Math.floor(r() * 120) * 86_400_000),
      });
    }
    for (let i = 0; i < 5; i++) {
      const rating = pickRating(p.rating, r);
      const options = REVIEW_TEXT[rating];
      const text = options[Math.floor(r() * options.length)];
      reviewRows.push({
        productId: id,
        authorName: REVIEWERS[Math.floor(r() * REVIEWERS.length)],
        rating,
        title: text.title,
        body: text.body,
        verified: r() > 0.25,
        createdAt: new Date(now - Math.floor(r() * 365) * 86_400_000),
      });
    }
  }

  await db.product.createMany({ data: productRows });
  await db.review.createMany({ data: reviewRows });
  console.log(`Seeded ${TAXONOMY.length} departments, ${TAXONOMY.reduce((n, d) => n + d.subs.length, 0)} subcategories, ${productRows.length} products, ${reviewRows.length} reviews`);

  const password = process.env.DEMO_USER_PASSWORD;
  if (!password) throw new Error("DEMO_USER_PASSWORD is not set");
  const demo = await db.user.create({
    data: {
      name: "Demo Shopper",
      email: "demo@example.com",
      passwordHash: await bcrypt.hash(password, 10),
      addresses: {
        create: {
          fullName: "Demo Shopper",
          line1: "410 Terry Ave N",
          city: "Seattle",
          state: "WA",
          zip: "98109",
          phone: "206-555-0142",
          isDefault: true,
        },
      },
    },
    include: { addresses: true },
  });

  const addr = demo.addresses[0];
  const snapshot = {
    fullName: addr.fullName, line1: addr.line1, line2: addr.line2, city: addr.city,
    state: addr.state, zip: addr.zip, country: addr.country, phone: addr.phone,
  };
  const pastOrders = [
    { ageMs: 9 * 86_400_000, items: [["p121", 1], ["p78", 2]] }, // delivered
    { ageMs: 90 * 60_000, items: [["p6", 1]] }, // shipped (older than 1 hour, newer than 3)
  ] as const;

  for (const o of pastOrders) {
    const createdAt = new Date(now - o.ageMs);
    const lines = o.items.map(([pid, qty]) => {
      const p = productRows.find((x) => x.id === pid) ?? productRows[0];
      return { productId: p.id!, title: p.title, image: p.thumbnail, priceCents: p.priceCents, quantity: qty };
    });
    const subtotalCents = lines.reduce((s, l) => s + l.priceCents * l.quantity, 0);
    const shippingCents = subtotalCents >= 3500 ? 0 : 599;
    const taxCents = Math.round(subtotalCents * 0.08);
    await db.order.create({
      data: {
        userId: demo.id,
        subtotalCents,
        shippingCents,
        taxCents,
        totalCents: subtotalCents + shippingCents + taxCents,
        shippingAddress: snapshot,
        deliveryOption: "standard",
        estimatedDelivery: new Date(createdAt.getTime() + 5 * 86_400_000),
        paymentLast4: "4242",
        createdAt,
        items: { create: lines },
      },
    });
  }
  console.log("Seeded demo user with 1 address and 2 orders");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
