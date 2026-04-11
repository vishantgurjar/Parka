const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log("Navigating to https://parka-frontend.vercel.app/ ...");
    await page.goto('https://parka-frontend.vercel.app/', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: 'frontend-home.png' });
    console.log("Home captured.");

    console.log("Navigating to Demo Vehicle...");
    // Injecting local user data to bypass login if necessary, or just rely on public route
    await page.goto('https://parka-frontend.vercel.app/v/demo', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: 'frontend-vehicle.png' });
    console.log("Vehicle captured.");

    await browser.close();
    console.log("Done.");
  } catch (error) {
    console.error("Error capturing screenshots:", error);
    process.exit(1);
  }
})();
