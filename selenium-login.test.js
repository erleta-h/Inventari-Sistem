/**
 * Teste UI me Selenium WebDriver për Inventari-Sistem.
 * Para ekzekutimit: nis backend (port 3000), frontend (port 5173), seed DB.
 */
const http = require('http');
const { Builder, By, until } = require('selenium-webdriver');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

function checkServer(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function assertAppRunning() {
  const ok = await checkServer(BASE_URL);
  if (ok) return;

  console.error('\n❌ Aplikacioni NUK është i ndezur!');
  console.error(`   Selenium provoi: ${BASE_URL}`);
  console.error('   Gabimi: ERR_CONNECTION_REFUSED\n');
  console.error('Hapat (3 terminale të ndara):\n');
  console.error('  1) cd backend  →  npm run dev');
  console.error('  2) cd frontend →  npm run dev');
  console.error('  3) Hap shfletuesin: http://localhost:5173/login');
  console.error('     (nëse porti është 5174, përdor: set BASE_URL=http://localhost:5174)\n');
  console.error('  4) Kur faqja e login hapet, atëherë: npm run test:ui\n');
  process.exit(1);
}
const ADMIN_EMAIL = process.env.TEST_EMAIL || 'admin@inventari.com';
const ADMIN_PASSWORD = process.env.TEST_PASSWORD || 'admin123';
/** Për modulet e produkteve (admin NUK ka rol MENAXHER/MAGAZINIER) */
const MENAXHER_EMAIL = process.env.MENAXHER_EMAIL || 'menaxher@inventari.com';
const MENAXHER_PASSWORD = process.env.MENAXHER_PASSWORD || 'menaxher123';

const results = { pass: 0, fail: 0 };

function logResult(id, passed, message) {
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`${status} - ${id}: ${message}`);
  if (passed) results.pass += 1;
  else results.fail += 1;
}

/** Auth ruhet në localStorage (jo cookies) — duhet pastruar para çdo login të ri */
async function clearSession(driver) {
  await driver.get(BASE_URL);
  await driver.executeScript(
    'window.localStorage.clear(); window.sessionStorage.clear();'
  );
  await driver.manage().deleteAllCookies();
}

async function openLoginPage(driver) {
  await clearSession(driver);
  await driver.get(`${BASE_URL}/login`);
  await driver.wait(until.elementLocated(By.id('email')), 10000);
}

async function login(driver, email, password) {
  await openLoginPage(driver);
  await driver.findElement(By.id('email')).clear();
  await driver.findElement(By.id('email')).sendKeys(email);
  await driver.findElement(By.id('password')).clear();
  await driver.findElement(By.id('password')).sendKeys(password);
  await driver.findElement(By.css('button[type="submit"]')).click();
}

async function runTests() {
  await assertAppRunning();
  console.log(`✓ Aplikacioni përgjigjet në ${BASE_URL}\n`);

  const driver = await new Builder().forBrowser('MicrosoftEdge').build();
  driver.manage().setTimeouts({ implicit: 5000, pageLoad: 30000 });

  try {
    // TC-LOGIN-01: Hyrje me kredenciale të vlefshme
    try {
      await login(driver, ADMIN_EMAIL, ADMIN_PASSWORD);
      await driver.wait(until.urlContains('/dashboard'), 10000);
      const heading = await driver.findElement(By.xpath("//h1[contains(.,'Dashboard')]"));
      logResult(
        'TC-LOGIN-01',
        await heading.isDisplayed(),
        'Ridrejtim në dashboard pas login-it të suksesshëm'
      );
    } catch (err) {
      logResult('TC-LOGIN-01', false, err.message);
    }

    // TC-LOGIN-02: Fjalëkalim i gabuar
    try {
      await openLoginPage(driver);
      await driver.findElement(By.id('email')).sendKeys(ADMIN_EMAIL);
      await driver.findElement(By.id('password')).sendKeys('gabim-fjalekalimi');
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return url.includes('/login');
      }, 10000);
      const pageText = await driver.findElement(By.tagName('body')).getText();
      const hasError =
        pageText.toLowerCase().includes('pasakt') ||
        pageText.toLowerCase().includes('gabim') ||
        (await driver.findElements(By.css('.bg-red-50'))).length > 0;
      logResult(
        'TC-LOGIN-02',
        hasError,
        hasError ? 'Mesazh gabimi pas fjalëkalimit të pasaktë' : 'Nuk u shfaq mesazh gabimi'
      );
    } catch (err) {
      logResult('TC-LOGIN-02', false, err.message);
    }

    // TC-NAV-01: Navigim në produkte (rol MENAXHER — admin nuk ka akses)
    try {
      await login(driver, MENAXHER_EMAIL, MENAXHER_PASSWORD);
      await driver.wait(until.urlContains('/dashboard'), 10000);
      await driver.get(`${BASE_URL}/produktet`);
      await driver.wait(until.urlContains('/produktet'), 8000);
      const bodyText = await driver.findElement(By.tagName('body')).getText();
      const hasAccess = !bodyText.includes('Nuk keni autorizim');
      logResult(
        'TC-NAV-01',
        hasAccess,
        hasAccess ? 'Listë produktesh e arritshme' : 'Mungon autorizimi për /produktet'
      );
    } catch (err) {
      logResult('TC-NAV-01', false, err.message);
    }

    // TC-FORM-04: Validim fushash bosh në formularin e produktit
    try {
      await driver.get(`${BASE_URL}/produktet/krijo`);
      await driver.wait(until.urlContains('/produktet/krijo'), 8000);
      const bodyText = await driver.findElement(By.tagName('body')).getText();
      if (bodyText.includes('Nuk keni autorizim')) {
        logResult('TC-FORM-04', false, 'Përdoruesi nuk ka rol për këtë formular');
      } else {
        await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 8000);
        await driver.findElement(By.css('button[type="submit"]')).click();
        const stillOnForm = (await driver.getCurrentUrl()).includes('/produktet/krijo');
        logResult(
          'TC-FORM-04',
          stillOnForm,
          'Formulari nuk u dërgua pa fushat e detyrueshme (validim aktiv)'
        );
      }
    } catch (err) {
      logResult('TC-FORM-04', false, err.message);
    }
  } catch (err) {
    console.error('FAIL - Gabim i papritur:', err.message);
  } finally {
    await driver.quit();
    const total = results.pass + results.fail;
    console.log('\n--- Përmbledhje ---');
    console.log(`Total: ${total} | PASS: ${results.pass} | FAIL: ${results.fail}`);
    console.log(`Pass rate: ${total ? Math.round((results.pass / total) * 100) : 0}%`);
  }
}

runTests();
