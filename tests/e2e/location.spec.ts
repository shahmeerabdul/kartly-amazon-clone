import { expect, test } from "@playwright/test";

test("guest sets location by US zip or by shipping outside the US", async ({ page }) => {
  await page.goto("/");
  const deliverTo = page.getByRole("button", { name: /Deliver to/ }).first();
  await deliverTo.click();
  const dialog = page.getByRole("dialog", { name: "Choose your location" });
  await expect(dialog.getByRole("link", { name: "Sign in to see your addresses" })).toBeVisible();

  // US zip: validated, then applied.
  await dialog.getByLabel("US zip code").fill("12");
  await dialog.getByRole("button", { name: "Apply" }).click();
  await expect(dialog.getByRole("alert")).toContainText("valid US zip code");
  await dialog.getByLabel("US zip code").fill("98109");
  await dialog.getByRole("button", { name: "Apply" }).click();
  await expect(dialog).toBeHidden();
  await expect(deliverTo).toContainText("98109, United States");

  // Ship outside the US, with an optional city.
  await deliverTo.click();
  await dialog.getByLabel("Ship outside the US").selectOption({ label: "Pakistan" });
  await dialog.getByLabel("City (optional)").selectOption("Lahore");
  await dialog.getByRole("button", { name: "Done" }).click();
  await expect(dialog).toBeHidden();
  await expect(deliverTo).toContainText("Lahore, Pakistan");

  // It persists and shows in the product buy box, with an international note.
  await page.goto("/dp/iphone-5s");
  await expect(page.getByRole("main").getByText("Deliver to Lahore, Pakistan")).toBeVisible();
  await expect(page.getByText(/International orders usually arrive/)).toBeVisible();
});

test("signed-in user picks a saved address as their location", async ({ page }) => {
  await page.goto("/signin?callbackUrl=/");
  await page.getByRole("button", { name: "Try the demo account" }).click();
  await page.waitForURL((u) => u.pathname === "/");
  const deliverTo = page.getByRole("button", { name: /Deliver to/ }).first();
  await deliverTo.click();
  const dialog = page.getByRole("dialog", { name: "Choose your location" });
  await dialog.getByRole("button", { name: /Demo Shopper 410 Terry Ave N/ }).click();
  await expect(dialog).toBeHidden();
  await expect(deliverTo).toContainText("Seattle 98109, United States");
});
