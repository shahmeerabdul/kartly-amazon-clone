import { expect, test } from "@playwright/test";

test("visitor sets delivery location by country and city", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Deliver to/ }).first().click();
  const dialog = page.getByRole("dialog", { name: "Choose your location" });
  await expect(dialog).toBeVisible();

  // Saving without a city shows an inline error.
  await dialog.getByLabel("Country/Region").selectOption({ label: "Pakistan" });
  await expect(dialog.getByLabel(/ZIP code/)).toHaveCount(0);
  await dialog.getByRole("button", { name: "Done" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Choose a city");

  await dialog.getByLabel("City").selectOption("Lahore");
  await dialog.getByRole("button", { name: "Done" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: /Deliver to/ }).first()).toContainText("Lahore, Pakistan");

  // The location persists and shows in the product buy box, with an international note.
  await page.goto("/dp/iphone-5s");
  await expect(page.getByRole("main").getByText("Deliver to Lahore, Pakistan")).toBeVisible();
  await expect(page.getByText(/International orders usually arrive/)).toBeVisible();
});
