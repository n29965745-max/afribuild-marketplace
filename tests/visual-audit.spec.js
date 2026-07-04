const { test, expect } = require('@playwright/test');

const pages = ['home','properties','materials','build','professionals','contractors','equipment','transport','financing','blog','dashboard','admin','approval','request-quote','contact'];

for (const pageName of pages) {
  test(`audit: ${pageName}`, async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate((p) => { window.location.hash = '/' + p; }, pageName);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `test-results/audit-${pageName}.png`, fullPage: true });

    // Find all visible text elements and check their computed color vs background
    const issues = await page.evaluate(() => {
      const problems = [];
      const els = document.querySelectorAll('#page-' + (window.location.hash.replace('#/','') || 'home') + ' *');
      els.forEach(el => {
        const text = el.textContent?.trim();
        if (!text || text.length < 2) return;
        if (el.children.length > 2) return; // skip containers
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bg = style.backgroundColor;
        const opacity = parseFloat(style.opacity);
        const display = style.display;
        const visibility = style.visibility;
        if (display === 'none' || visibility === 'hidden' || opacity < 0.3) return;
        // Check for white-on-white or black-on-black
        if (color === 'rgba(255, 255, 255, 1)' && bg === 'rgba(255, 255, 255, 1)') {
          problems.push({ text: text.substring(0, 60), issue: 'white-on-white', color, bg });
        }
        if (color === 'rgba(0, 0, 0, 1)' && bg === 'rgba(0, 0, 0, 1)') {
          problems.push({ text: text.substring(0, 60), issue: 'black-on-black', color, bg });
        }
        // Very low opacity text
        if (opacity < 0.5 && text.length > 1) {
          problems.push({ text: text.substring(0, 60), issue: `low-opacity-${opacity}`, color, bg });
        }
      });
      return problems;
    });

    if (issues.length > 0) {
      console.log(`\n=== ${pageName} VISIBILITY ISSUES ===`);
      issues.forEach(i => console.log(`  [${i.issue}] "${i.text}" color:${i.color} bg:${i.bg}`));
    }
  });
}
