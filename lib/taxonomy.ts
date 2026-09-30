// Amazon-style departments and subcategories. Order is the drawer order:
// the first four are featured (as on Amazon), the rest follow alphabetically.
export type Sub = { slug: string; name: string };
export type Dept = { slug: string; name: string; subs: Sub[] };

export const TAXONOMY: Dept[] = [
  {
    slug: "electronics",
    name: "Electronics",
    subs: [
      { slug: "cell-phones", name: "Cell Phones" },
      { slug: "headphones", name: "Headphones & Earbuds" },
      { slug: "phone-accessories", name: "Chargers & Phone Accessories" },
      { slug: "camera-accessories", name: "Camera & Photo Accessories" },
      { slug: "wearables", name: "Wearable Technology" },
    ],
  },
  { slug: "computers", name: "Computers", subs: [{ slug: "laptops", name: "Laptops" }, { slug: "tablets", name: "Tablets" }] },
  { slug: "smart-home", name: "Smart Home", subs: [{ slug: "smart-speakers", name: "Smart Speakers" }] },
  {
    slug: "home-kitchen",
    name: "Home and Kitchen",
    subs: [
      { slug: "furniture", name: "Furniture" },
      { slug: "home-decor", name: "Home Décor" },
      { slug: "kitchen", name: "Kitchen & Dining" },
    ],
  },
  { slug: "automotive", name: "Automotive", subs: [{ slug: "cars", name: "Cars, Trucks & SUVs" }, { slug: "motorcycles", name: "Motorcycles" }] },
  {
    slug: "beauty",
    name: "Beauty and Personal Care",
    subs: [
      { slug: "makeup", name: "Makeup" },
      { slug: "skin-care", name: "Skin Care" },
      { slug: "fragrance", name: "Fragrance" },
    ],
  },
  {
    slug: "grocery",
    name: "Grocery & Gourmet Food",
    subs: [
      { slug: "produce", name: "Fresh Produce" },
      { slug: "meat-seafood", name: "Meat & Seafood" },
      { slug: "dairy-eggs", name: "Dairy, Eggs & Frozen" },
      { slug: "beverages", name: "Beverages" },
      { slug: "pantry", name: "Pantry Staples" },
    ],
  },
  {
    slug: "health-household",
    name: "Health and Household",
    subs: [
      { slug: "supplements", name: "Vitamins & Supplements" },
      { slug: "household", name: "Household Supplies" },
    ],
  },
  {
    slug: "mens-fashion",
    name: "Men's Fashion",
    subs: [
      { slug: "mens-clothing", name: "Clothing" },
      { slug: "mens-shoes", name: "Shoes" },
      { slug: "mens-watches", name: "Watches" },
    ],
  },
  { slug: "pet-supplies", name: "Pet Supplies", subs: [{ slug: "cat-supplies", name: "Cat Supplies" }, { slug: "dog-supplies", name: "Dog Supplies" }] },
  {
    slug: "sports",
    name: "Sports and Outdoors",
    subs: [
      { slug: "team-sports", name: "Team Sports" },
      { slug: "racket-sports", name: "Racket Sports" },
      { slug: "golf", name: "Golf" },
    ],
  },
  {
    slug: "womens-fashion",
    name: "Women's Fashion",
    subs: [
      { slug: "womens-clothing", name: "Clothing" },
      { slug: "womens-shoes", name: "Shoes" },
      { slug: "handbags", name: "Handbags" },
      { slug: "jewelry", name: "Jewelry" },
      { slug: "womens-watches", name: "Watches" },
      { slug: "sunglasses", name: "Sunglasses & Eyewear" },
    ],
  },
];

export const FEATURED_DEPARTMENT_COUNT = 4;

// Places a source product (DummyJSON category + tags) into [department, subcategory].
export function classify(category: string, tags: string[]): [string, string] {
  const has = (...t: string[]) => t.some((x) => tags.includes(x));
  switch (category) {
    case "smartphones":
      return ["electronics", "cell-phones"];
    case "mobile-accessories":
      if (has("smart speakers")) return ["smart-home", "smart-speakers"];
      if (has("wireless earphones", "over-ear headphones")) return ["electronics", "headphones"];
      if (has("smartwatches")) return ["electronics", "wearables"];
      if (has("camera accessories", "selfie accessories")) return ["electronics", "camera-accessories"];
      return ["electronics", "phone-accessories"];
    case "laptops":
      return ["computers", "laptops"];
    case "tablets":
      return ["computers", "tablets"];
    case "furniture":
      return ["home-kitchen", "furniture"];
    case "home-decoration":
      return ["home-kitchen", "home-decor"];
    case "kitchen-accessories":
      return ["home-kitchen", "kitchen"];
    case "vehicle":
      return ["automotive", "cars"];
    case "motorcycle":
      return ["automotive", "motorcycles"];
    case "beauty":
      return ["beauty", "makeup"];
    case "skin-care":
      return ["beauty", "skin-care"];
    case "fragrances":
      return ["beauty", "fragrance"];
    case "groceries":
      if (has("pet supplies")) return ["pet-supplies", has("cat food") ? "cat-supplies" : "dog-supplies"];
      if (has("health supplements")) return ["health-household", "supplements"];
      if (has("household essentials")) return ["health-household", "household"];
      if (has("fruits", "vegetables")) return ["grocery", "produce"];
      if (has("meat", "seafood")) return ["grocery", "meat-seafood"];
      if (has("dairy", "desserts")) return ["grocery", "dairy-eggs"];
      if (has("beverages")) return ["grocery", "beverages"];
      return ["grocery", "pantry"];
    case "mens-shirts":
      return ["mens-fashion", "mens-clothing"];
    case "mens-shoes":
      return ["mens-fashion", "mens-shoes"];
    case "mens-watches":
      return ["mens-fashion", "mens-watches"];
    case "tops":
    case "womens-dresses":
      return ["womens-fashion", "womens-clothing"];
    case "womens-shoes":
      return ["womens-fashion", "womens-shoes"];
    case "womens-bags":
      return ["womens-fashion", "handbags"];
    case "womens-jewellery":
      return ["womens-fashion", "jewelry"];
    case "womens-watches":
      return ["womens-fashion", "womens-watches"];
    case "sunglasses":
      return ["womens-fashion", "sunglasses"];
    case "sports-accessories":
      if (has("tennis", "badminton")) return ["sports", "racket-sports"];
      if (has("golf")) return ["sports", "golf"];
      return ["sports", "team-sports"];
    default:
      throw new Error(`Unmapped source category: ${category}`);
  }
}
