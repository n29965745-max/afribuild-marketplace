// @ts-check
const { test, expect } = require('@playwright/test');

async function goToPage(page, hashRoute) {
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.evaluate((route) => { window.location.hash = '/' + route; }, hashRoute);
  await page.waitForTimeout(2000);
}

test.describe('Equipment Hire', () => {
  test('should display page heading', async ({ page }) => {
    await goToPage(page, 'equipment');
    await expect(page.locator('#page-equipment')).toBeVisible();
    await expect(page.locator('h2:has-text("Equipment Hire")')).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    await goToPage(page, 'equipment');
    await expect(page.locator('#page-equipment input[placeholder*="Search equipment"]')).toBeVisible();
  });

  test('should display equipment cards', async ({ page }) => {
    await goToPage(page, 'equipment');
    await expect(page.locator('#page-equipment h3:has-text("CAT 320 Excavator")')).toBeVisible();
  });

  test('should display daily rates', async ({ page }) => {
    await goToPage(page, 'equipment');
    await expect(page.locator('#page-equipment:has-text("$350/day")')).toBeVisible();
  });

  test('should display availability badges', async ({ page }) => {
    await goToPage(page, 'equipment');
    await expect(page.locator('#page-equipment:has-text("Available")')).toBeVisible();
  });

  test('should have Book Now buttons', async ({ page }) => {
    await goToPage(page, 'equipment');
    await expect(page.locator('#page-equipment button:has-text("Book Now")').first()).toBeVisible();
  });
});

test.describe('Transport & Logistics', () => {
  test('should display page heading', async ({ page }) => {
    await goToPage(page, 'transport');
    await expect(page.locator('#page-transport')).toBeVisible();
    await expect(page.locator('h2:has-text("Transport")')).toBeVisible();
  });

  test('should display service cards', async ({ page }) => {
    await goToPage(page, 'transport');
    await expect(page.locator('#page-transport:has-text("Tipper Trucks")')).toBeVisible();
  });

  test('should have request form', async ({ page }) => {
    await goToPage(page, 'transport');
    await expect(page.locator('#page-transport button:has-text("Submit Request")')).toBeVisible();
  });
});

test.describe('Blog & Resources', () => {
  test('should display page heading', async ({ page }) => {
    await goToPage(page, 'blog');
    await expect(page.locator('#page-blog')).toBeVisible();
    await expect(page.locator('h2:has-text("Blog")')).toBeVisible();
  });

  test('should display article cards', async ({ page }) => {
    await goToPage(page, 'blog');
    await expect(page.locator('#page-blog:has-text("Construction Material Prices")')).toBeVisible();
  });
});

test.describe('Request Quote', () => {
  test('should display quote form', async ({ page }) => {
    await goToPage(page, 'request-quote');
    await expect(page.locator('#page-request-quote')).toBeVisible();
    await expect(page.locator('h2:has-text("Request a Quote")')).toBeVisible();
  });

  test('should have form fields', async ({ page }) => {
    await goToPage(page, 'request-quote');
    await expect(page.locator('#page-request-quote select').first()).toBeVisible();
    await expect(page.locator('#page-request-quote textarea').first()).toBeVisible();
  });

  test('should have submit button', async ({ page }) => {
    await goToPage(page, 'request-quote');
    await expect(page.locator('#page-request-quote button:has-text("Submit Quote Request")')).toBeVisible();
  });

  test('should show toast on submit', async ({ page }) => {
    await goToPage(page, 'request-quote');
    await page.fill('#page-request-quote input[placeholder="Your full name"]', 'Test User');
    await page.fill('#page-request-quote input[placeholder="your@email.com"]', 'test@test.com');
    await page.fill('#page-request-quote textarea', 'Build a 3-bedroom house');
    await page.click('#page-request-quote button:has-text("Submit Quote Request")');
    await expect(page.locator('#toast')).toBeVisible();
  });
});

test.describe('Contact Us', () => {
  test('should display contact form', async ({ page }) => {
    await goToPage(page, 'contact');
    await expect(page.locator('#page-contact')).toBeVisible();
    await expect(page.locator('h2:has-text("Contact Us")')).toBeVisible();
  });

  test('should display office locations', async ({ page }) => {
    await goToPage(page, 'contact');
    await expect(page.locator('#page-contact:has-text("Lagos, Nigeria")')).toBeVisible();
    await expect(page.locator('#page-contact:has-text("Nairobi, Kenya")')).toBeVisible();
    await expect(page.locator('#page-contact:has-text("Accra, Ghana")')).toBeVisible();
  });

  test('should have contact form', async ({ page }) => {
    await goToPage(page, 'contact');
    await expect(page.locator('#page-contact button:has-text("Send Message")')).toBeVisible();
  });
});

test.describe('Contractors', () => {
  test('should display page heading', async ({ page }) => {
    await goToPage(page, 'contractors');
    await expect(page.locator('#page-contractors')).toBeVisible();
    await expect(page.locator('h2:has-text("Find Contractors")')).toBeVisible();
  });

  test('should display contractor cards', async ({ page }) => {
    await goToPage(page, 'contractors');
    await expect(page.locator('#page-contractors:has-text("BuildMax Construction")')).toBeVisible();
  });
});

test.describe('Financing', () => {
  test('should display financing options', async ({ page }) => {
    await goToPage(page, 'financing');
    await expect(page.locator('#page-financing')).toBeVisible();
    await expect(page.locator('#page-financing:has-text("Mortgages")')).toBeVisible();
    await expect(page.locator('#page-financing:has-text("Construction Loans")')).toBeVisible();
    await expect(page.locator('#page-financing:has-text("Insurance")')).toBeVisible();
  });
});
