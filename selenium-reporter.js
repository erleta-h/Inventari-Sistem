/**
 * Raportim i përbashkët për testet Selenium — Inventari-Sistem
 */
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(__dirname, 'test-reports');

function ensureReportDir() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
}

async function captureScreenshot(driver, testId) {
  ensureReportDir();
  const safeId = testId.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filePath = path.join(REPORT_DIR, `${safeId}-fail.png`);
  try {
    const image = await driver.takeScreenshot();
    fs.writeFileSync(filePath, image, 'base64');
    return filePath;
  } catch {
    return null;
  }
}

function logResult(results, id, passed, message, screenshot = null) {
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`${status} - ${id}: ${message}`);
  results.push({
    id,
    passed,
    message,
    status,
    timestamp: new Date().toISOString(),
    screenshot: screenshot || undefined,
  });
}

async function runTest(results, driver, id, fn) {
  try {
    const message = await fn();
    logResult(results, id, true, message || 'OK');
  } catch (e) {
    const screenshot = driver ? await captureScreenshot(driver, id) : null;
    logResult(results, id, false, e.message || String(e), screenshot);
  }
}

function writeReports(results, suiteName) {
  ensureReportDir();
  const pass = results.filter((r) => r.passed).length;
  const fail = results.length - pass;
  const summary = {
    suite: suiteName,
    generatedAt: new Date().toISOString(),
    total: results.length,
    passed: pass,
    failed: fail,
    passRate: results.length ? Math.round((pass / results.length) * 100) : 0,
    results,
  };

  const jsonPath = path.join(REPORT_DIR, 'selenium-report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));

  const rows = results
    .map(
      (r) =>
        `<tr class="${r.passed ? 'pass' : 'fail'}"><td>${r.id}</td><td>${r.status}</td><td>${escapeHtml(r.message)}</td><td>${r.screenshot ? `<a href="${path.basename(r.screenshot)}">screenshot</a>` : '-'}</td></tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="sq"><head><meta charset="UTF-8"/><title>Selenium Report — ${suiteName}</title>
<style>body{font-family:Segoe UI,sans-serif;margin:2rem}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px}th{background:#1e3a5f;color:#fff}.pass{background:#e8f5e9}.fail{background:#ffebee}h1{color:#1e3a5f}</style></head>
<body><h1>Inventari-Sistem — ${suiteName}</h1>
<p><strong>Data:</strong> ${summary.generatedAt}</p>
<p><strong>Total:</strong> ${summary.total} | <strong>PASS:</strong> ${summary.passed} | <strong>FAIL:</strong> ${summary.failed} | <strong>Pass rate:</strong> ${summary.passRate}%</p>
<table><thead><tr><th>Test ID</th><th>Status</th><th>Message</th><th>Screenshot</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;

  const htmlPath = path.join(REPORT_DIR, 'selenium-report.html');
  fs.writeFileSync(htmlPath, html);

  console.log('\n--- Përmbledhje ---');
  console.log(`Total: ${summary.total} | PASS: ${summary.passed} | FAIL: ${summary.failed}`);
  console.log(`Pass rate: ${summary.passRate}%`);
  console.log(`Raport JSON: ${jsonPath}`);
  console.log(`Raport HTML: ${htmlPath}`);

  return summary;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  REPORT_DIR,
  logResult,
  runTest,
  captureScreenshot,
  writeReports,
};
