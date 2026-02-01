# TikTok Privater

An automated tool for batch-changing TikTok video privacy settings to "Only You". This tool automatically scrapes your TikTok videos and then changes their privacy settings in one seamless workflow.

## Workflow Overview

The script works in two integrated phases:

1. **Phase 1 - Scraping**: Automatically scrapes TikTok videos from your profile and saves URLs to `videos.json`
2. **Phase 2 - Privacy Changes**: Uses your saved cookies to authenticate and change privacy settings to "Only You"

⚠️ **Critical**: You only need ONE command to do everything:

```bash
node privater.js <username> [limit]
```

The same account you scrape from and whose cookies you export **MUST be the same account**.

## Features

- **Automated Workflow**: Scrape and privatize videos in one command
- **Batch Processing**: Handle multiple TikTok videos automatically
- **Session Management**: Uses stored cookies for authenticated access (no password required)
- **Progress Tracking**: Keeps track of processed videos to avoid re-processing
- **Human-like Behavior**: Configurable delays and random timing to avoid detection
- **Error Logging**: Captures screenshots on failures for debugging

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A TikTok account with cookies exported
- Playwright browsers installed

## Installation

1. Clone or download this repository
2. Install dependencies:
```bash
npm install
```

This will install:
- **playwright**: Browser automation framework
- **axios**: HTTP client library

## Setup Instructions

### Step 1: Export Cookies from Your TikTok Account

Before running the script, export cookies from your TikTok account:

1. Use a browser extension like "EditThisCookie" or "Get cookies.txt"
2. Log into your TikTok account
3. Export your cookies
4. Save as `cookies.json` in the project root

Example `cookies.json` structure (will be provided by your cookie export extension)

### Step 2: Configure Timing (Optional)

Edit `privater.js` to modify the `CONFIG` object if needed:
- `FAST_MODE`: Set to `false` for more human-like delays (default: `true`)
- `delays`: Customize timing between actions for more reliable execution

## Usage

### Quick Start

Run one command with your TikTok username and number of videos to process:

```bash
node privater.js <username> [limit]
```

**Parameters:**
- `<username>` (required): Your TikTok username (without the @ symbol)
- `[limit]` (optional): Maximum number of videos to process (default: 50)

**Examples:**
```bash
# Process 50 videos from your account (default)
node privater.js your_username

# Process 100 videos
node privater.js your_username 100

# Process all available videos
node privater.js your_username 1000
```

### What It Does

**Phase 1 - Scraping:**
1. Launches browser and navigates to your TikTok profile
2. Scrolls through posts to collect video/photo URLs
3. Saves URLs to `videos.json`
4. Automatically stops when target reached or no new content loads

**Phase 2 - Privacy Changes:**
1. Loads your authenticated TikTok session from `cookies.json`
2. For each video:
   - Navigates to the TikTok page
   - Opens Privacy Settings
   - Changes setting to "Only You"
   - Saves changes
3. Tracks progress in `progress.json` to skip already-processed videos
4. Displays detailed summary statistics

### Prerequisites Check

Before running, ensure:
- ✅ `cookies.json` exists (from your TikTok account)
- ✅ Playwright browsers are installed

## Configuration Options

The `CONFIG` object in `privater.js` allows fine-tuning:

```javascript
const CONFIG = {
    FAST_MODE: true,                        // Quick execution vs. human-like delays
    delays: {
        navigation: { min: 1, max: 2 },    // Wait after page load (seconds)
        hover: 300,                         // Hover delay (milliseconds)
        modalOpen: { min: 0.5, max: 1 },   // Modal appearance delay (seconds)
        dropdownClick: 800,                 // Dropdown interaction (milliseconds)
        optionSelect: { min: 0.5, max: 1 }, // Option selection delay (seconds)
        verification: 1000,                 // Verification wait (milliseconds)
        betweenVideos: { min: 2, max: 3 }   // Cooldown between videos (seconds)
    }
};
```

## Output

The script generates the following files:
- **videos.json**: List of scraped video URLs
- **progress.json**: Tracks which videos have been processed

## Console Output Example

```
==================================================
📱 PHASE 1: SCRAPING VIDEOS
==================================================

🔍 Starting scraper for @your_username...
🎯 Target: 50 posts
🔄 Scrolling page to load more videos and photos...
📊 Scroll 1: Found 12 new posts (Total: 12/50)
📊 Scroll 2: Found 8 new posts (Total: 20/50)
✅ Target reached! Found 50 posts
✅ Saved 50 URLs to videos.json

==================================================
🔒 PHASE 2: CHANGING PRIVACY SETTINGS
==================================================

[1/50] 🎬 Processing: https://www.tiktok.com/@user/video/123
   ✓ Selected "Only you"
   ✓ Clicked Done
✅ Privacy setting changed successfully

==================================================
📊 Summary:
   ✅ Successfully processed: 48
   ⏭️  Skipped (already done): 0
   ❌ Failed: 2
   📝 Total in list: 50
==================================================
```

## Important Notes

### Account Matching (Critical)

- 🔴 **Your TikTok account MUST be the same for scraping AND cookie export**
- Videos must be scraped from your own account
- Cookies must be from the same account that owns those videos
- You cannot use this to change privacy on other users' videos
- If accounts don't match, the script will fail with permission errors

### Security

- Never share your `cookies.json` file
- Cookies contain your complete session authentication data
- Keep your TikTok account secure and don't reuse passwords
- Delete `cookies.json` after use if you're concerned about security

### Usage Guidelines

- This tool is exclusively for managing your own videos
- You have full permission to modify privacy settings on your own videos
- Use responsibly and in accordance with TikTok's Terms of Service
- Don't attempt to modify other users' content

## Troubleshooting

### "Usage: node privater.js <username> [limit]"

- You didn't provide a username
- Example: `node privater.js your_username`

### "cookies.json not found"

- Export cookies from your TikTok account using a browser extension
- Place the file in the project root
- Verify the file is valid JSON format

### Permission/Authentication Errors

- Verify you exported cookies from your current TikTok account
- Delete `cookies.json` and export again from the correct account
- Ensure you're logged into the same account you're scraping from

### Videos not changing to private

- Check that cookies account matches your TikTok account
- Verify cookies are still valid (not expired)
- Ensure TikTok hasn't changed their UI (selectors may need updating)
- Check error screenshots in the project root for debugging
- Try with `FAST_MODE: false` for more reliable execution
- Check that videos are actually yours (from the same account)

### "Permission Denied" or "Can't modify"

- This happens when you try to modify videos that aren't yours
- Verify you're scraping and modifying videos from the same account

### Playwright browser issues

- Reinstall Playwright: `npm install --save-dev playwright`
- Run: `npx playwright install`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created by kodarblack

## Disclaimer

This tool is provided as-is for educational and personal use. Users are responsible for complying with TikTok's Terms of Service and applicable laws. The authors are not liable for misuse or any consequences arising from using this tool.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve the tool.

## Features

- **Batch Processing**: Automate privacy changes for multiple TikTok videos at once
- **Session Management**: Uses stored cookies for authenticated access (no password required)
- **Progress Tracking**: Keeps track of processed videos to avoid re-processing
- **Human-like Behavior**: Configurable delays and random timing to avoid detection
- **Error Logging**: Captures screenshots on failures for debugging

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A TikTok account with cookies exported
- Playwright browsers installed

## Installation

1. Clone or download this repository
2. Install dependencies:
```bash
npm install
```

This will install:
- **playwright**: Browser automation framework
- **axios**: HTTP client library

## Setup Instructions

### Step 1: Export Cookies from Your TikTok Account
Before running the script, export cookies from your TikTok account:

1. Use a browser extension like "EditThisCookie" or "Get cookies.txt"
2. Log into your TikTok account
3. Export your cookies
4. Save as `cookies.json` in the project root

Example `cookies.json` structure (will be provided by your cookie export extension)

### Step 2: Configure Timing (Optional)

Edit `privater.js` to modify the `CONFIG` object if needed:
- `FAST_MODE`: Set to `false` for more human-like delays (default: `true`)
- `delays`: Customize timing between actions for more reliable execution

## Usage

### Quick Start

Run one command with your TikTok username and number of videos to process:

```bash
node privater.js <username> [limit]
```

**Parameters:**
- `<username>` (required): Your TikTok username (without the @ symbol)
- `[limit]` (optional): Maximum number of videos to process (default: 50)

**Examples:**
```bash
# Process 50 videos from your account (default)
node privater.js your_username

# Process 100 videos
node privater.js your_username 100

# Process all available videos
node privater.js your_username 1000
```

**💡 Tip: To private ALL your videos:**
Set the limit to a number higher than your total video count. When the scraper reaches the end of your profile and finds no more videos, it will automatically stop. For example:
```bash
# If you have ~150 videos, set limit to 500+
node privater.js your_username 500

# This ensures all videos are scraped, and the scraper stops naturally when done
```

### What It Does

**Phase 1 - Scraping:**
1. Launches browser and navigates to your TikTok profile
2. Scrolls through posts to collect video/photo URLs
3. Saves URLs to `videos.json`
4. Automatically stops when target reached or no new content loads

**Phase 2 - Privacy Changes:**
1. Loads your authenticated TikTok session from `cookies.json`
2. For each video:
   - Navigates to the TikTok page
   - Opens Privacy Settings
   - Changes setting to "Only You"
   - Saves changes
3. Tracks progress in `progress.json` to skip already-processed videos
4. Displays detailed summary statistics

### Prerequisites Check

Before running, ensure:
- ✅ `cookies.json` exists (from your TikTok account)
- ✅ Playwright browsers are installed

## Configuration Options

The `CONFIG` object in `privater.js` allows fine-tuning:

```javascript
const CONFIG = {
    FAST_MODE: true,                        // Quick execution vs. human-like delays
    delays: {
        navigation: { min: 1, max: 2 },    // Wait after page load (seconds)
        hover: 300,                         // Hover delay (milliseconds)
        modalOpen: { min: 0.5, max: 1 },   // Modal appearance delay (seconds)
        dropdownClick: 800,                 // Dropdown interaction (milliseconds)
        optionSelect: { min: 0.5, max: 1 }, // Option selection delay (seconds)
        verification: 1000,                 // Verification wait (milliseconds)
        betweenVideos: { min: 2, max: 3 }   // Cooldown between videos (seconds)
    }
};
```

## Output

The script generates the following files:
- **progress.json**: Tracks which videos have been processed

## Console Output Example

```
[1/5] 🎬 Processing: https://www.tiktok.com/@user/video/123
   ✓ Selected "Only you"
   ✓ Clicked Done
✅ Privacy setting changed successfully
   ⏳ Waiting 2.5s before next video...

==================================================
📊 Summary:
   ✅ Successfully processed: 4
   ⏭️  Skipped (already done): 0
   ❌ Failed: 1
### Account Matching (Critical)

- 🔴 **T scraper account MUST match your cookies account**
- Videos must be scraped from your account
- Cookies must be from the same account that owns those videos
- You cannot use this to change privacy on other users' videos
- If accounts don't match, the script will fail with permission errors

### Security
- Never share your `cookies.json` file
- Cookies contain your complete session authentication data
- Keep your TikTok account secure and don't reuse passwords
- Delete `cookies.json` after use if you're concerned about security

##Run the scraper script first: `node scraper.js`
- Ensure `videos.json` exists in the project root
- Verify it contains an array of valid TikTok URLs

### "cookies.json not found"
- Export cookies from your TikTok account using a browser extension
- Place the file in the project root
- Verify the file is valid JSON format

### Permission/Authentication Errors
- **CRITICAL**: Verify the scraper account and cookies account are the **same**
- Delete `cookies.json` and export again from the correct account
- Ensure you're logged into the same account used for scraping

### Videos not changing to private
- Check account matching (scraper account = cookies account)
- Verify cookies are still valid (not expired)
- Ensure TikTok hasn't changed their UI (selectors may need updating)
- Check error screenshots in the project root for debugging
- Try with `FAST_MODE: false` for more reliable execution
- Check that videos are actually yours (from the same account)

### "Permission Denied" or "Can't modify"
- This happens when accounts don't match
- Verify you scraped videos with the same account whose cookies you're using
- Videos must belong to your account
## Troubleshooting

### "videos.json not found"
- Ensure `videos.json` exists in the project root
- Verify it contains an array of valid TikTok URLs

### "cookies.json not found" 
- Export your cookies using a browser extension
- Place the file in the project root

### Videos not changing to private
- Verify you're logged into the correct account (check cookies)
- Ensure TikTok hasn't changed their UI (selectors may need updating)
- Check error screenshots in the project root
- Try with `FAST_MODE: false` for more reliable execution

### Playwright browser issues
- Reinstall Playwright: `npm install --save-dev playwright`
- Run: `npx playwright install`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created by kodarblack

## Disclaimer

This tool is provided as-is for educational and personal use. Users are responsible for complying with TikTok's Terms of Service and applicable laws. The authors are not liable for misuse or any consequences arising from using this tool.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve the tool.
