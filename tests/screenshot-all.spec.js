const { test } = require('@playwright/test');
const pages = ['home','properties','materials','build','professionals','contractors','equipment','transport','financing','blog','dashboard','admin','approval','request-quote','contact'];

for (const p of pages) {
  test(`screenshot: ${p}`, async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate((pg) => { window.location.hash = '/' + pg; }, p);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `/home/bruno/afribuild/test-results/screen-${p}.png`, fullPage: true });
  });
}
