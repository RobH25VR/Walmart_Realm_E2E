import { Page, Locator } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly storeCard: Locator;
  readonly tutorialButton: Locator

  constructor(page: Page) {
    this.page = page;
    this.storeCard = page.locator(".chakra-text");
    this.tutorialButton = page.locator("[class*='chakra-icon']");
  }

  async open() {
    await this.page.goto("https://walmart.emperia-staging.com/#/feed");
  }

  async clickRealm(name: string) {
    const space = this.storeCard.filter({ hasText: name });

    await space.first().click();
  }

  async clickClose() {
    // Wait for the tutorial button to be visible and clickable
    await this.tutorialButton.first().waitFor({ state: 'visible' });
    
    // Check if there's an iframe that might be blocking the click
    const iframe = this.page.locator('#viewer-iframe');
    if (await iframe.isVisible()) {
      // Wait for iframe to load and then try to click
      await iframe.waitFor({ state: 'attached' });
      await this.page.waitForTimeout(1000);
    }
    
    // Force click to bypass any overlays
    await this.tutorialButton.last().click({ force: true });
    await this.tutorialButton.first().click({ force: true });
  }
}