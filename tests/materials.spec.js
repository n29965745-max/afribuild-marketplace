// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Materials Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/materials'; });
    await page.waitForTimeout(1000);
  });

  test('should display hero banner', async ({ page }) => {
    await expect(page.locator('#page-materials h2:has-text("Source the Best")')).toBeVisible();
  });

  test('should display search bar', async ({ page }) => {
    await expect(page.locator('#page-materials input[placeholder*="Search materials"]')).toBeVisible();
  });

  test('should display project stages', async ({ page }) => {
    await expect(page.locator('#page-materials:has-text("Foundation")').first()).toBeVisible();
    await expect(page.locator('#page-materials:has-text("Roofing")').first()).toBeVisible();
  });

  test('should display categories', async ({ page }) => {
    await expect(page.locator('#page-materials:has-text("Foundation & Substructure")')).toBeVisible();
  });

  test('should display featured supplies', async ({ page }) => {
    await expect(page.locator('#page-materials h3:has-text("Featured Supplies")')).toBeVisible();
    await expect(page.locator('#page-materials:has-text("Supaset 42.5N Cement")')).toBeVisible();
  });

  test('should display product prices', async ({ page }) => {
    await expect(page.locator('#page-materials:has-text("₦4,500")')).toBeVisible();
  });

  test('should display ratings', async ({ page }) => {
    await expect(page.locator('#page-materials:has-text("4.9")')).toBeVisible();
  });

  test('should display premium badge', async ({ page }) => {
    await expect(page.locator('#page-materials:has-text("PREMIUM")')).toBeVisible();
  });
});
