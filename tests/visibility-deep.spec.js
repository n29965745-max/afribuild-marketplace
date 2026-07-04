const { test } = require('@playwright/test');

const pages = ['home','properties','materials','build','professionals','contractors','equipment','transport','financing','blog','dashboard','admin','approval','request-quote','contact'];

for (const pageName of pages) {
  test(`deep-audit: ${pageName}`, async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await page.evaluate((p) => { window.location.hash = '/' + p; }, pageName);
    await page.waitForTimeout(3000);

    const issues = await page.evaluate(() => {
      const problems = [];
      const activeSection = document.querySelector('.page-section.active');
      if (!activeSection) return problems;

      const walk = (el) => {
        if (!el.children || el.children.length === 0) {
          const text = el.textContent?.trim();
          if (!text || text.length < 2) return;
          const s = window.getComputedStyle(el);
          if (s.display === 'none' || s.visibility === 'hidden') return;

          const color = s.color;
          // Parse rgb values
          const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (!m) return;
          const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;

          // Get parent bg by walking up
          let parent = el.parentElement;
          let bgR = 255, bgG = 255, bgB = 255;
          while (parent && parent !== activeSection) {
            const ps = window.getComputedStyle(parent);
            const bg = ps.backgroundColor;
            const bm = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (bm && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
              bgR = parseInt(bm[1]); bgG = parseInt(bm[2]); bgB = parseInt(bm[3]);
              break;
            }
            parent = parent.parentElement;
          }
          const bgBrightness = (bgR * 299 + bgG * 587 + bgB * 114) / 1000;
          const contrast = Math.abs(brightness - bgBrightness);

          // Low contrast = hard to read
          if (contrast < 40 && text.length > 2) {
            problems.push({
              tag: el.tagName,
              text: text.substring(0, 80),
              color: `rgb(${r},${g},${b})`,
              bg: `rgb(${bgR},${bgG},${bgB})`,
              contrast: contrast.toFixed(1)
            });
          }
        }
        if (el.children) Array.from(el.children).forEach(walk);
      };
      walk(activeSection);
      return problems;
    });

    if (issues.length > 0) {
      console.log(`\n=== ${pageName}: LOW CONTRAST TEXT ===`);
      issues.forEach(i => console.log(`  <${i.tag}> contrast=${i.contrast} color=${i.color} bg=${i.bg} "${i.text}"`));
    }
  });
}
