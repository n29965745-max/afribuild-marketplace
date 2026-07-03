// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Build My House Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/build'; });
    await page.waitForTimeout(1000);
  });

  test('should display step 1', async ({ page }) => {
    await expect(page.locator('#wiz-step-1')).toBeVisible();
    await expect(page.locator('#page-build h2:has-text("Where is your property")')).toBeVisible();
  });

  test('should display progress bar', async ({ page }) => {
    await expect(page.locator('#wizard-progress')).toBeVisible();
  });

  test('should display step counter', async ({ page }) => {
    await expect(page.locator('#wizard-count')).toContainText('Step 1 of 5');
  });

  test('should navigate to step 2', async ({ page }) => {
    await page.click('#wiz-next');
    await expect(page.locator('#wiz-step-2')).toBeVisible();
    await expect(page.locator('#wizard-title')).toContainText('House Design');
  });

  test('should display house type cards', async ({ page }) => {
    await page.click('#wiz-next');
    await expect(page.locator('#wiz-step-2 h3:has-text("Modern")')).toBeVisible();
    await expect(page.locator('#wiz-step-2 h3:has-text("Heritage")')).toBeVisible();
    await expect(page.locator('#wiz-step-2 h3:has-text("Estate")')).toBeVisible();
  });

  test('should select house type card', async ({ page }) => {
    await page.click('#wiz-next');
    await page.click('.wiz-style-card:first-child');
    await expect(page.locator('.wiz-style-card:first-child')).toHaveClass(/ring-primary/);
  });

  test('should navigate back to step 1', async ({ page }) => {
    await page.click('#wiz-next');
    await page.click('#wiz-prev');
    await expect(page.locator('#wiz-step-1')).toBeVisible();
  });

  test('should navigate to step 3', async ({ page }) => {
    await page.click('#wiz-next');
    await page.click('#wiz-next');
    await expect(page.locator('#wiz-step-3')).toBeVisible();
    await expect(page.locator('#wizard-title')).toContainText('Finish');
  });

  test('should display finish level cards', async ({ page }) => {
    await page.click('#wiz-next');
    await page.click('#wiz-next');
    await expect(page.locator('#wiz-step-3 h4:has-text("Standard")')).toBeVisible();
    await expect(page.locator('#wiz-step-3 h4:has-text("Luxury")')).toBeVisible();
  });

  test('should display budget estimate', async ({ page }) => {
    await page.click('#wiz-next');
    await page.click('#wiz-next');
    await expect(page.locator('#wiz-step-3:has-text("Estimated Budget Range")')).toBeVisible();
  });

  test('should update progress bar on step 2', async ({ page }) => {
    await page.click('#wiz-next');
    const width = await page.locator('#wizard-progress').evaluate(el => el.style.width);
    expect(width).toBe('40%');
  });

  test('should complete all 5 wizard steps', async ({ page }) => {
    await page.click('#wiz-next'); // 1->2
    await expect(page.locator('#wiz-step-2')).toBeVisible();
    await page.click('#wiz-next'); // 2->3
    await expect(page.locator('#wiz-step-3')).toBeVisible();
    await page.click('#wiz-next'); // 3->4
    await expect(page.locator('#wiz-step-4')).toBeVisible();
    await page.click('#wiz-next'); // 4->5
    await expect(page.locator('#wiz-step-5')).toBeVisible();
    await page.click('#wiz-next'); // submit
    await expect(page.locator('#toast')).toBeVisible();
  });
});
