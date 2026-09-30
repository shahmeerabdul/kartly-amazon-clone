import { expect, test } from "@playwright/test";

test("guest finds a product, checks out via demo sign-in, and sees the order", async ({ page }) => {
  // Find: instant suggestions from the header search.
  await page.goto("/");
  await page.getByRole("combobox", { name: "Search Kartly" }).fill("phone");
  const firstSuggestion = page.getByRole("listbox").getByRole("option").first();
  await expect(firstSuggestion).toBeVisible();
  await page.keyboard.press("Enter"); // no option active: runs the full search
  await page.waitForURL(/\/s\?k=phone/);
  await expect(page.getByText(/of \d+ results for/)).toBeVisible();

  // Decide: open a product and add it to the cart.
  await page.locator("article a[href^='/dp/']").first().click();
  await page.waitForURL(/\/dp\//);
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByRole("heading", { name: "Added to cart" })).toBeVisible();
  await page.getByRole("link", { name: "Proceed to checkout" }).click();

  // Guests are sent to sign-in, then back to checkout.
  await page.waitForURL(/\/signin\?callbackUrl=%2Fcheckout/);
  await page.getByRole("button", { name: "Try the demo account" }).click();
  await page.waitForURL(/\/checkout$/);

  // Buy: saved address is preselected; fill the test card and place the order.
  await expect(page.getByRole("heading", { name: "Secure checkout" })).toBeVisible();
  await page.getByRole("button", { name: "Use test card" }).click();
  await expect(page.getByText("Visa ending in 4242")).toBeVisible();
  await page.getByRole("radio", { name: /Express Delivery/ }).check();
  const place = page.getByRole("button", { name: "Place your order" }).first();
  await place.dblclick(); // a double click must still create exactly one order
  await page.waitForURL(/\/orders\/[^/]+\?placed=1/);
  await expect(page.getByText("Order placed, thanks!")).toBeVisible();
  const orderUrl = page.url();

  // Track: the order is listed first, and can be cancelled while Placed.
  await page.goto("/orders");
  const orderId = new URL(orderUrl).pathname.split("/").pop()!;
  await expect(page.getByText(`Order # ${orderId.slice(-10).toUpperCase()}`)).toHaveCount(1);
  await page.goto(`/orders/${orderId}`);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Cancel order" }).click();
  await expect(page.getByRole("heading", { name: "Cancelled", exact: true })).toBeVisible();
});
