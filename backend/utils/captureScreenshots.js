/**
 * Automated Screenshot Capture Utility
 * Uses native installed Google Chrome via puppeteer-core to capture authentic screenshots
 * of all functional states required for the academic project report.
 */

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.join(__dirname, '../../screenshots');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const captureAll = async () => {
  console.log('[Screenshots] Launching Google Chrome headless via puppeteer-core...');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1280, height: 850, deviceScaleFactor: 2 },
  });

  try {
    const page = await browser.newPage();

    // 1. Dashboard & Catalog
    console.log('[1/8] Capturing Screenshot 1: Movie Dashboard...');
    await page.goto('http://localhost:5001/index.html', { waitUntil: 'networkidle2' });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screenshot_1_dashboard.png') });

    // 2. User Login Page with Demo Quick-Fill
    console.log('[2/8] Capturing Screenshot 2: User Login Page...');
    await page.goto('http://localhost:5001/login.html', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      if (typeof fillDemo === 'function') fillDemo('aaroh@example.com');
    });
    await sleep(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screenshot_2_login.png') });

    // Perform Login
    console.log('      Performing User A login...');
    await page.click('button[type="submit"]');
    await sleep(1000);

    // 3. User Registration Page
    console.log('[3/8] Capturing Screenshot 3: User Registration Page...');
    const pageReg = await browser.newPage();
    await pageReg.goto('http://localhost:5001/register.html', { waitUntil: 'networkidle2' });
    await pageReg.type('#reg-name', 'Rohan Verma');
    await pageReg.type('#reg-email', 'rohan.verma@itm.edu');
    await pageReg.type('#reg-password', 'password123');
    await sleep(400);
    await pageReg.screenshot({ path: path.join(SCREENSHOT_DIR, 'screenshot_3_register.png') });
    await pageReg.close();

    // 4. Add Movie Page
    console.log('[4/8] Capturing Screenshot 8: Add New Movie Page...');
    await page.goto('http://localhost:5001/add-movie.html', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      if (typeof populateSampleData === 'function') populateSampleData();
    });
    await sleep(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screenshot_8_add_movie.png') });

    // 5. Movie Details Page (Dynamic Average Rating Aggregation)
    console.log('[5/8] Capturing Screenshot 4: Movie Details with Aggregation...');
    // Fetch first movie ID from backend API
    const moviesRes = await fetch('http://localhost:5001/api/movies');
    const moviesData = await moviesRes.json();
    const targetMovieId = moviesData.data[0]._id;

    await page.goto(`http://localhost:5001/movie-details.html?id=${targetMovieId}`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screenshot_4_movie_details.png') });

    // 6. Review Form Section
    console.log('[6/8] Capturing Screenshot 5: Review Submission Form...');
    await page.evaluate(() => {
      const el = document.getElementById('review-form-card');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await sleep(400);
    await page.type('#review-text-input', 'A transcendent cinematic voyage. Christopher Nolan orchestrates visual and emotional brilliance with unflinching precision.');
    await sleep(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screenshot_5_review_form.png') });

    // Submit the review
    console.log('      Submitting review...');
    await page.click('#new-review-form button[type="submit"]');
    await sleep(1200);

    // 7. Review List with Ownership Actions (Edit & Delete buttons visible for Author)
    console.log('[7/8] Capturing Screenshot 6: Review List with Owner Actions...');
    await page.evaluate(() => {
      const el = document.getElementById('reviews-list-container');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await sleep(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screenshot_6_review_owner_actions.png') });

    // 8. Edit Review Modal
    console.log('[8/8] Capturing Screenshot 7: Edit Review Modal...');
    // Click the first edit button
    const editBtn = await page.$('.review-actions button');
    if (editBtn) {
      await editBtn.click();
      await sleep(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screenshot_7_edit_modal.png') });
    }

    console.log('[Screenshots] ✓ All 8 web application screenshots captured successfully!');
  } catch (err) {
    console.error('[Screenshots Error]:', err);
  } finally {
    await browser.close();
  }
};

captureAll();
