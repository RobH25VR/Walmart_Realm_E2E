import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { StorePage } from "../pages/StorePage";

test("open product modal", async ({ page }) => {
  const home = new HomePage(page);
  await home.open();
  await home.clickRealm("Cyberpunk City");

  const store = new StorePage(page);
  await home.clickClose();
  await store.openFirstProduct();
});