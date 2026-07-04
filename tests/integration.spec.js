// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Full User Flow Integration', () => {
  test('complete user journey: home -> properties -> build -> materials', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Home page
    await expect(page.locator('#page-home')).toBeVisible();

    // Navigate to properties
    await page.click('[data-page="properties"]');
    await expect(page.locator('#page-properties')).toBeVisible();

    // Navigate to build wizard
    await page.click('[data-page="build"]');
    await expect(page.locator('#page-build')).toBeVisible();

    // Complete wizard steps
    await page.click('#wiz-next');
    await expect(page.locator('#wiz-step-2')).toBeVisible();
    await page.click('#wiz-next');
    await expect(page.locator('#wiz-step-3')).toBeVisible();

    // Navigate to materials
    await page.click('[data-page="materials"]');
    await expect(page.locator('#page-materials')).toBeVisible();
  });

  test('sidebar navigation to all main pages', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Properties
    await page.click('button[aria-label="Menu"]');
    await page.click('#sidebar a:has-text("Properties")');
    await expect(page.locator('#page-properties')).toBeVisible();

    // Marketplace
    await page.click('button[aria-label="Menu"]');
    await page.click('#sidebar a:has-text("Marketplace")');
    await expect(page.locator('#page-materials')).toBeVisible();

    // Build
    await page.click('button[aria-label="Menu"]');
    await page.click('#sidebar a:has-text("Build My House")');
    await expect(page.locator('#page-build')).toBeVisible();

    // Professionals
    await page.click('button[aria-label="Menu"]');
    await page.click('#sidebar a:has-text("Professionals")');
    await expect(page.locator('#page-professionals')).toBeVisible();
  });

  test('bottom nav switching between main pages', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    await page.click('[data-page="home"]');
    await expect(page.locator('#page-home')).toBeVisible();

    await page.click('[data-page="properties"]');
    await expect(page.locator('#page-properties')).toBeVisible();

    await page.click('[data-page="build"]');
    await expect(page.locator('#page-build')).toBeVisible();

    await page.click('[data-page="materials"]');
    await expect(page.locator('#page-materials')).toBeVisible();

    await page.click('[data-page="dashboard"]');
    await expect(page.locator('#page-dashboard')).toBeVisible();
  });

  test('header scroll effect on home page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    const header = page.locator('#main-header');
    await expect(header).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(300);
    await expect(header).toHaveClass(/nav-scrolled/);
  });

  test('FAQ accordion functionality', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    const firstFaq = page.locator('details summary').first();
    await firstFaq.scrollIntoViewIfNeeded();
    await firstFaq.click();
    await page.waitForTimeout(300);

    const details = page.locator('details').first();
    await expect(details).toHaveAttribute('open', '');
  });

  test('filter chips toggle on properties page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/properties'; });
    await page.waitForTimeout(1000);

    const homesBtn = page.locator('#property-filters button:has-text("Homes")');
    const allBtn = page.locator('#property-filters button:has-text("All")');

    await homesBtn.click();
    await expect(homesBtn).toHaveClass(/active-filter/);
    await expect(allBtn).not.toHaveClass(/active-filter/);

    await allBtn.click();
    await expect(allBtn).toHaveClass(/active-filter/);
    await expect(homesBtn).not.toHaveClass(/active-filter/);
  });

  test('professional filter chips toggle', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/professionals'; });
    await page.waitForTimeout(1000);

    const architects = page.locator('#page-professionals button:has-text("Architects")');
    await architects.click();
    await expect(architects).toHaveClass(/bg-primary/);

    const allPro = page.locator('#page-professionals button:has-text("All Professionals")');
    await allPro.click();
    await expect(allPro).toHaveClass(/bg-primary/);
  });

  test('toast notification appears on form submission', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/request-quote'; });
    await page.waitForTimeout(1000);

    await page.fill('#page-request-quote input[placeholder="Your full name"]', 'Test User');
    await page.fill('#page-request-quote input[placeholder="your@email.com"]', 'test@test.com');
    await page.fill('#page-request-quote textarea', 'Need a 3-bedroom house built');
    await page.click('#page-request-quote button:has-text("Submit Quote Request")');
    await page.waitForTimeout(500);
    await expect(page.locator('#toast')).toBeVisible();
  });
});
