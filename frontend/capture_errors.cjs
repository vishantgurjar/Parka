const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', exception => {
    errors.push(exception.message);
  });

  try {
    console.log("Loading Home Page...");
    await page.goto('https://parka-frontend.vercel.app/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log("Captured Errors:", errors);

    await page.screenshot({ path: 'frontend-home-error.png' });
  } catch (error) {
    console.error("Playwright Error:", error);
  } finally {
    await browser.close();
  }
})();
