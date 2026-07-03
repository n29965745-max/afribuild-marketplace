// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Listing Approval Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/approval'; });
    await page.waitForTimeout(1000);
  });

  test('should display page heading', async ({ page }) => {
    await expect(page.locator('#page-approval')).toBeVisible();
    await expect(page.locator('h2:has-text("Listing Approval Workflow")')).toBeVisible();
  });

  test('should display property title', async ({ page }) => {
    await expect(page.locator('#page-approval h3:has-text("Zenith Terraces")')).toBeVisible();
  });

  test('should display property location', async ({ page }) => {
    await expect(page.locator('#page-approval:has-text("Ikoyi, Lagos")')).toBeVisible();
  });

  test('should display property specs', async ({ page }) => {
    await expect(page.locator('#page-approval:has-text("Luxury Terrace")')).toBeVisible();
    await expect(page.locator('#page-approval:has-text("1,200 SQM")')).toBeVisible();
    await expect(page.locator('#page-approval:has-text("5 Suites")')).toBeVisible();
  });

  test('should display price', async ({ page }) => {
    await expect(page.locator('#page-approval:has-text("N850,000,000")')).toBeVisible();
  });

  test('should display compliance checklist', async ({ page }) => {
    await expect(page.locator('#page-approval h4:has-text("Compliance Checklist")')).toBeVisible();
    await expect(page.locator('#page-approval:has-text("Certificate of Occupancy")')).toBeVisible();
  });

  test('should display verification progress', async ({ page }) => {
    await expect(page.locator('#page-approval:has-text("66% Verification")')).toBeVisible();
  });

  test('should display audit notes textarea', async ({ page }) => {
    await expect(page.locator('#page-approval textarea')).toBeVisible();
  });

  test('should display action buttons', async ({ page }) => {
    await expect(page.locator('#page-approval button:has-text("Approve Listing")')).toBeVisible();
    await expect(page.locator('#page-approval button:has-text("Request Clarification")')).toBeVisible();
    await expect(page.locator('#page-approval button:has-text("Reject Listing")')).toBeVisible();
  });

  test('should show toast on approve', async ({ page }) => {
    await page.click('#page-approval button:has-text("Approve Listing")');
    await expect(page.locator('#toast')).toBeVisible();
  });

  test('should display pending review status', async ({ page }) => {
    await expect(page.locator('#page-approval:has-text("Pending Review")')).toBeVisible();
  });
});
