const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) {
      console.log('HTTP ERROR:', response.status(), response.url());
    }
  });

  try {
    await page.goto('http://localhost:4201', { waitUntil: 'networkidle0', timeout: 15000 });
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    console.log('BODY:', bodyHTML);
  } catch (e) {
    console.error('PUPPETEER ERROR:', e);
  }

  await browser.close();
})();
