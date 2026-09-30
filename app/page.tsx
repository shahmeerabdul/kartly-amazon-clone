import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { ProductRow } from "@/components/product/product-row";
import { getCategoryCards, getProductsByIds, getTodaysDeals, getTopRated } from "@/lib/data/catalog";

export default async function Home() {
  const recentIds = ((await cookies()).get("recent")?.value ?? "").split(".").filter(Boolean);
  const [cards, deals, topPhones, topKitchen, recent] = await Promise.all([
    getCategoryCards(),
    getTodaysDeals(),
    getTopRated("cell-phones"),
    getTopRated("kitchen"),
    getProductsByIds(recentIds),
  ]);

  return (
    <div className="bg-page-bg pb-8">
      <div className="mx-auto max-w-[1500px]">
        <HeroCarousel />
        <div className="relative z-10 -mt-24 grid grid-cols-1 gap-5 px-5 sm:-mt-32 sm:grid-cols-2 lg:-mt-52 lg:grid-cols-4">
          {cards.slice(0, 8).map((c) => (
            <section key={c.id} className="flex flex-col bg-white p-5">
              <h2 className="mb-3 text-xl font-bold">{c.name}</h2>
              <div className="grid flex-1 grid-cols-2 gap-3">
                {c.products.map((p) => (
                  <Link key={p.thumbnail} href={`/s?cat=${c.slug}`} className="group">
                    <div className="relative aspect-square bg-[#f7f7f7]">
                      <Image src={p.thumbnail} alt={p.title} fill sizes="(max-width: 640px) 45vw, 160px" className="object-contain p-1 mix-blend-multiply" />
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-text group-hover:text-link-hover">{p.title}</p>
                  </Link>
                ))}
              </div>
              <Link href={`/s?cat=${c.slug}`} className="link mt-3 text-sm">
                Shop {c.name}
              </Link>
            </section>
          ))}
        </div>
        <div className="mt-5 space-y-5 px-5">
          <ProductRow title="Today's Deals" products={deals} href="/s?sort=discount" linkLabel="See all deals" />
          {recent.length > 0 && <ProductRow title="Your browsing history" products={recent} />}
          <ProductRow title="Top rated in Cell Phones & Accessories" products={topPhones} href="/s?cat=cell-phones&sort=rating" />
          <ProductRow title="Top rated in Kitchen & Dining" products={topKitchen} href="/s?cat=kitchen&sort=rating" />
        </div>
      </div>
    </div>
  );
}
