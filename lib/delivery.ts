export const FREE_SHIPPING_THRESHOLD_CENTS = 3500;
export const STANDARD_FEE_CENTS = 599;
export const EXPRESS_FEE_CENTS = 999;
export const TAX_RATE = 0.08;

export type DeliveryOption = "standard" | "express";

const DAY = 86_400_000;

export function deliveryDate(option: DeliveryOption, from = new Date()) {
  return new Date(from.getTime() + (option === "express" ? 2 : 5) * DAY);
}

export function shippingCents(option: DeliveryOption, subtotalCents: number) {
  if (option === "express") return EXPRESS_FEE_CENTS;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_FEE_CENTS;
}

export const taxCents = (subtotalCents: number) => Math.round(subtotalCents * TAX_RATE);

export function orderTotals(subtotalCents: number, option: DeliveryOption) {
  const shipping = shippingCents(option, subtotalCents);
  const tax = taxCents(subtotalCents);
  return { subtotalCents, shippingCents: shipping, taxCents: tax, totalCents: subtotalCents + shipping + tax };
}
