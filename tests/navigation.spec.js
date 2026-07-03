// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
  });

  test('should open sidebar', async ({ page }) => {
    await page.click('button[aria-label="Menu"]');
    await expect(page.locator('#sidebar')).not.toHaveClass(/-translate-x-full/);
  });

  test('should close sidebar via overlay', async ({ page }) => {
    await page.click('button[aria-label="Menu"]');
    await expect(page.locator('#sidebar')).not.toHaveClass(/-translate-x-full/);
    await page.click('#sidebar-overlay');
    await expect(page.locator('#sidebar')).toHaveClass(/-translate-x-full/);
  });

  test('should navigate to properties via sidebar', async ({ page }) => {
    await page.click('button[aria-label="Menu"]');
    await page.click('#sidebar a:has-text("Properties")');
    await expect(page.locator('#page-properties')).toBeVisible();
  });

  test('should navigate via bottom nav to properties', async ({ page }) => {
    await page.click('[data-page="properties"]');
    await expect(page.locator('#page-properties')).toBeVisible();
  });

  test('should navigate via bottom nav to build', async ({ page }) => {
    await page.click('[data-page="build"]');
    await expect(page.locator('#page-build')).toBeVisible();
  });

  test('should navigate via bottom nav to materials', async ({ page }) => {
    await page.click('[data-page="materials"]');
    await expect(page.locator('#page-materials')).toBeVisible();
  });

  test('should navigate via bottom nav to dashboard', async ({ page }) => {
    await page.click('[data-page="dashboard"]');
    await expect(page.locator('#page-dashboard')).toBeVisible();
  });

  test('should navigate back to home', async ({ page }) => {
    await page.click('[data-page="properties"]');
    await expect(page.locator('#page-properties')).toBeVisible();
    await page.click('[data-page="home"]');
    await expect(page.locator('#page-home')).toBeVisible();
  });

  test('should update active nav item', async ({ page }) => {
    await page.click('[data-page="properties"]');
    const propsNav = page.locator('[data-page="properties"]');
    await expect(propsNav).toHaveClass(/luxury-gold/);
  });

  test('should highlight inactive nav items', async ({ page }) => {
    await page.click('[data-page="properties"]');
    const homeNav = page.locator('[data-page="home"]');
    await expect(homeNav).toHaveClass(/white\/40/);
  });
});
