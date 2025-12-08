import { Page, Locator } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly storeCard: Locator;
  readonly tutorialButton: Locator

  constructor(page: Page) {
    this.page = page;
    this.storeCard = page.locator(".chakra-text");
    this.tutorialButton = page.getByRole('button', { name: 'Close tutorial' });
  }

  async open() {
    await this.page.goto("https://walmart.emperia-staging.com/#/feed");
  }

  async clickRealm(name: string) {
    const store = this.storeCard.filter({ hasText: name });

    await store.first().click();
  }

  async clickClose() {
    // Wait a bit for the page to settle after clicking the realm
    await this.page.waitForTimeout(1000);
    
    // Check if there's an iframe - the button might be inside it
    const iframe = this.page.locator('#viewer-iframe');
    const iframeExists = await iframe.count() > 0;
    
    if (iframeExists) {
      // Wait for iframe to be attached
      await iframe.waitFor({ state: 'attached' });
      await this.page.waitForTimeout(500);
      
      // Get the iframe content
      const frame = await iframe.contentFrame();
      if (frame) {
        // Try to find the button inside the iframe with multiple strategies
        try {
          const buttonInFrame = frame.getByRole('button', { name: /close tutorial/i });
          await buttonInFrame.waitFor({ state: 'visible', timeout: 10000 });
          await buttonInFrame.scrollIntoViewIfNeeded();
          await buttonInFrame.click();
          return;
        } catch (e) {
          // Try by text in iframe (case insensitive)
          try {
            const buttonByText = frame.getByText(/close tutorial/i);
            await buttonByText.waitFor({ state: 'visible', timeout: 5000 });
            await buttonByText.scrollIntoViewIfNeeded();
            await buttonByText.click();
            return;
          } catch (e2) {
            // Try by button class in iframe
            const buttonByClass = frame.locator('button.chakra-button').filter({ hasText: /close tutorial/i });
            await buttonByClass.waitFor({ state: 'visible', timeout: 5000 });
            await buttonByClass.scrollIntoViewIfNeeded();
            await buttonByClass.click();
            return;
          }
        }
      }
    }
    
    // If not in iframe, try multiple selectors on the main page
    // Try by role first (case insensitive)
    try {
      const buttonByRole = this.page.getByRole('button', { name: /close tutorial/i });
      await buttonByRole.waitFor({ state: 'visible', timeout: 10000 });
      await buttonByRole.scrollIntoViewIfNeeded();
      await buttonByRole.click();
      return;
    } catch (e) {
      // If that fails, try by text (case insensitive)
      try {
        const buttonByText = this.page.getByText(/close tutorial/i);
        await buttonByText.waitFor({ state: 'visible', timeout: 10000 });
        await buttonByText.scrollIntoViewIfNeeded();
        await buttonByText.click();
        return;
      } catch (e2) {
        // Try by button with chakra-button class containing the text (case insensitive)
        const buttonByClass = this.page.locator('button.chakra-button').filter({ hasText: /close tutorial/i });
        await buttonByClass.waitFor({ state: 'visible', timeout: 10000 });
        await buttonByClass.scrollIntoViewIfNeeded();
        await buttonByClass.click();
      }
    }
  }
}