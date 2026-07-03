// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'https://afribuild-azure.vercel.app';

test.describe('Build Wizard - Mobile Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/build'; });
    await page.waitForTimeout(1500);
  });

  test('Step 1: Land Information - all fields visible', async ({ page }) => {
    await page.screenshot({ path: 'test-results/wizard-mobile-step1.png' });

    // Check step 1 is active
    await expect(page.locator('#wiz-step-1')).toBeVisible();
    await expect(page.locator('#wizard-title')).toContainText('Land Information');
    await expect(page.locator('#wizard-count')).toContainText('Step 1 of 5');

    // Check form fields
    await expect(page.locator('#wiz-step-1 input[placeholder*="City"]')).toBeVisible();
    await expect(page.locator('#wiz-step-1 input[placeholder="e.g. 450"]')).toBeVisible();
    await expect(page.locator('#wiz-step-1 select').first()).toBeVisible();

    // Check map placeholder
    await expect(page.locator('#wiz-step-1 img')).toBeVisible();

    // Check nav buttons exist
    await expect(page.locator('#wiz-prev')).toBeAttached();
    await expect(page.locator('#wiz-next')).toBeVisible();

    // Prev should be invisible on step 1
    const prevClass = await page.locator('#wiz-prev').getAttribute('class');
    expect(prevClass).toContain('invisible');
  });

  test('Step 1 to Step 2: Navigate forward', async ({ page }) => {
    // Fill step 1 fields
    await page.fill('input[placeholder*="City"]', 'Lagos, Nigeria');
    await page.fill('input[placeholder="e.g. 450"]', '500');

    // Click next
    await page.click('#wiz-next');
    await page.waitForTimeout(500);

    // Verify step 2
    await expect(page.locator('#wiz-step-2')).toBeVisible();
    await expect(page.locator('#wizard-title')).toContainText('House Design');
    await expect(page.locator('#wizard-count')).toContainText('Step 2 of 5');

    // Check progress bar updated
    const width = await page.locator('#wizard-progress').evaluate(el => el.style.width);
    expect(width).toBe('40%');

    // Prev should now be visible
    await expect(page.locator('#wiz-prev')).toBeVisible();
    const prevHidden = await page.locator('#wiz-prev').evaluate(el => el.classList.contains('invisible'));
    expect(prevHidden).toBe(false);

    await page.screenshot({ path: 'test-results/wizard-mobile-step2.png' });
  });

  test('Step 2: House type cards - selection works', async ({ page }) => {
    await page.click('#wiz-next');
    await page.waitForTimeout(500);

    // Check all 3 style cards visible
    await expect(page.locator('#wiz-step-2 h3:has-text("Modern")')).toBeVisible();
    await expect(page.locator('#wiz-step-2 h3:has-text("Heritage")')).toBeVisible();
    await expect(page.locator('#wiz-step-2 h3:has-text("Estate")')).toBeVisible();

    // Select Modern
    await page.click('.wiz-style-card:first-child');
    await expect(page.locator('.wiz-style-card:first-child')).toHaveClass(/ring-primary/);

    // Select Heritage (should deselect Modern)
    await page.click('.wiz-style-card:nth-child(2)');
    await expect(page.locator('.wiz-style-card:nth-child(2)')).toHaveClass(/ring-primary/);
    await expect(page.locator('.wiz-style-card:first-child')).not.toHaveClass(/ring-primary/);

    await page.screenshot({ path: 'test-results/wizard-mobile-step2-selected.png' });
  });

  test('Step 2 to Step 3: Navigate forward', async ({ page }) => {
    await page.click('#wiz-next');
    await page.waitForTimeout(500);
    await page.click('#wiz-next');
    await page.waitForTimeout(500);

    await expect(page.locator('#wiz-step-3')).toBeVisible();
    await expect(page.locator('#wizard-title')).toContainText('Finish');

    const width = await page.locator('#wizard-progress').evaluate(el => el.style.width);
    expect(width).toBe('60%');

    await page.screenshot({ path: 'test-results/wizard-mobile-step3.png' });
  });

  test('Step 3: Finish level and budget', async ({ page }) => {
    await page.click('#wiz-next');
    await page.click('#wiz-next');
    await page.waitForTimeout(500);

    // Check finish level cards
    await expect(page.locator('#wiz-step-3 h4:has-text("Standard")')).toBeVisible();
    await expect(page.locator('#wiz-step-3 h4:has-text("Luxury")')).toBeVisible();
    await expect(page.locator('#wiz-step-3:has-text("Recommended")')).toBeVisible();

    // Check budget estimate
    await expect(page.locator('#wiz-step-3:has-text("Estimated Budget Range")')).toBeVisible();
    await expect(page.locator('#budget-estimate')).toBeVisible();

    // Check range slider
    await expect(page.locator('#finish-slider')).toBeVisible();
  });

  test('Step 3 to Step 4: Navigate forward', async ({ page }) => {
    await page.click('#wiz-next');
    await page.click('#wiz-next');
    await page.click('#wiz-next');
    await page.waitForTimeout(500);

    await expect(page.locator('#wiz-step-4')).toBeVisible();
    await expect(page.locator('#wizard-title')).toContainText('Timeline');

    const width = await page.locator('#wizard-progress').evaluate(el => el.style.width);
    expect(width).toBe('80%');

    await page.screenshot({ path: 'test-results/wizard-mobile-step4.png' });
  });

  test('Step 4: Timeline selection', async ({ page }) => {
    await page.click('#wiz-next');
    await page.click('#wiz-next');
    await page.click('#wiz-next');
    await page.waitForTimeout(500);

    // Check timeline options
    await expect(page.locator('#wiz-step-4:has-text("Immediate")')).toBeVisible();
    await expect(page.locator('#wiz-step-4:has-text("3-6 Months")')).toBeVisible();
    await expect(page.locator('#wiz-step-4:has-text("6-12 Months")')).toBeVisible();
    await expect(page.locator('#wiz-step-4:has-text("Not Sure Yet")')).toBeVisible();

    // Select a timeline
    await page.click('#wiz-step-4 :has-text("3-6 Months")');
    await page.screenshot({ path: 'test-results/wizard-mobile-step4-selected.png' });
  });

  test('Step 4 to Step 5: Navigate to review', async ({ page }) => {
    await page.click('#wiz-next');
    await page.click('#wiz-next');
    await page.click('#wiz-next');
    await page.click('#wiz-next');
    await page.waitForTimeout(500);

    await expect(page.locator('#wiz-step-5')).toBeVisible();
    await expect(page.locator('#wizard-title')).toContainText('Review');

    const width = await page.locator('#wizard-progress').evaluate(el => el.style.width);
    expect(width).toBe('100%');

    // Check review fields
    await expect(page.locator('#wiz-step-5:has-text("Review")')).toBeVisible();
    await expect(page.locator('#review-location')).toBeVisible();
    await expect(page.locator('#review-size')).toBeVisible();

    await page.screenshot({ path: 'test-results/wizard-mobile-step5.png' });
  });

  test('Step 5: Submit completes wizard', async ({ page }) => {
    await page.click('#wiz-next');
    await page.click('#wiz-next');
    await page.click('#wiz-next');
    await page.click('#wiz-next');
    await page.waitForTimeout(500);

    // Verify submit button text
    await expect(page.locator('#wiz-next:has-text("Submit Request")')).toBeVisible();

    // Click submit
    await page.click('#wiz-next');
    await page.waitForTimeout(500);

    // Should show processing spinner
    await expect(page.locator('#wiz-next:has-text("Processing")')).toBeVisible();

    await page.screenshot({ path: 'test-results/wizard-mobile-submitting.png' });

    // Wait for completion
    await page.waitForTimeout(3000);

    // Toast should appear
    await expect(page.locator('#toast')).toBeVisible();

    // Should reset to step 1
    await expect(page.locator('#wiz-step-1')).toBeVisible();
    await expect(page.locator('#wizard-count')).toContainText('Step 1 of 5');

    await page.screenshot({ path: 'test-results/wizard-mobile-reset.png' });
  });

  test('Back button works from every step', async ({ page }) => {
    // Go to step 2
    await page.click('#wiz-next');
    await page.waitForTimeout(300);
    await expect(page.locator('#wiz-step-2')).toBeVisible();

    // Go to step 3
    await page.click('#wiz-next');
    await page.waitForTimeout(300);
    await expect(page.locator('#wiz-step-3')).toBeVisible();

    // Go back to step 2
    await page.click('#wiz-prev');
    await page.waitForTimeout(300);
    await expect(page.locator('#wiz-step-2')).toBeVisible();
    await expect(page.locator('#wizard-title')).toContainText('House Design');

    // Go back to step 1
    await page.click('#wiz-prev');
    await page.waitForTimeout(300);
    await expect(page.locator('#wiz-step-1')).toBeVisible();
    await expect(page.locator('#wizard-title')).toContainText('Land Information');

    // Prev should be invisible on step 1
    const prevHidden = await page.locator('#wiz-prev').evaluate(el => el.classList.contains('invisible'));
    expect(prevHidden).toBe(true);
  });

  test('Bottom nav is visible during wizard', async ({ page }) => {
    await expect(page.locator('#bottom-nav')).toBeVisible();

    // Navigate through steps, bottom nav stays visible
    await page.click('#wiz-next');
    await page.waitForTimeout(300);
    await expect(page.locator('#bottom-nav')).toBeVisible();

    await page.click('#wiz-next');
    await page.waitForTimeout(300);
    await expect(page.locator('#bottom-nav')).toBeVisible();
  });

  test('Full happy path: fill all fields and submit', async ({ page }) => {
    // Step 1: Fill location
    await page.fill('input[placeholder*="City"]', 'Accra, Ghana');
    await page.fill('input[placeholder="e.g. 450"]', '600');

    // Go to step 2
    await page.click('#wiz-next');
    await page.waitForTimeout(500);

    // Step 2: Select Modern style
    await page.click('.wiz-style-card:first-child');
    await page.waitForTimeout(200);

    // Go to step 3
    await page.click('#wiz-next');
    await page.waitForTimeout(500);

    // Step 3: Finish level is already Premium (default)
    await expect(page.locator('#budget-estimate')).toBeVisible();

    // Go to step 4
    await page.click('#wiz-next');
    await page.waitForTimeout(500);

    // Step 4: Select timeline
    await page.click('#wiz-step-4 :has-text("3-6 Months")');
    await page.waitForTimeout(200);

    // Go to step 5
    await page.click('#wiz-next');
    await page.waitForTimeout(500);

    // Step 5: Review and submit
    await expect(page.locator('#review-location')).toContainText('Accra, Ghana');
    await expect(page.locator('#review-size')).toContainText('600');

    await page.click('#wiz-next'); // Submit
    await page.waitForTimeout(3500);

    // Verify completion
    await expect(page.locator('#toast')).toBeVisible();
    await expect(page.locator('#wiz-step-1')).toBeVisible();

    await page.screenshot({ path: 'test-results/wizard-mobile-complete.png' });
  });
});
