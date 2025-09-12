// import { test, expect } from "@playwright/test";
// import { HomePage } from "../pages/HomePage";
// import { SpacePage } from "../pages/StorePage";

// test("add product to cart and verify cart count", async ({ page }) => {
//   const home = new HomePage(page);
//   await home.open();
//   await home.clickRealm("So Jelly");

//   const space = new SpacePage(page);
//   await space.isLoaded();
//   await space.openFirstProduct();

//   await page.click("button:has-text('Add to Cart')");
//   await expect(page.locator(".cart-count")).toHaveText("1");
// });