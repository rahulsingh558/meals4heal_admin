const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/admin/')) {
      console.log('API RESPONSE:', url);
      try {
        const text = await response.text();
        console.log('DATA:', text.substring(0, 100) + '...');
      } catch (e) {}
    }
  });

  try {
    await page.goto('http://localhost:4201/admin/login', { waitUntil: 'networkidle0', timeout: 15000 });
    
    await page.type('#email', 'meyok@meals4heal.in');
    await page.type('#password', 'BKRahul@558');
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
      page.click('button[type="submit"]')
    ]);
    
    // Wait for APIs to finish
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.error('PUPPETEER ERROR:', e);
  }

  await browser.close();
})();
