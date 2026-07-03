// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'https://afribuild-azure.vercel.app';

test.describe('Vercel Live Site Visual Tests', () => {
  test('homepage loads and screenshot', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/vercel-home.png', fullPage: false });
    const title = await page.title();
    console.log('Title:', title);
    // Check what's visible
    const body = await page.textContent('body');
    console.log('Body preview:', body?.substring(0, 500));
  });

  test('properties page loads', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/properties'; });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/vercel-properties.png', fullPage: false });
    const visible = await page.locator('#page-properties').isVisible();
    console.log('Properties visible:', visible);
  });

  test('materials page loads', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/materials'; });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/vercel-materials.png', fullPage: false });
    const visible = await page.locator('#page-materials').isVisible();
    console.log('Materials visible:', visible);
  });

  test('build wizard loads', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/build'; });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/vercel-build.png', fullPage: false });
    const visible = await page.locator('#page-build').isVisible();
    console.log('Build visible:', visible);
  });

  test('dashboard loads', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/dashboard'; });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/vercel-dashboard.png', fullPage: false });
    const visible = await page.locator('#page-dashboard').isVisible();
    console.log('Dashboard visible:', visible);
  });

  test('professionals loads', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.location.hash = '/professionals'; });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/vercel-professionals.png', fullPage: false });
    const visible = await page.locator('#page-professionals').isVisible();
    console.log('Professionals visible:', visible);
  });

  test('check for console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    // Navigate through all pages
    const routes = ['properties','materials','build','professionals','contractors','equipment','transport','financing','blog','dashboard','admin','approval','request-quote','contact'];
    for (const r of routes) {
      await page.evaluate((route) => { window.location.hash = '/' + route; }, r);
      await page.waitForTimeout(500);
    }
    await page.evaluate(() => { window.location.hash = '/'; });
    await page.waitForTimeout(1000);
    console.log('Console errors:', errors.length ? errors.join('\n') : 'NONE');
    console.log('All routes tested');
  });

  test('check bottom nav is visible', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    const bottomNav = await page.locator('#bottom-nav').isVisible();
    console.log('Bottom nav visible:', bottomNav);
    await page.screenshot({ path: 'test-results/vercel-bottomnav.png', fullPage: false });
    // Check what text is on the page
    const allText = await page.locator('#bottom-nav').textContent();
    console.log('Bottom nav text:', allText);
  });
});
