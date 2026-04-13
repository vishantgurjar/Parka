const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

    try {
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
        const evalResult = await page.evaluate(() => {
            return {
                title: document.title,
                height: document.body.scrollHeight,
                hasV3: !!document.querySelector('.qr-card-v3')
            };
        });
        console.log('EVAL RESULT:', JSON.stringify(evalResult));
    } catch (e) {
        console.log('FETCH ERROR:', e.toString());
    }

    await browser.close();
})();
