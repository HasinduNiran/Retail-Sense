import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LandingPage extends BasePage {
  // Page URL
  private readonly url = 'http://localhost:5173/';
  
  // Page elements selectors
  // Add specific selectors for your landing page elements here
  // Example: private readonly headerLogo = '.header-logo';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the landing page
   */
  async navigateToLandingPage(): Promise<void> {
    await this.navigate(this.url);
  }

  /**
   * Check if the landing page is loaded successfully
   */
  async isPageLoaded(): Promise<boolean> {
    await this.waitForPageLoad();
    // You can add checks for specific elements that should be present
    // Example: await this.page.waitForSelector(this.headerLogo, { state: 'visible' });
    
    return this.page.url() === this.url;
  }

  /**
   * Get the page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }
}
