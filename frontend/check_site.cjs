const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log("Loading Home Page...");
    await page.goto('https://parka-frontend.vercel.app/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'frontend-home-playwright.png' });
    console.log("Home Page Verified.");

    console.log("Loading Vehicle Landing Page...");
    // Let's go to a vehicle ID to check the secure call button
    await page.goto('https://parka-frontend.vercel.app/v/demo', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'frontend-vehicle-playwright.png' });
    
    // Check if the secure button is in the DOM
    const buttonText = await page.evaluate(() => document.body.innerText);
    if (buttonText.includes("Secure Privacy Call")) {
        console.log("SUCCESS: Secure Privacy Call button is present.");
    } else {
        console.log("WARNING: Secure Privacy Call button is MISSING.");
    }
  } catch (error) {
    console.error("Playwright Error:", error);
  } finally {
    await browser.close();
  }
})();
