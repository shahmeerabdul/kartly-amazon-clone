import { expect, test } from "@playwright/test";

test("drawer opens a department and its subcategory, like Amazon", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "All", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: "Browse departments" });
  await expect(drawer.getByRole("heading", { name: "Shop by Department" })).toBeVisible();

  await drawer.getByRole("button", { name: "Electronics: show subcategories" }).click();
  const panel = drawer.getByRole("navigation", { name: "Electronics" });
  await expect(panel.getByRole("link", { name: "All Electronics" })).toBeVisible();
  await expect(panel.getByRole("link", { name: "Headphones & Earbuds" })).toBeVisible();

  // Back to the main menu and in again.
  await panel.getByRole("button", { name: "Main menu" }).click();
  await drawer.getByRole("button", { name: "Electronics: show subcategories" }).click();
  await panel.getByRole("link", { name: "Headphones & Earbuds" }).click();

  await page.waitForURL(/cat=electronics&sub=headphones/);
  await expect(page.getByText(/results in Electronics › Headphones & Earbuds/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Remove filter Headphones & Earbuds" })).toBeVisible();
});

test("old department links still resolve to the new subcategory", async ({ page }) => {
  await page.goto("/s?cat=kitchen");
  await expect(page.getByText(/results in Home and Kitchen › Kitchen & Dining/)).toBeVisible();
});
