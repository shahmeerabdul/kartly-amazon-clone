import { cookies } from "next/headers";
import { HeroTiles } from "@/components/home/hero-tiles";
import { QuadCards } from "@/components/home/quad-cards";
import { ProductRow } from "@/components/product/product-row";
import { getProductsByIds, getTodaysDeals, getTopRated } from "@/lib/data/catalog";

export default async function Home() {
  const recentIds = ((await cookies()).get("recent")?.value ?? "").split(".").filter(Boolean);
  const [deals, topPhones, topKitchen, recent] = await Promise.all([
    getTodaysDeals(),
    getTopRated("electronics", 12, "cell-phones"),
    getTopRated("home-kitchen", 12, "kitchen"),
    getProductsByIds(recentIds),
  ]);

  return (
    <div className="bg-page-bg pb-8">
      <HeroTiles />
      <div className="mt-5 space-y-5 px-3 sm:px-5">
        <QuadCards row={0} />
        <ProductRow title="Today's Deals" products={deals} href="/s?sort=discount" linkLabel="See all deals" />
        <QuadCards row={1} />
        {recent.length > 0 && <ProductRow title="Your browsing history" products={recent} />}
        <ProductRow title="Top rated in Cell Phones" products={topPhones} href="/s?cat=electronics&sub=cell-phones&sort=rating" />
        <ProductRow title="Top rated in Kitchen & Dining" products={topKitchen} href="/s?cat=home-kitchen&sub=kitchen&sort=rating" />
      </div>
    </div>
  );
}
