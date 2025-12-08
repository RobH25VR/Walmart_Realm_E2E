import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { StorePage } from "../pages/StorePage";

test.describe("UI navigation", () => {
  test("loads the experience iframe after selecting a realm", async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    await home.clickRealm("Cyberpunk City");

    const experienceFrame = page.locator('iframe[title="Experience"]');
    await expect(experienceFrame).toBeVisible();
  });

  test("opens a product modal from the experience view", async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    await home.clickRealm("Gingerbread Boutique");
    await home.clickClose();

    const store = new StorePage(page);
    await store.openFirstProduct();
    await store.expectMoreThanOneWalmartImage();
  });
});
