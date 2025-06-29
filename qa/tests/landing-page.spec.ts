import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/LandingPage';

test.describe('Landing Page Navigation', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
  });

  test('should successfully navigate to the landing page', async ({ page }) => {
    // Navigate to the landing page
    await landingPage.navigateToLandingPage();
    
    // Verify the page is loaded successfully
    const isLoaded = await landingPage.isPageLoaded();
    expect(isLoaded).toBeTruthy();
    
    // Verify the URL is correct
    expect(page.url()).toBe('http://localhost:5173/');
    
    // Optional: Verify page title if applicable
    const pageTitle = await landingPage.getPageTitle();
    expect(pageTitle).not.toBe('');
    
    // Add more specific checks based on your application
    // For example:
    // expect(await page.isVisible('.header-logo')).toBeTruthy();
    // expect(await page.isVisible('nav')).toBeTruthy();
  });
});
