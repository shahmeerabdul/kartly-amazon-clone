import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function signInDemo(page: import("@playwright/test").Page, callbackUrl = "/") {
  await page.goto(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await page.getByRole("button", { name: "Try the demo account" }).click();
  await page.waitForURL((u) => u.pathname === callbackUrl.split("?")[0]);
}

test("a buyer writes a review and it shows as a Verified Purchase", async ({ page }) => {
  // The demo account's delivered order includes the iPhone 5s.
  await signInDemo(page, "/dp/iphone-5s");
  await page.getByRole("button", { name: /Write a customer review|Edit your review/ }).click();

  // Validation: a headline and review text are required.
  await page.getByLabel("Add a headline").fill("");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();

  const headline = `Still going strong ${Date.now()}`;
  await page.getByRole("radio", { name: /5 stars/ }).click();
  await page.getByLabel("Add a headline").fill(headline);
  await page.getByLabel("Add a written review").fill("Bought it for my dad and the battery still lasts all day.");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText(/Your review (is posted|was updated)/)).toBeVisible();

  await page.goto("/dp/iphone-5s?rsort=recent#reviews");
  const mine = page.getByRole("listitem").filter({ hasText: headline });
  await expect(mine).toBeVisible();
  await expect(mine).toContainText("Demo Shopper");
  await expect(mine).toContainText("Verified Purchase");
});

test("wish list: save from the product page, then move to cart", async ({ page }) => {
  await signInDemo(page, "/dp/apple-airpods");
  const save = page.getByRole("button", { name: /Add to List|Saved to Wish List/ });
  if ((await save.textContent())?.includes("Saved")) {
    await save.click(); // start from a clean state
    await expect(page.getByText("Removed from your Wish List")).toBeVisible();
  }
  await page.getByRole("button", { name: "Add to List" }).click();
  await expect(page.getByText("Added to your Wish List")).toBeVisible();
  await expect(page.getByRole("button", { name: "Saved to Wish List" })).toBeVisible();

  await page.goto("/wishlist");
  const card = page.getByRole("listitem").filter({ hasText: "Apple Airpods" });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Move to cart" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Apple Airpods" })).toHaveCount(0);

  await page.goto("/cart");
  await expect(page.getByRole("link", { name: "Apple Airpods" }).first()).toBeVisible();
});

test("Today's Deals lists discounts from biggest to smallest", async ({ page }) => {
  await page.goto("/deals");
  await expect(page.getByRole("heading", { name: "Today's Deals" })).toBeVisible();
  await expect(page.getByText("Limited time deal").first()).toBeVisible();
  const offs = (await page.locator("article").getByText(/^\d+% off$/).allTextContents()).map((t) => parseInt(t, 10));
  expect(offs.length).toBeGreaterThan(5);
  expect(offs).toEqual([...offs].sort((a, b) => b - a));
});

test("register keeps typed details after an error, then signs the new user in", async ({ page }) => {
  const email = `shopper${Date.now()}@example.com`;
  await page.goto("/register?callbackUrl=/account");
  await page.getByLabel("Your name").fill("Riley Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("short");
  await page.getByLabel("Re-enter password").fill("short");
  await page.getByRole("button", { name: "Create your Kartly account" }).click();
  await expect(page.getByText("Passwords must be at least 8 characters.")).toBeVisible();
  await expect(page.getByLabel("Your name")).toHaveValue("Riley Tester");
  await expect(page.getByLabel("Email")).toHaveValue(email);

  await page.getByLabel("Password", { exact: true }).fill("correct-horse-9");
  await page.getByLabel("Re-enter password").fill("correct-horse-9");
  await page.getByRole("button", { name: "Create your Kartly account" }).click();
  await page.waitForURL("**/account");
  await expect(page.getByRole("heading", { name: "Riley Tester" })).toBeVisible();
});
