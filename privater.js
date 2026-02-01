const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Utility: Random delay between min and max seconds
const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1) + min) * 1000;

// Configuration
const CONFIG = {
    FAST_MODE: true, // Set to false for more human-like delays
    delays: {
        navigation: { min: 1, max: 2 },      // After page load
        hover: 300,                           // After hover
        modalOpen: { min: 0.5, max: 1 },     // After modal opens
        dropdownClick: 800,                   // After clicking dropdown
        optionSelect: { min: 0.5, max: 1 },  // After selecting option
        verification: 1000,                   // To verify change
        betweenVideos: { min: 2, max: 3 }    // Cooldown between videos
    }
};

// Scraper function - collects video URLs from a TikTok profile
async function scrapeVideos(username, targetCount = 50) {
    console.log(`\n🔍 Starting scraper for @${username}...`);
    console.log(`🎯 Target: ${targetCount} posts`);

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();

    await page.goto(`https://www.tiktok.com/@${username}`, {
        waitUntil: 'domcontentloaded',
        referer: 'https://www.tiktok.com/'
    });

    // Wait for any post to load
    await page.waitForSelector('a[href*="/video/"], a[href*="/photo/"]', { timeout: 0 });

    let uniqueUrls = new Set();
    let stagnantScrolls = 0;
    const MAX_STAGNANT_SCROLLS = 5;

    console.log('🔄 Scrolling page to load more videos and photos...');

    for (let i = 0; i < 100; i++) {
        // Get current links on page
        const currentLinks = await page.$$eval('a[href*="/video/"], a[href*="/photo/"]', links =>
            Array.from(new Set(links.map(link => link.href)))
        );
        
        // Track how many NEW links we found
        const previousSize = uniqueUrls.size;
        currentLinks.forEach(link => uniqueUrls.add(link));
        const currentSize = uniqueUrls.size;
        const newFound = currentSize - previousSize;

        console.log(`📊 Scroll ${i + 1}: Found ${newFound} new posts (Total: ${currentSize}/${targetCount})`);

        // Check if we've reached the target
        if (currentSize >= targetCount) {
            console.log(`✅ Target reached! Found ${currentSize} posts`);
            break;
        }

        // Check if NEW content is loading
        if (newFound === 0) {
            stagnantScrolls++;
            console.log(`⏳ No new content (${stagnantScrolls}/${MAX_STAGNANT_SCROLLS} attempts)`);
            
            if (stagnantScrolls >= MAX_STAGNANT_SCROLLS) {
                console.log(`⛔ No more posts loading — stopping at ${currentSize} posts`);
                break;
            }
            
            // Wait longer when stagnant (network might be slow)
            await page.waitForTimeout(3000);
        } else {
            // Reset stagnant counter when new content loads
            stagnantScrolls = 0;
        }

        // Scroll to bottom
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });

        // Wait for network to be idle (better than fixed timeout)
        try {
            await page.waitForLoadState('networkidle', { timeout: 5000 });
        } catch (err) {
            // If network doesn't idle in 5s, continue anyway
            await page.waitForTimeout(2000);
        }
    }

    await browser.close();

    const videoLinks = Array.from(uniqueUrls).reverse();
    const limitedLinks = videoLinks.slice(0, targetCount);
    
    const outputFile = 'videos.json';
    fs.writeFileSync(outputFile, JSON.stringify(limitedLinks, null, 2));
    console.log(`✅ Collected ${videoLinks.length} URLs, limiting to ${limitedLinks.length} as per target`);
    console.log(`✅ Saved ${limitedLinks.length} URLs to ${outputFile}`);

    return limitedLinks;
}

(async () => {
    const username = process.argv[2];
    const limit = parseInt(process.argv[3]) || 50;
    const storagePath = path.resolve(__dirname, 'cookies.json');
    const progressPath = path.resolve(__dirname, 'progress.json');

    // Validate username
    if (!username) {
        console.error('❌ Usage: node privater.js <username> [limit]');
        console.error('Example: node privater.js your_username 100');
        process.exit(1);
    }

    // Scrape videos first
    console.log('=' .repeat(50));
    console.log('📱 PHASE 1: SCRAPING VIDEOS');
    console.log('='.repeat(50));
    await scrapeVideos(username, limit);

    // Load videos from the file we just created
    const links = JSON.parse(fs.readFileSync('videos.json', 'utf-8'));
    
    if (!Array.isArray(links) || links.length === 0) {
        console.error('❌ No videos were scraped');
        process.exit(1);
    }

    // Load progress tracking
    const processed = new Set(
        fs.existsSync(progressPath)
            ? JSON.parse(fs.readFileSync(progressPath, 'utf-8'))
            : []
    );

    // Start privacy changes phase
    console.log('\n' + '='.repeat(50));
    console.log('🔒 PHASE 2: CHANGING PRIVACY SETTINGS');
    console.log('='.repeat(50) + '\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 },
        locale: 'en-US',
        timezoneId: 'America/New_York'
    });
    
    await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    // Load cookies (fixed path variable conflict)
    if (fs.existsSync(storagePath)) {
        const raw = JSON.parse(fs.readFileSync(storagePath, 'utf-8'));
        const rawCookies = Array.isArray(raw) ? raw : raw.cookies;
        if (!Array.isArray(rawCookies)) throw new Error('Invalid cookies format');

        const cookies = rawCookies.map(({ name, value, domain, path: cookiePath, secure, httpOnly, expirationDate, expires }) => ({
            name,
            value,
            domain,
            path: cookiePath || '/',
            secure: !!secure,
            httpOnly: !!httpOnly,
            expires: expires || (expirationDate ? Math.floor(expirationDate) : -1)
        }));

        await context.addCookies(cookies);
        console.log('🔐 Loaded saved session from cookies.json');
    } else {
        console.error('❌ cookies.json not found! Please login and export cookies first.');
        await browser.close();
        process.exit(1);
    }

    const page = await context.newPage();
    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (let i = 0; i < links.length; i++) {
        const url = links[i];
        
        // Skip already processed
        if (processed.has(url)) {
            console.log(`\n[${i + 1}/${links.length}] ⏭️  Already processed: ${url}`);
            skipCount++;
            continue;
        }

        console.log(`\n[${i + 1}/${links.length}] 🎬 Processing: ${url}`);

        try {
            // Navigate to video
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForTimeout(randomDelay(CONFIG.delays.navigation.min, CONFIG.delays.navigation.max));

            // Click settings button
            await page.waitForSelector('[data-e2e="video-setting"]', { timeout: 15000 });
            await page.hover('[data-e2e="video-setting"]');
            await page.waitForTimeout(CONFIG.delays.hover);
            
            // Click Privacy settings
            await page.click('text=Privacy settings', { timeout: 10000 });
            await page.waitForTimeout(randomDelay(CONFIG.delays.modalOpen.min, CONFIG.delays.modalOpen.max));

            // Wait for modal to appear and find dropdown trigger
            await page.waitForSelector('text=Who can watch this video', { timeout: 15000 });
            
            // Click the dropdown (only once - fixed duplicate click bug)
            const dropdownTrigger = await page.$('text=Who can watch this video >> .. >> svg');
            if (!dropdownTrigger) {
                throw new Error('Dropdown trigger not found');
            }
            await dropdownTrigger.click();
            await page.waitForTimeout(CONFIG.delays.dropdownClick);

            // Wait for "Only you" option to appear in dropdown
            await page.waitForSelector('text=Only you', { timeout: 10000 });
            
            // Click "Only you"
            await page.click('text=Only you', { timeout: 5000 });
            console.log('   ✓ Selected "Only you"');
            await page.waitForTimeout(randomDelay(CONFIG.delays.optionSelect.min, CONFIG.delays.optionSelect.max));

            // Click Done button
            await page.waitForSelector('text=Done', { timeout: 10000 });
            await page.click('text=Done');
            console.log('   ✓ Clicked Done');

            // Quick verification wait
            await page.waitForTimeout(CONFIG.delays.verification);
            console.log('✅ Privacy setting changed successfully');

            // Mark as processed
            processed.add(url);
            fs.writeFileSync(progressPath, JSON.stringify([...processed], null, 2));
            successCount++;

        } catch (err) {
            console.error(`❌ Error processing ${url}:`);
            console.error(`   ${err.message}`);
            failCount++;
        }

        // Random cooldown between videos
        const cooldown = randomDelay(CONFIG.delays.betweenVideos.min, CONFIG.delays.betweenVideos.max);
        console.log(`   ⏳ Waiting ${cooldown / 1000}s before next video...`);
        await page.waitForTimeout(cooldown);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   ✅ Successfully processed: ${successCount}`);
    console.log(`   ⏭️  Skipped (already done): ${skipCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total in list: ${links.length}`);
    console.log('='.repeat(50));

    await browser.close();
    console.log('\n✅ Script completed!');
})();