// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/admin'; });
    await page.waitForTimeout(1000);
  });

  test('should display admin heading', async ({ page }) => {
    await expect(page.locator('#page-admin')).toBeVisible();
    await expect(page.locator('h2:has-text("Admin Global Dashboard")')).toBeVisible();
  });

  test('should display metric cards', async ({ page }) => {
    await expect(page.locator('#page-admin:has-text("Total Users")')).toBeVisible();
    await expect(page.locator('#page-admin:has-text("24,892")')).toBeVisible();
    await expect(page.locator('#page-admin:has-text("$1.2M")')).toBeVisible();
  });

  test('should display approvals queue', async ({ page }) => {
    await expect(page.locator('#page-admin h3:has-text("Approvals Queue")')).toBeVisible();
  });

  test('should have approve/reject buttons', async ({ page }) => {
    await expect(page.locator('#page-admin button:has-text("Approve")').first()).toBeVisible();
    await expect(page.locator('#page-admin button:has-text("Reject")').first()).toBeVisible();
  });

  test('should show toast on approve', async ({ page }) => {
    await page.locator('#page-admin button:has-text("Approve")').first().click();
    await expect(page.locator('#toast')).toBeVisible();
  });

  test('should display transactions', async ({ page }) => {
    await expect(page.locator('#page-admin h3:has-text("Recent Transactions")')).toBeVisible();
  });
});
