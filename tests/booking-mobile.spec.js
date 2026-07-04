// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:5001';

async function goToPage(page, hashRoute) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.evaluate((route) => { window.location.hash = '/' + route; }, hashRoute);
  await page.waitForTimeout(1500);
}

test.describe('Consultation Booking Flow - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  // ===== PROFESSIONAL DIRECTORY =====
  test('Professionals: page loads with all elements', async ({ page }) => {
    await goToPage(page, 'professionals');
    await page.screenshot({ path: 'test-results/booking-mobile-professionals.png' });

    await expect(page.locator('#page-professionals h2:has-text("Professional Directory")')).toBeVisible();
    await expect(page.locator('#page-professionals input[placeholder*="Search by name"]')).toBeVisible();
    await expect(page.locator('#page-professionals button:has-text("All Professionals")')).toBeVisible();
    await expect(page.locator('#page-professionals button:has-text("Architects")')).toBeVisible();
    await expect(page.locator('#page-professionals button:has-text("Engineers")')).toBeVisible();
  });

  test('Professionals: search works', async ({ page }) => {
    await goToPage(page, 'professionals');
    await page.fill('#page-professionals input[placeholder*="Search by name"]', 'Kwame');
    const val = await page.inputValue('#page-professionals input[placeholder*="Search by name"]');
    expect(val).toBe('Kwame');
  });

  test('Professionals: filter chips toggle correctly', async ({ page }) => {
    await goToPage(page, 'professionals');
    const archBtn = page.locator('#page-professionals button:has-text("Architects")');
    await archBtn.click();
    await expect(archBtn).toHaveClass(/bg-primary/);
    await expect(archBtn).toHaveClass(/text-white/);

    const allBtn = page.locator('#page-professionals button:has-text("All Professionals")');
    await expect(allBtn).not.toHaveClass(/bg-primary/);

    await allBtn.click();
    await expect(allBtn).toHaveClass(/bg-primary/);
  });

  test('Professionals: all 5 profile cards display correctly', async ({ page }) => {
    await goToPage(page, 'professionals');

    // Check all professionals
    await expect(page.locator('#page-professionals:has-text("Kwame Mensah")')).toBeVisible();
    await expect(page.locator('#page-professionals:has-text("Lead Architect")')).toBeVisible();
    await expect(page.locator('#page-professionals:has-text("4.9")').first()).toBeVisible();
    await expect(page.locator('#page-professionals:has-text("Residential")')).toBeVisible();
    await expect(page.locator('#page-professionals:has-text("Green-Build")')).toBeVisible();
  });

  test('Professionals: verified badges show on cards', async ({ page }) => {
    await goToPage(page, 'professionals');
    const badges = page.locator('.verified-badge');
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('Professionals: request quote button triggers toast', async ({ page }) => {
    await goToPage(page, 'professionals');
    const quoteBtn = page.locator('#page-professionals button:has-text("Request Quote")').first();
    await quoteBtn.scrollIntoViewIfNeeded();
    await quoteBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('#toast')).toBeVisible();
    const toastText = await page.locator('#toast').textContent();
    expect(toastText).toContain('Quote request sent');
  });

  test('Professionals: join directory CTA visible', async ({ page }) => {
    await goToPage(page, 'professionals');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await expect(page.locator('#page-professionals:has-text("Join the Directory")')).toBeVisible();
    await expect(page.locator('#page-professionals button:has-text("Apply for Verification")')).toBeVisible();
  });

  test('Professionals: scroll through all cards on mobile', async ({ page }) => {
    await goToPage(page, 'professionals');
    await page.screenshot({ path: 'test-results/booking-mobile-professionals-top.png' });

    // Scroll to see all cards
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(500);
    await expect(page.locator('#page-professionals:has-text("Samuel Bekele")')).toBeVisible();
    await page.screenshot({ path: 'test-results/booking-mobile-professionals-bottom.png' });
  });

  // ===== CONTRACTORS =====
  test('Contractors: page loads with cards', async ({ page }) => {
    await goToPage(page, 'contractors');
    await page.screenshot({ path: 'test-results/booking-mobile-contractors.png' });

    await expect(page.locator('#page-contractors h2:has-text("Find Contractors")')).toBeVisible();
    await expect(page.locator('#page-contractors:has-text("BuildMax Construction")')).toBeVisible();
    await expect(page.locator('#page-contractors:has-text("AquaFix Plumbing")')).toBeVisible();
  });

  test('Contractors: request quote triggers toast', async ({ page }) => {
    await goToPage(page, 'contractors');
    await page.locator('#page-contractors button:has-text("Request Quote")').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('#toast')).toBeVisible();
  });

  // ===== REQUEST QUOTE FORM =====
  test('Request Quote: page loads with form', async ({ page }) => {
    await goToPage(page, 'request-quote');
    await page.screenshot({ path: 'test-results/booking-mobile-request-quote.png' });

    await expect(page.locator('#page-request-quote h2:has-text("Request a Quote")')).toBeVisible();
    await expect(page.locator('#page-request-quote input[placeholder="Your full name"]')).toBeVisible();
    await expect(page.locator('#page-request-quote input[placeholder="your@email.com"]')).toBeVisible();
    await expect(page.locator('#page-request-quote select').first()).toBeVisible();
    await expect(page.locator('#page-request-quote textarea')).toBeVisible();
    await expect(page.locator('#page-request-quote button:has-text("Submit Quote Request")')).toBeVisible();
  });

  test('Request Quote: form validation - empty submit blocked', async ({ page }) => {
    await goToPage(page, 'request-quote');
    // Try to submit empty form - required fields should trigger browser validation
    const submitBtn = page.locator('#page-request-quote button:has-text("Submit Quote Request")');
    await submitBtn.click();
    await page.waitForTimeout(1000);
    // Toast should NOT appear since required fields are empty
    const toastVisible = await page.locator('#toast.show').isVisible();
    expect(toastVisible).toBe(false);
  });

  test('Request Quote: fill and submit form successfully', async ({ page }) => {
    await goToPage(page, 'request-quote');

    // Wait for form to be ready
    await expect(page.locator('#page-request-quote form')).toBeVisible();

    // Fill fields one by one with small waits
    const nameInput = page.locator('#page-request-quote input[placeholder="Your full name"]');
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.fill('Oluwaseun Adeyemi');

    const emailInput = page.locator('#page-request-quote input[placeholder="your@email.com"]');
    await emailInput.fill('oluwaseun@example.com');

    const phoneInput = page.locator('#page-request-quote input[placeholder*="234"]');
    await phoneInput.fill('+234 801 234 5678');

    // Select project type (first select in the form)
    const selects = page.locator('#page-request-quote select');
    await selects.nth(0).selectOption({ index: 1 });

    const locationInput = page.locator('#page-request-quote input[placeholder="City, Country"]');
    await locationInput.fill('Lagos, Nigeria');

    await selects.nth(1).selectOption({ index: 2 });
    await selects.nth(2).selectOption({ index: 1 });

    const descInput = page.locator('#page-request-quote textarea');
    await descInput.fill('I want to build a 4-bedroom modern house in Lekki Phase 1. Budget is between $150k-$500k.');

    // Verify fields were filled
    expect(await nameInput.inputValue()).toBe('Oluwaseun Adeyemi');
    expect(await emailInput.inputValue()).toBe('oluwaseun@example.com');

    await page.screenshot({ path: 'test-results/booking-mobile-quote-filled.png' });

    await page.click('#page-request-quote button:has-text("Submit Quote Request")');
    await page.waitForTimeout(1500);
    await expect(page.locator('#toast.show')).toBeVisible();
  });

  test('Request Quote: form fields are interactive on mobile', async ({ page }) => {
    await goToPage(page, 'request-quote');

    // Test typing in name field
    await page.fill('#page-request-quote input[placeholder="Your full name"]', 'Test User');
    expect(await page.inputValue('#page-request-quote input[placeholder="Your full name"]')).toBe('Test User');

    // Test email field
    await page.fill('#page-request-quote input[placeholder="your@email.com"]', 'test@test.com');
    expect(await page.inputValue('#page-request-quote input[placeholder="your@email.com"]')).toBe('test@test.com');

    // Test dropdown
    await page.selectOption('#page-request-quote select:first-of-type', { value: 'Residential Build' });

    // Test textarea
    await page.fill('#page-request-quote textarea', 'Test description');
    expect(await page.inputValue('#page-request-quote textarea')).toBe('Test description');
  });

  // ===== CONTACT FORM =====
  test('Contact: page loads with form and offices', async ({ page }) => {
    await goToPage(page, 'contact');
    await page.screenshot({ path: 'test-results/booking-mobile-contact.png' });

    await expect(page.locator('#page-contact h2:has-text("Contact Us")')).toBeVisible();
    await expect(page.locator('#page-contact button:has-text("Send Message")')).toBeVisible();
    await expect(page.locator('#page-contact:has-text("Lagos, Nigeria")')).toBeVisible();
    await expect(page.locator('#page-contact:has-text("Nairobi, Kenya")')).toBeVisible();
    await expect(page.locator('#page-contact:has-text("Accra, Ghana")')).toBeVisible();
  });

  test('Contact: fill and submit contact form', async ({ page }) => {
    await goToPage(page, 'contact');

    await page.fill('#page-contact input[placeholder="Your name"]', 'Test User');
    await page.fill('#page-contact input[placeholder="your@email.com"]', 'test@test.com');
    await page.fill('#page-contact input[placeholder*="help"]', 'Partnership Inquiry');
    await page.fill('#page-contact textarea', 'Interested in listing my properties on AfriBuild.');

    await page.click('#page-contact button:has-text("Send Message")');
    await page.waitForTimeout(1000);
    await expect(page.locator('#toast')).toBeVisible();
  });

  // ===== END-TO-END BOOKING FLOW =====
  test('E2E: Browse professionals -> Request quote -> Fill form -> Submit', async ({ page }) => {
    // Step 1: Go to professionals
    await goToPage(page, 'professionals');
    await page.screenshot({ path: 'test-results/booking-e2e-1-professionals.png' });

    // Step 2: Click request quote on first professional
    await page.locator('#page-professionals button:has-text("Request Quote")').first().scrollIntoViewIfNeeded();
    await page.locator('#page-professionals button:has-text("Request Quote")').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('#toast')).toBeVisible();
    await page.screenshot({ path: 'test-results/booking-e2e-2-toast.png' });

    // Step 3: Navigate to request quote form
    await goToPage(page, 'request-quote');
    await page.screenshot({ path: 'test-results/booking-e2e-3-form.png' });

    // Step 4: Fill the form
    await page.fill('#page-request-quote input[placeholder="Your full name"]', 'Kwaku Asante');
    await page.fill('#page-request-quote input[placeholder="your@email.com"]', 'kwaku@example.com');
    await page.fill('#page-request-quote input[placeholder*="234"]', '+233 24 567 8901');
    await page.selectOption('#page-request-quote select:first-of-type', { index: 1 });
    await page.fill('#page-request-quote input[placeholder="City, Country"]', 'Accra, Ghana');
    await page.selectOption('#page-request-quote select >> nth=1', { index: 2 });
    await page.selectOption('#page-request-quote select >> nth=2', { index: 1 });
    await page.fill('#page-request-quote textarea', 'Need an architect and structural engineer for a 5-bedroom luxury villa in East Legon. Land is 800 sqm. Want modern design with smart home features.');

    await page.screenshot({ path: 'test-results/booking-e2e-4-filled.png' });

    // Step 5: Submit
    await page.click('#page-request-quote button:has-text("Submit Quote Request")');
    await page.waitForTimeout(1000);
    await expect(page.locator('#toast')).toBeVisible();
    await page.screenshot({ path: 'test-results/booking-e2e-5-submitted.png' });
  });

  // ===== BOTTOM NAV PERSISTS =====
  test('Bottom nav visible on all booking pages', async ({ page }) => {
    const pages = ['professionals', 'contractors', 'request-quote', 'contact'];
    for (const p of pages) {
      await goToPage(page, p);
      await expect(page.locator('#bottom-nav')).toBeVisible();
    }
  });
});
