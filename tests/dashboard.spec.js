// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Dashboard - The Vault', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/dashboard'; });
    await page.waitForTimeout(1000);
  });

  test('should display portfolio overview', async ({ page }) => {
    await expect(page.locator('#page-dashboard')).toBeVisible();
    await expect(page.locator('#page-dashboard:has-text("₦2,840,500")')).toBeVisible();
  });

  test('should display portfolio breakdown', async ({ page }) => {
    await expect(page.locator('#page-dashboard:has-text("Liquid Assets")')).toBeVisible();
    await expect(page.locator('#page-dashboard:has-text("₦420k")')).toBeVisible();
  });

  test('should display quick actions', async ({ page }) => {
    await expect(page.locator('#page-dashboard h4:has-text("Quick Actions")')).toBeVisible();
    await expect(page.locator('#page-dashboard button:has-text("Request Quote")')).toBeVisible();
    await expect(page.locator('#page-dashboard button:has-text("Book Professional")')).toBeVisible();
  });

  test('should display active projects', async ({ page }) => {
    await expect(page.locator('#page-dashboard h3:has-text("Active Projects")')).toBeVisible();
    await expect(page.locator('#page-dashboard:has-text("The Palms Residency")')).toBeVisible();
  });

  test('should display project progress', async ({ page }) => {
    await expect(page.locator('#page-dashboard:has-text("Progress")').first()).toBeVisible();
  });

  test('should display project status badges', async ({ page }) => {
    await expect(page.locator('#page-dashboard:has-text("On Track")')).toBeVisible();
  });

  test('should display recent transactions', async ({ page }) => {
    await expect(page.locator('#page-dashboard h3:has-text("Recent Transactions")')).toBeVisible();
  });

  test('should display saved opportunities', async ({ page }) => {
    await expect(page.locator('#page-dashboard h3:has-text("Saved Opportunities")')).toBeVisible();
    await expect(page.locator('#page-dashboard:has-text("Azure Coast Estate")')).toBeVisible();
  });
});
