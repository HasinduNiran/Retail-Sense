import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async navigate(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
