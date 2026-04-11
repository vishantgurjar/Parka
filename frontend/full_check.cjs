const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  const errors = [];
  page.on('pageerror', ex => errors.push(ex.message));

  try {
    // 1. Check Home Page
    console.log("=== HOME PAGE ===");
    await page.goto('https://parka-frontend.vercel.app/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const heroText = await page.textContent('body');
    if (heroText.includes('Protect Your Vehicle')) {
      console.log("✅ Hero section loaded correctly");
    } else {
      console.log("❌ Hero section MISSING");
    }
    await page.screenshot({ path: 'verify-home.png' });

    // 2. Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verify-home-bottom.png' });

    // 3. Check Vehicle Demo Page
    console.log("\n=== VEHICLE DEMO PAGE ===");
    await page.goto('https://parka-frontend.vercel.app/v/demo', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const vehicleText = await page.textContent('body');
    if (vehicleText.includes('Vehicle Info')) {
      console.log("✅ Vehicle Landing Page loaded");
    } else {
      console.log("❌ Vehicle Landing Page FAILED to load");
    }
    
    if (vehicleText.includes('Secure Privacy Call')) {
      console.log("✅ Secure Privacy Call button FOUND");
    } else {
      console.log("⚠️ Secure Privacy Call button not found (may need PRO tier)");
    }
    
    if (vehicleText.includes('SECURE (PRO)') || vehicleText.includes('HIDDEN')) {
      console.log("✅ Phone number is MASKED (Privacy Active)");
    } else {
      console.log("⚠️ Phone number masking status unclear");
    }
    
    await page.screenshot({ path: 'verify-vehicle.png' });

    // 4. Report errors
    console.log("\n=== RUNTIME ERRORS ===");
    const criticalErrors = errors.filter(e => !e.includes('WebSocket') && !e.includes('400'));
    if (criticalErrors.length === 0) {
      console.log("✅ ZERO critical runtime errors!");
    } else {
      criticalErrors.forEach(e => console.log("❌ ERROR:", e));
    }

  } catch (error) {
    console.error("Script Error:", error.message);
  } finally {
    await browser.close();
  }
})();
