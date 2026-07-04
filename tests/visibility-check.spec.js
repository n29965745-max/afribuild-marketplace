const { test } = require('@playwright/test');

test('admin page text visibility', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { window.location.hash = '/admin'; });
  await page.waitForTimeout(3000);

  const issues = await page.evaluate(() => {
    const problems = [];
    const section = document.querySelector('#page-admin');
    if (!section) return problems;
    const allEls = section.querySelectorAll('*');
    allEls.forEach(el => {
      const text = el.textContent?.trim();
      if (!text || text.length < 2 || el.children.length > 1) return;
      const s = window.getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden') return;
      const c = s.color;
      // Check for dark text on dark bg (admin bg is #111827)
      const cm = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!cm) return;
      const cr = parseInt(cm[1]), cg = parseInt(cm[2]), cb = parseInt(cm[3]);
      // Admin bg is very dark - text should be light
      if (cr < 80 && cg < 80 && cb < 80) {
        // Dark text - check if parent has dark bg
        let p = el.parentElement;
        while (p && p !== section) {
          const ps = window.getComputedStyle(p);
          const bg = ps.backgroundColor;
          const bm = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (bm) {
            const br = parseInt(bm[1]), bg2 = parseInt(bm[2]), bb = parseInt(bm[3]);
            if (br < 50 && bg2 < 50 && bb < 50) {
              problems.push({ text: text.substring(0, 80), color: c, bg: `rgb(${br},${bg2},${bb})`, tag: el.tagName, class: el.className?.substring(0, 50) });
              return;
            }
          }
          p = p.parentElement;
        }
      }
    });
    return problems;
  });

  if (issues.length) {
    console.log('ADMIN DARK BG ISSUES:');
    issues.forEach(i => console.log(`  <${i.tag} class="${i.class}"> color=${i.color} bg=${i.bg} "${i.text}"`));
  }
});

test('all pages: find elements with very light gray text', async ({ page }) => {
  const pages = ['home','properties','materials','build','professionals','dashboard','blog','equipment','contact','request-quote'];
  const allIssues = [];

  for (const p of pages) {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.evaluate((pg) => { window.location.hash = '/' + pg; }, p);
    await page.waitForTimeout(2000);

    const issues = await page.evaluate((pg) => {
      const problems = [];
      const section = document.querySelector('.page-section.active');
      if (!section) return problems;
      section.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, label, a, button, td, th, li, div').forEach(el => {
        if (el.children.length > 2) return;
        const text = el.textContent?.trim();
        if (!text || text.length < 2) return;
        const s = window.getComputedStyle(el);
        if (s.display === 'none' || s.visibility === 'hidden') return;
        const c = s.color;
        const cm = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!cm) return;
        const cr = parseInt(cm[1]), cg = parseInt(cm[2]), cb = parseInt(cm[3]);
        // Text that is very close to background color (invisible)
        // Check for gray text (#9ca3af = rgb(156,163,175)) on white bg
        let p = el.parentElement;
        let bgR = 255, bgG = 255, bgB = 255;
        while (p && p !== section) {
          const ps = window.getComputedStyle(p);
          const bg = ps.backgroundColor;
          const bm = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (bm && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            bgR = parseInt(bm[1]); bgG = parseInt(bm[2]); bgB = parseInt(bm[3]); break;
          }
          p = p.parentElement;
        }
        // Check text/bg similarity
        const diff = Math.abs(cr - bgR) + Math.abs(cg - bgG) + Math.abs(cb - bgB);
        if (diff < 30 && text.length > 2) {
          problems.push({ page: pg, text: text.substring(0, 60), color: `rgb(${cr},${cg},${cb})`, bg: `rgb(${bgR},${bgG},${bgB})`, diff, tag: el.tagName });
        }
      });
      return problems;
    }, p);
    allIssues.push(...issues);
  }

  if (allIssues.length) {
    console.log('INVISIBLE/NEAR-INVISIBLE TEXT:');
    allIssues.forEach(i => console.log(`  [${i.page}] <${i.tag}> diff=${i.diff} color=${i.color} bg=${i.bg} "${i.text}"`));
  } else {
    console.log('No invisible text found across all pages');
  }
});
