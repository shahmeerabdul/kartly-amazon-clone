import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });
  const cat = req.nextUrl.searchParams.get("cat") || undefined;
  const results = await db.product.findMany({
    where: {
      ...(cat ? { category: { slug: cat } } : {}),
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    orderBy: { ratingCount: "desc" },
    take: 8,
    select: { id: true, slug: true, title: true, thumbnail: true, priceCents: true },
  });
  return NextResponse.json({ results }, { headers: { "Cache-Control": "public, max-age=60" } });
}
