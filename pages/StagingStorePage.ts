import { Page, Locator, expect } from "@playwright/test";

export class StorePage {
  readonly page: Page;
  readonly products: Locator;
  readonly iframe: Locator;
  readonly addProductButton: Locator;
  readonly productCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.addProductButton = page
      .locator('iframe[title="Experience"]')
      .contentFrame()
      .getByRole('button', { name: 'Add to cart', exact: true });

    this.productCloseButton = page
      .frameLocator('iframe[title="Experience"]')
      .locator('button:has(svg.chakra-icon)')
      .filter({ has: page.locator('button:visible') });
  }

  async openFirstProduct() {
    // Wait for the iframe to appear
    const experienceFrameLocator = this.page.locator('iframe[title="Experience"]');
    await experienceFrameLocator.first().waitFor({ state: 'attached', timeout: 20000 });

    // Get the iframe's frame
    const frameElementHandle = await experienceFrameLocator.first().elementHandle();
    if (!frameElementHandle) throw new Error('Experience iframe element not found');
    
    const experienceFrame = await frameElementHandle.contentFrame();
    if (!experienceFrame) throw new Error('Experience iframe not found');

    // Get the inner container frame if needed
    const containerFrameLocator = experienceFrame.locator('#experience-container');
    await containerFrameLocator.first().waitFor({ state: 'attached', timeout: 10000 });
    
    const containerElementHandle = await containerFrameLocator.first().elementHandle();
    if (!containerElementHandle) throw new Error('Container frame element not found');
    
    const containerFrame = await containerElementHandle.contentFrame();
    if (!containerFrame) throw new Error('Container frame not found');

    // Locate all plus buttons inside the nested frame
    const productButton = containerFrame.locator('[id^="plus-button-"]').getByRole('img');
    console.log(await productButton.count());

    // Click the first one
    await productButton.first().click({ force: true });
    await this.page.waitForTimeout(300);
  }

  async addProduct() {
    await this.page.waitForTimeout(2000);

    if (await this.addProductButton.isVisible()) {
      await this.addProductButton.click({ force: true });
    }

    if (await this.productCloseButton.isVisible()) {
      await this.productCloseButton.click({ force: true });
    }

    await this.page.waitForTimeout(2000);
  }

  async expectMoreThanOneWalmartImage() {
    const frame = this.page.frameLocator('iframe[title="Experience"]');
    const modal = frame.locator('.chakra-modal__body');

    await modal.waitFor({ state: 'visible' });

    const images = modal.locator('img[src*="walmartimages"]');
    const count = await images.count();

    console.log(`Found ${count} Walmart images in the modal`);
    expect(count).toBeGreaterThan(1);

    return images;
  }
}
