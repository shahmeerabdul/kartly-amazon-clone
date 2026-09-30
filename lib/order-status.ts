export type DisplayStatus = "Placed" | "Shipped" | "Delivered" | "Cancelled";

const HOUR = 3_600_000;

// Stored status is PLACED or CANCELLED; for the demo the shown status advances with time.
export function displayStatus(order: { status: "PLACED" | "CANCELLED"; createdAt: Date }, now = Date.now()): DisplayStatus {
  if (order.status === "CANCELLED") return "Cancelled";
  const age = now - order.createdAt.getTime();
  if (age >= 3 * HOUR) return "Delivered";
  if (age >= HOUR) return "Shipped";
  return "Placed";
}

export const canCancel = (order: { status: "PLACED" | "CANCELLED"; createdAt: Date }) =>
  displayStatus(order) === "Placed";

// The simulated delivery happens 3 hours after ordering, or on the estimated date if that is already past.
export function deliveredAt(order: { createdAt: Date; estimatedDelivery: Date }, now = Date.now()) {
  return order.estimatedDelivery.getTime() < now ? order.estimatedDelivery : new Date(order.createdAt.getTime() + 3 * HOUR);
}
