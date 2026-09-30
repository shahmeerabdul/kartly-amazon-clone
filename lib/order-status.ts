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
