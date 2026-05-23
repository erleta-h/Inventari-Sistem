/**
 * 10 teste UI — Inventari-Sistem (projekt semestral)
 * npm run test:ui
 */
console.log('\n=== INVENTARI-SISTEM — 10 TESTE SELENIUM ===\n');

const http = require('http');
const { Builder, By, until } = require('selenium-webdriver');
const { runTest, writeReports } = require('./selenium-reporter');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const USERS = {
  admin: { email: 'admin@inventari.com', password: 'admin123' },
  menaxher: { email: 'menaxher@inventari.com', password: 'menaxher123' },
  magazinier: { email: 'magazinier@inventari.com', password: 'magazinier123' },
  shites: { email: 'shites@inventari.com', password: 'shites123' },
  shofer: { email: 'shofer@inventari.com', password: 'shofer123' },
};

const results = [];

function checkServer(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => { res.resume(); resolve(true); });
    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => { req.destroy(); resolve(false); });
  });
}

async function clearSession(driver) {
  await driver.get(BASE_URL);
  await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
  await driver.manage().deleteAllCookies();
}

async function loginAs(driver, role) {
  const u = USERS[role];
  await clearSession(driver);
  await driver.get(`${BASE_URL}/login`);
  await driver.wait(until.elementLocated(By.id('email')), 10000);
  await driver.findElement(By.id('email')).sendKeys(u.email);
  await driver.findElement(By.id('password')).sendKeys(u.password);
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.urlContains('/dashboard'), 12000);
}

async function noAuthError(driver) {
  const t = await driver.findElement(By.tagName('body')).getText();
  return !t.includes('Nuk keni autorizim');
}

async function run() {
  if (!(await checkServer(BASE_URL))) {
    console.error('\n❌ Nis backend + frontend!\n');
    process.exit(1);
  }
  console.log(`✓ Aplikacioni përgjigjet në ${BASE_URL}\n`);

  const driver = await new Builder().forBrowser('MicrosoftEdge').build();
  driver.manage().setTimeouts({ implicit: 4000, pageLoad: 30000 });

  try {
    await runTest(results, driver, 'TC-LOGIN-01', async () => {
      await loginAs(driver, 'admin');
      const ok = await driver.findElement(By.xpath("//h1[contains(.,'Dashboard')]"));
      if (!(await ok.isDisplayed())) throw new Error('Dashboard nuk u shfaq');
      return 'Login → dashboard';
    });

    await runTest(results, driver, 'TC-LOGIN-02', async () => {
      await clearSession(driver);
      await driver.get(`${BASE_URL}/login`);
      await driver.wait(until.elementLocated(By.id('email')), 10000);
      await driver.findElement(By.id('email')).sendKeys(USERS.admin.email);
      await driver.findElement(By.id('password')).sendKeys('gabim123');
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        const body = (await driver.findElement(By.tagName('body')).getText()).toLowerCase();
        const hasBox = (await driver.findElements(By.css('.bg-red-50'))).length > 0;
        return url.includes('/login') && (body.includes('pasakt') || hasBox);
      }, 12000);
      return 'Fjalëkalim i gabuar — mesazh gabimi';
    });

    await runTest(results, driver, 'TC-ADMIN-01', async () => {
      await loginAs(driver, 'admin');
      await driver.get(`${BASE_URL}/perdoruesit`);
      await driver.wait(until.urlContains('/perdoruesit'), 8000);
      if (!(await noAuthError(driver))) throw new Error('Autorizim i refuzuar');
      return 'Admin → përdoruesit';
    });

    await runTest(results, driver, 'TC-NAV-01', async () => {
      await loginAs(driver, 'menaxher');
      await driver.get(`${BASE_URL}/produktet`);
      await driver.wait(until.urlContains('/produktet'), 8000);
      if (!(await noAuthError(driver))) throw new Error('Autorizim i refuzuar');
      return 'Menaxher → produktet';
    });

    await runTest(results, driver, 'TC-FORM-01', async () => {
      await loginAs(driver, 'menaxher');
      await driver.get(`${BASE_URL}/produktet/krijo`);
      await driver.wait(until.urlContains('/produktet/krijo'), 8000);
      await driver.findElement(By.css('button[type="submit"]')).click();
      if (!(await driver.getCurrentUrl()).includes('/produktet/krijo')) {
        throw new Error('Forma u dërgua pa validim');
      }
      return 'Formular bosh — validim';
    });

    await runTest(results, driver, 'TC-INV-01', async () => {
      await loginAs(driver, 'magazinier');
      await driver.get(`${BASE_URL}/inventar`);
      await driver.wait(until.urlContains('/inventar'), 8000);
      if (!(await noAuthError(driver))) throw new Error('Autorizim i refuzuar');
      return 'Magazinier → inventar';
    });

    await runTest(results, driver, 'TC-ORD-01', async () => {
      await loginAs(driver, 'shites');
      await driver.get(`${BASE_URL}/porosite`);
      await driver.wait(until.urlContains('/porosite'), 8000);
      if (!(await noAuthError(driver))) throw new Error('Autorizim i refuzuar');
      return 'Shitës → porositë';
    });

    await runTest(results, driver, 'TC-RBAC-01', async () => {
      await loginAs(driver, 'admin');
      await driver.get(`${BASE_URL}/produktet/krijo`);
      await driver.sleep(1500);
      if (await noAuthError(driver)) throw new Error('Admin ka akses (gabim)');
      return 'Admin pa akses krijo produkt (pritet)';
    });

    await runTest(results, driver, 'TC-SHO-01', async () => {
      await loginAs(driver, 'shofer');
      await driver.get(`${BASE_URL}/dergesat/shofer`);
      await driver.sleep(2000);
      const url = await driver.getCurrentUrl();
      if (!url.includes('dergesa') && !(await noAuthError(driver))) {
        throw new Error('Shofer nuk arriti faqen e dërgesave');
      }
      return 'Shofer → dërgesat';
    });

    await runTest(results, driver, 'TC-RPT-01', async () => {
      await loginAs(driver, 'admin');
      await driver.get(`${BASE_URL}/raportet`);
      await driver.wait(until.urlContains('/raportet'), 8000);
      if (!(await noAuthError(driver))) throw new Error('Autorizim i refuzuar');
      return 'Admin → raportet';
    });
  } finally {
    await driver.quit();
    const summary = writeReports(results, '10-test-suite');
    process.exit(summary.failed > 0 ? 1 : 0);
  }
}

run();
