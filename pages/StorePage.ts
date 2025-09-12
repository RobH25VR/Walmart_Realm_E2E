import { Page, Locator, expect } from "@playwright/test";

export class StorePage {
  readonly page: Page;
  readonly products: Locator;
  readonly tutorialButton: Locator

  constructor(page: Page) {
    this.page = page;
    this.products = page.locator(".price-box");
  }

  async openFirstProduct() {
    await this.products.first().click();
  }
}