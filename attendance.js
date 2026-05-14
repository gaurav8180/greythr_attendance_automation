const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TZ = 'Asia/Kolkata';
const LOGIN_URL = 'https://branchinternational.greythr.com/';

function todayIST() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function weekdayIST() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'short',
  }).format(new Date());
}

function loadHolidays() {
  const file = path.join(__dirname, 'holidays.txt');
  return new Set(
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .map((line) => line.split('#')[0].trim())
      .filter(Boolean),
  );
}

async function signIn(page, empId, password) {
  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });

  await page.getByPlaceholder('Employee No').fill(empId);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: /^Login$/i }).click();

  await page.waitForLoadState('networkidle');

  const signInBtn = page.getByRole('button', { name: /^Sign In$/i }).first();
  const signOutBtn = page.getByRole('button', { name: /^Sign Out$/i }).first();

  await Promise.race([
    signInBtn.waitFor({ state: 'visible', timeout: 20_000 }),
    signOutBtn.waitFor({ state: 'visible', timeout: 20_000 }),
  ]);

  if (await signOutBtn.isVisible().catch(() => false)) {
    return 'already-signed-in';
  }

  await signInBtn.click();
  await signOutBtn.waitFor({ state: 'visible', timeout: 15_000 });
  return 'signed-in';
}

async function main() {
  const date = todayIST();
  const dow = weekdayIST();
  console.log(`Today (IST): ${date} (${dow})`);

  if (dow === 'Sat' || dow === 'Sun') {
    console.log('Weekend — skipping.');
    return;
  }

  if (loadHolidays().has(date)) {
    console.log('Public holiday — skipping.');
    return;
  }

  const empId = process.env.GREYTHR_EMP_ID;
  const password = process.env.GREYTHR_PASSWORD;
  if (!empId || !password) {
    throw new Error('Missing GREYTHR_EMP_ID or GREYTHR_PASSWORD env var.');
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    const result = await signIn(page, empId, password);
    console.log(`Result: ${result}`);
    await page.screenshot({ path: 'result.png' }).catch(() => {});
  } catch (err) {
    await page.screenshot({ path: 'error.png', fullPage: true }).catch(() => {});
    throw err;
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
