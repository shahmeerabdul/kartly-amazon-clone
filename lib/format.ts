const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const formatMoney = (cents: number) => usd.format(cents / 100);

export function splitMoney(cents: number) {
  const dollars = Math.floor(cents / 100);
  return { dollars: dollars.toLocaleString("en-US"), cents: String(cents % 100).padStart(2, "0") };
}

export const formatDate = (d: Date, opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts }).format(d);

export const formatCount = (n: number) => n.toLocaleString("en-US");

export const discountPercent = (price: number, list: number | null | undefined) =>
  list && list > price ? Math.round((1 - price / list) * 100) : 0;

export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");
