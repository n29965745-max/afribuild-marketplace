// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Professionals Directory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/professionals'; });
    await page.waitForTimeout(1000);
  });

  test('should display page heading', async ({ page }) => {
    await expect(page.locator('#page-professionals')).toBeVisible();
    await expect(page.locator('#page-professionals h2:has-text("Professional Directory")')).toBeVisible();
  });

  test('should display search bar', async ({ page }) => {
    await expect(page.locator('#page-professionals input[placeholder*="Search by name"]')).toBeVisible();
  });

  test('should display filter chips', async ({ page }) => {
    await expect(page.locator('#page-professionals button:has-text("All Professionals")')).toBeVisible();
    await expect(page.locator('#page-professionals button:has-text("Architects")')).toBeVisible();
  });

  test('should toggle filter chips', async ({ page }) => {
    await page.click('#page-professionals button:has-text("Architects")');
    await expect(page.locator('#page-professionals button:has-text("Architects")')).toHaveClass(/bg-primary/);
  });

  test('should display professional cards', async ({ page }) => {
    await expect(page.locator('#page-professionals article').first()).toBeVisible();
  });

  test('should display verified badges', async ({ page }) => {
    await expect(page.locator('#page-professionals:has-text("VERIFIED")').first()).toBeVisible();
  });

  test('should display ratings', async ({ page }) => {
    await page.waitForTimeout(2000);
    await expect(page.locator('#page-professionals [style*="font-variation-settings"]').first()).toBeVisible();
  });

  test('should have Request Quote buttons', async ({ page }) => {
    await page.waitForTimeout(2000);
    await expect(page.locator('#page-professionals button:has-text("Request Quote")').first()).toBeVisible();
  });

  test('should show toast on request quote', async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.locator('#page-professionals button:has-text("Request Quote")').first().click();
    await expect(page.locator('#toast')).toBeVisible();
  });

  test('should display Join Directory CTA', async ({ page }) => {
    await page.waitForTimeout(2000);
    await expect(page.locator('#page-professionals:has-text("Join the Directory")')).toBeVisible();
  });
});
