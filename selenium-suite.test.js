/**
 * Suite e plotë UI — Inventari-Sistem (12 test case)
 * npm run test:ui:suite
 */
const http = require('http');
const { Builder, By, until } = require('selenium-webdriver');
const { runTest, writeReports } = require('./selenium-reporter');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const USERS = {
  admin: { email: 'admin@inventari.com', password: 'admin123' },
  menaxher: { email: 'menaxher@inventari.com', password: 'menaxher123' },
  magazinier: { email: 'magazinier@inventari.com', password: 'magazinier123' },
  shites: { email: 'shites@inventari.com', password: 'shites123' },
};

async function checkServer(url) {
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

async function bodyHasNoAuthError(driver) {
  const t = await driver.findElement(By.tagName('body')).getText();
  return !t.includes('Nuk keni autorizim');
}

async function runSuite() {
  const results = [];
  if (!(await checkServer(BASE_URL))) {
    console.error('\n❌ Nis frontend + backend para testeve!\n');
    process.exit(1);
  }
  console.log(`✓ Aplikacioni përgjigjet në ${BASE_URL}\n`);

  const driver = await new Builder().forBrowser('MicrosoftEdge').build();
  driver.manage().setTimeouts({ implicit: 4000, pageLoad: 30000 });

  try {
    await runTest(results, driver, 'TC-LOGIN-01', async () => {
      await loginAs(driver, 'admin');
      const h1 = await driver.findElement(By.xpath("//h1[contains(.,'Dashboard')]"));
      if (!(await h1.isDisplayed())) throw new Error('Dashboard mungon');
      return 'Login admin → dashboard';
    });

    await runTest(results, driver, 'TC-LOGIN-02', async () => {
      await clearSession(driver);
      await driver.get(`${BASE_URL}/login`);
      await driver.findElement(By.id('email')).sendKeys(USERS.admin.email);
      await driver.findElement(By.id('password')).sendKeys('gabim123');
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.sleep(2000);
      const txt = await driver.findElement(By.tagName('body')).getText();
      const ok = (await driver.getCurrentUrl()).includes('/login') &&
        (txt.toLowerCase().includes('pasakt') || (await driver.findElements(By.css('.bg-red-50'))).length > 0);
      if (!ok) throw new Error('Mesazh gabimi mungon');
      return 'Fjalëkalim i gabuar';
    });

    await runTest(results, driver, 'TC-ADMIN-01', async () => {
      await loginAs(driver, 'admin');
      await driver.get(`${BASE_URL}/perdoruesit`);
      await driver.wait(until.urlContains('/perdoruesit'), 8000);
      if (!(await bodyHasNoAuthError(driver))) throw new Error('Refuzuar');
      return 'Admin → përdoruesit';
    });

    await runTest(results, driver, 'TC-ADMIN-02', async () => {
      await loginAs(driver, 'admin');
      await driver.get(`${BASE_URL}/raportet`);
      await driver.wait(until.urlContains('/raportet'), 8000);
      if (!(await bodyHasNoAuthError(driver))) throw new Error('Refuzuar');
      return 'Admin → raportet';
    });

    await runTest(results, driver, 'TC-NAV-01', async () => {
      await loginAs(driver, 'menaxher');
      await driver.get(`${BASE_URL}/produktet`);
      await driver.wait(until.urlContains('/produktet'), 8000);
      if (!(await bodyHasNoAuthError(driver))) throw new Error('Refuzuar');
      return 'Menaxher → produktet';
    });

    await runTest(results, driver, 'TC-NAV-02', async () => {
      await loginAs(driver, 'menaxher');
      await driver.get(`${BASE_URL}/klientet`);
      await driver.wait(until.urlContains('/klientet'), 8000);
      if (!(await bodyHasNoAuthError(driver))) throw new Error('Refuzuar');
      return 'Menaxher → klientët';
    });

    await runTest(results, driver, 'TC-NAV-03', async () => {
      await loginAs(driver, 'menaxher');
      await driver.get(`${BASE_URL}/depot`);
      await driver.wait(until.urlContains('/depot'), 8000);
      if (!(await bodyHasNoAuthError(driver))) throw new Error('Refuzuar');
      return 'Menaxher → depot';
    });

    await runTest(results, driver, 'TC-FORM-01', async () => {
      await loginAs(driver, 'menaxher');
      await driver.get(`${BASE_URL}/produktet/krijo`);
      await driver.wait(until.urlContains('/produktet/krijo'), 8000);
      await driver.findElement(By.css('button[type="submit"]')).click();
      if (!(await driver.getCurrentUrl()).includes('/produktet/krijo')) throw new Error('Validim dështoi');
      return 'Formular produkt bosh';
    });

    await runTest(results, driver, 'TC-NAV-04', async () => {
      await loginAs(driver, 'menaxher');
      await driver.get(`${BASE_URL}/furnizime`);
      await driver.wait(until.urlContains('/furnizime'), 8000);
      if (!(await bodyHasNoAuthError(driver))) throw new Error('Refuzuar');
      return 'Menaxher → furnizime';
    });

    await runTest(results, driver, 'TC-INV-01', async () => {
      await loginAs(driver, 'magazinier');
      await driver.get(`${BASE_URL}/inventar`);
      await driver.wait(until.urlContains('/inventar'), 8000);
      if (!(await bodyHasNoAuthError(driver))) throw new Error('Refuzuar');
      return 'Magazinier → inventar';
    });

    await runTest(results, driver, 'TC-ORD-01', async () => {
      await loginAs(driver, 'shites');
      await driver.get(`${BASE_URL}/porosite`);
      await driver.wait(until.urlContains('/porosite'), 8000);
      if (!(await bodyHasNoAuthError(driver))) throw new Error('Refuzuar');
      return 'Shitës → porositë';
    });

    await runTest(results, driver, 'TC-RBAC-01', async () => {
      await loginAs(driver, 'admin');
      await driver.get(`${BASE_URL}/produktet/krijo`);
      await driver.sleep(1500);
      if (await bodyHasNoAuthError(driver)) throw new Error('Admin ka akses');
      return 'Admin pa akses krijo produkt';
    });
  } finally {
    await driver.quit();
    const summary = writeReports(results, '12-test-suite');
    process.exit(summary.failed > 0 ? 1 : 0);
  }
}

runSuite();
