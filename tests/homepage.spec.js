// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
  });

  test('should load the page', async ({ page }) => {
    await expect(page).toHaveTitle(/AfriBuild/);
  });

  test('should display hero badge', async ({ page }) => {
    await expect(page.locator('#page-home')).toBeVisible();
    await expect(page.locator("text=Africa's Premier Marketplace")).toBeVisible();
  });

  test('should display main headline', async ({ page }) => {
    await expect(page.locator('text=Everything You Need to Build')).toBeVisible();
  });

  test('should display CTA buttons', async ({ page }) => {
    await expect(page.locator('text=Build My Project')).toBeVisible();
    await expect(page.locator('text=Browse Properties')).toBeVisible();
  });

  test('should display stats section', async ({ page }) => {
    await expect(page.locator('text=Materials').first()).toBeVisible();
    await expect(page.locator('text=Verified Pros').first()).toBeVisible();
  });

  test('should display trust section', async ({ page }) => {
    await expect(page.locator('text=Trusted Security')).toBeVisible();
    await expect(page.locator('text=Verified Suppliers')).toBeVisible();
    await expect(page.locator('text=Protected').first()).toBeVisible();
  });

  test('should display problem section', async ({ page }) => {
    await expect(page.locator('text=The Risk')).toBeVisible();
    await expect(page.locator('text=Fraudulent Sellers')).toBeVisible();
  });

  test('should display how it works section', async ({ page }) => {
    await expect(page.locator('text=How AfriBuild Works')).toBeVisible();
    await expect(page.locator('text=Tell us what you need')).toBeVisible();
  });

  test('should display testimonials', async ({ page }) => {
    await expect(page.locator('text=What Our Clients Say')).toBeVisible();
    await expect(page.locator('text=Kofi Asante')).toBeVisible();
  });

  test('should display FAQ section', async ({ page }) => {
    await expect(page.locator('text=Frequently Asked Questions')).toBeVisible();
  });

  test('should expand FAQ items', async ({ page }) => {
    await page.locator('details summary', { hasText: 'African countries' }).click();
    await expect(page.locator('text=Currently, we are fully operational')).toBeVisible();
  });

  test('should display final CTA', async ({ page }) => {
    await expect(page.locator('text=Ready to start')).toBeVisible();
    await expect(page.locator('text=Get Started Now')).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    await expect(page.locator('text=AfriBuild Marketplace Ltd')).toBeVisible();
  });

  test('should display bottom navigation', async ({ page }) => {
    await expect(page.locator('#bottom-nav')).toBeVisible();
    await expect(page.locator('[data-page="home"]')).toBeVisible();
    await expect(page.locator('[data-page="properties"]')).toBeVisible();
    await expect(page.locator('[data-page="build"]')).toBeVisible();
    await expect(page.locator('[data-page="materials"]')).toBeVisible();
    await expect(page.locator('[data-page="dashboard"]')).toBeVisible();
  });
});
