// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Properties Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/properties'; });
    await page.waitForTimeout(1000);
  });

  test('should display search bar', async ({ page }) => {
    await expect(page.locator('#property-search')).toBeVisible();
  });

  test('should display filter chips', async ({ page }) => {
    await expect(page.locator('button:has-text("Buy Land")')).toBeVisible();
    await expect(page.locator('button:has-text("Buy Homes")')).toBeVisible();
  });

  test('should toggle filter chips', async ({ page }) => {
    const buyHomesBtn = page.locator('button:has-text("Buy Homes")');
    await buyHomesBtn.click();
    await expect(buyHomesBtn).toHaveClass(/active-filter/);
  });

  test('should display featured properties', async ({ page }) => {
    await expect(page.locator('#page-properties h2:has-text("Featured Properties")')).toBeVisible();
  });

  test('should display property cards', async ({ page }) => {
    await expect(page.locator('#page-properties:has-text("The Zenith Residence")')).toBeVisible();
  });

  test('should display verified badges', async ({ page }) => {
    await expect(page.locator('#page-properties:has-text("Verified")').first()).toBeVisible();
  });

  test('should display property specs', async ({ page }) => {
    await expect(page.locator('#page-properties:has-text("3 Beds")')).toBeVisible();
  });

  test('should have Details buttons', async ({ page }) => {
    await expect(page.locator('#page-properties button:has-text("Details")').first()).toBeVisible();
  });

  test('should toggle favorite', async ({ page }) => {
    const heart = page.locator('.favorite-btn').first();
    await heart.click();
    await expect(page.locator('#toast')).toBeVisible();
  });

  test('should search properties', async ({ page }) => {
    await page.fill('#property-search', 'Accra');
    const value = await page.inputValue('#property-search');
    expect(value).toBe('Accra');
  });
});
