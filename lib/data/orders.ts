import { db } from "@/lib/db";

export const PERIODS = {
  "30d": "last 30 days",
  "3m": "past 3 months",
  year: String(new Date().getUTCFullYear()),
  all: "all time",
} as const;
export type Period = keyof typeof PERIODS;

function since(period: Period) {
  const now = new Date();
  if (period === "30d") return new Date(now.getTime() - 30 * 86_400_000);
  if (period === "3m") return new Date(now.getTime() - 91 * 86_400_000);
  if (period === "year") return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  return undefined;
}

export const getOrders = (userId: string, period: Period) =>
  db.order.findMany({
    where: { userId, ...(since(period) ? { createdAt: { gte: since(period) } } : {}) },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { select: { slug: true } } } } },
  });

export const getOrder = (userId: string, id: string) =>
  db.order.findFirst({ where: { id, userId }, include: { items: { include: { product: { select: { slug: true } } } } } });

export type ShippingSnapshot = {
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  zip: string;
  phone: string;
};
