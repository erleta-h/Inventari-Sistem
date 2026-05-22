/**
 * API tests — Inventari-Sistem (6 test cases, CI-friendly)
 * npm run test:api
 * Raport: test-reports/ci-api-report.json | .txt | .html
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const REPORT_DIR = path.join(__dirname, 'test-reports');
const results = [];
const startedAt = new Date().toISOString();

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const lib = url.protocol === 'https:' ? https : http;
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = lib.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function record(id, passed, message) {
  console.log(`${passed ? 'PASS' : 'FAIL'} - ${id}: ${message}`);
  results.push({ id, passed, message, status: passed ? 'PASS' : 'FAIL' });
}

function writeReports() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
  const pass = results.filter((x) => x.passed).length;
  const fail = results.length - pass;
  const summary = {
    suite: 'Inventari API Tests (CI)',
    apiUrl: API_URL,
    startedAt,
    finishedAt: new Date().toISOString(),
    total: results.length,
    pass,
    fail,
    passRate: results.length ? Math.round((pass / results.length) * 100) : 0,
    tests: results,
  };

  const jsonPath = path.join(REPORT_DIR, 'ci-api-report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2), 'utf8');

  const lines = [
    '=== INVENTARI API TESTS — RAPORT CI ===',
    `API: ${API_URL}`,
    `Data: ${summary.finishedAt}`,
    '',
    ...results.map((r) => `${r.status} - ${r.id}: ${r.message}`),
    '',
    `Total: ${summary.total} | PASS: ${pass} | FAIL: ${fail} | Pass rate: ${summary.passRate}%`,
  ];
  const txtPath = path.join(REPORT_DIR, 'ci-api-report.txt');
  fs.writeFileSync(txtPath, lines.join('\n'), 'utf8');

  const rows = results
    .map(
      (r) =>
        `<tr><td>${r.id}</td><td class="${r.passed ? 'pass' : 'fail'}">${r.status}</td><td>${r.message}</td></tr>`
    )
    .join('');
  const html = `<!DOCTYPE html>
<html lang="sq"><head><meta charset="utf-8"/><title>CI API Report</title>
<style>body{font-family:Calibri,sans-serif;margin:2rem}table{border-collapse:collapse;width:100%}
th,td{border:1px solid #ccc;padding:8px}th{background:#1F3864;color:#fff}
.pass{color:#166534;font-weight:bold}.fail{color:#b91c1c;font-weight:bold}
.summary{background:#f0f4f8;padding:1rem;border-radius:8px;margin-bottom:1.5rem}</style></head>
<body><h1>Inventari-Sistem — Raport testesh API (CI)</h1>
<div class="summary"><p><strong>API:</strong> ${API_URL}</p>
<p><strong>Total:</strong> ${summary.total} | <strong>PASS:</strong> ${pass} | <strong>FAIL:</strong> ${fail} | <strong>Pass rate:</strong> ${summary.passRate}%</p></div>
<table><thead><tr><th>Test ID</th><th>Status</th><th>Mesazh</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  const htmlPath = path.join(REPORT_DIR, 'ci-api-report.html');
  fs.writeFileSync(htmlPath, html, 'utf8');

  console.log(`\nRaport JSON: ${jsonPath}`);
  console.log(`Raport TXT:  ${txtPath}`);
  console.log(`Raport HTML: ${htmlPath}`);
  return summary;
}

async function run() {
  console.log('\n=== INVENTARI API TESTS ===\n');
  console.log(`API: ${API_URL}\n`);

  // TC-API-01: Health
  try {
    const r = await request('GET', '/health');
    const ok = r.status === 200 && r.body?.status === 'ok';
    record('TC-API-01', ok, ok ? 'Health OK' : `Status ${r.status}`);
  } catch (e) {
    record('TC-API-01', false, e.message);
  }

  // TC-API-02: Login success
  let token = null;
  try {
    const r = await request('POST', '/api/auth/login', {
      email: 'menaxher@inventari.com',
      password: 'menaxher123',
    });
    token = r.body?.data?.token;
    const ok = r.status === 200 && !!token;
    record('TC-API-02', ok, ok ? 'Login + token' : `Status ${r.status}`);
  } catch (e) {
    record('TC-API-02', false, e.message);
  }

  // TC-API-03: Produktet pa token → 401
  try {
    const r = await request('GET', '/api/produktet');
    const ok = r.status === 401;
    record('TC-API-03', ok, ok ? '401 pa token' : `Pritet 401, mori ${r.status}`);
  } catch (e) {
    record('TC-API-03', false, e.message);
  }

  // TC-API-04: Produktet me token → 200
  try {
    if (!token) throw new Error('Mungon token nga login');
    const r = await request('GET', '/api/produktet', null, token);
    const ok = r.status === 200 && r.body?.status === 'success';
    record('TC-API-04', ok, ok ? 'Lista produkteve' : `Status ${r.status}`);
  } catch (e) {
    record('TC-API-04', false, e.message);
  }

  // TC-API-05: Inventar me token
  try {
    if (!token) throw new Error('Mungon token');
    const r = await request('GET', '/api/inventar', null, token);
    const ok = r.status === 200 && r.body?.status === 'success';
    record('TC-API-05', ok, ok ? 'Lista inventarit' : `Status ${r.status}`);
  } catch (e) {
    record('TC-API-05', false, e.message);
  }

  // TC-API-06: Login invalid password
  try {
    const r = await request('POST', '/api/auth/login', {
      email: 'admin@inventari.com',
      password: 'wrong',
    });
    const ok = r.status === 401;
    record('TC-API-06', ok, ok ? '401 fjalëkalim gabim' : `Status ${r.status}`);
  } catch (e) {
    record('TC-API-06', false, e.message);
  }

  const summary = writeReports();
  console.log('\n--- Përmbledhje ---');
  console.log(`Total: ${summary.total} | PASS: ${summary.pass} | FAIL: ${summary.fail} | Pass rate: ${summary.passRate}%`);
  process.exit(summary.fail > 0 ? 1 : 0);
}

run();
