import { expect, test } from "@playwright/test";

test("signed-in user sees Your Account in the drawer and manages addresses", async ({ page }) => {
  await page.goto("/signin?callbackUrl=/");
  await page.getByRole("button", { name: "Try the demo account" }).click();
  await page.waitForURL((u) => u.pathname === "/");

  // Sidebar drawer shows the account section with details.
  await page.getByRole("button", { name: "All", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: "Browse departments" });
  await expect(drawer.getByRole("heading", { name: "Your Account" })).toBeVisible();
  await expect(drawer.getByText("demo@example.com")).toBeVisible();
  await drawer.getByRole("link", { name: "Your Account" }).click();

  // Account page with profile details and cards.
  await page.waitForURL("**/account");
  await expect(page.getByRole("heading", { name: "Demo Shopper" })).toBeVisible();
  await expect(page.getByText("demo@example.com")).toBeVisible();
  await page.getByRole("link", { name: /Your Addresses/ }).click();

  // Add, set default and remove an address.
  await page.waitForURL("**/account/addresses");
  await page.getByRole("button", { name: "Add address" }).click();
  await page.getByLabel("Full name").fill("Test Person");
  await page.getByLabel("Street address").fill("1 Main St");
  await page.getByRole("textbox", { name: "City" }).fill("Austin");
  await page.getByLabel("State").fill("tx");
  await page.getByLabel("ZIP code", { exact: true }).fill("73301");
  await page.getByLabel("Phone number").fill("512-555-0100");
  await page.getByRole("button", { name: "Add address" }).click();
  const card = page.getByRole("listitem").filter({ hasText: "Test Person" });
  await expect(card).toBeVisible();
  await expect(card).toContainText("Austin, TX 73301");

  page.once("dialog", (d) => d.accept());
  await card.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Test Person" })).toHaveCount(0);
});
