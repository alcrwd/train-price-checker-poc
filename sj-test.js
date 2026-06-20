const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });

  const page = await browser.newPage();

  await page.goto('https://www.sj.se');

  console.log('SJ öppnad');

  await page.screenshot({
    path: 'sj-homepage.png',
    fullPage: true
  });

  await page.pause();

  await browser.close();
})();