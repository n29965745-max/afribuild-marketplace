const { test, expect } = require('@playwright/test');

test('debug supabase global', async ({ page }) => {
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));
  
  await page.goto('https://afribuild-azure.vercel.app/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  
  const result = await page.evaluate(() => {
    return {
      hasSupabase: typeof supabase !== 'undefined',
      hasCreateClient: typeof supabase !== 'undefined' && typeof supabase.createClient === 'function',
      hasWindowClient: typeof window.supabaseClient !== 'undefined' && window.supabaseClient !== null,
      windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('supabase')),
    };
  });
  
  console.log('Debug result:', JSON.stringify(result, null, 2));
  console.log('Console logs:', logs.filter(l => l.toLowerCase().includes('supabase')));
});
