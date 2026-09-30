import { expect, test } from "@playwright/test";

test("guest cart survives refresh and merges on demo sign-in", async ({ page }) => {
  await page.goto("/s?k=phone");
  const cards = page.getByRole("button", { name: "Add to cart" });
  await cards.nth(0).click();
  await expect(page.getByRole("heading", { name: "Added to cart" }).first()).toBeVisible();
  await page.keyboard.press("Escape");
  await cards.nth(1).click();
  await expect(page.getByRole("link", { name: /Cart, 2 items/ })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("link", { name: /Cart, 2 items/ })).toBeVisible();

  await page.goto("/signin?callbackUrl=/cart");
  await page.getByRole("button", { name: "Try the demo account" }).click();
  await page.waitForURL("**/cart");
  await expect(page.getByRole("heading", { name: "Shopping Cart" })).toBeVisible();
  const count = await page.getByRole("link", { name: /Cart, \d+ items?/ }).getAttribute("aria-label");
  expect(Number(count?.match(/\d+/)?.[0])).toBeGreaterThanOrEqual(2);
});
