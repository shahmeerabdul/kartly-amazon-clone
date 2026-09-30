export const SORTS = {
  featured: "Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Avg. Customer Review",
  newest: "Newest Arrivals",
  discount: "Biggest Discount",
} as const;
export type SortKey = keyof typeof SORTS;
