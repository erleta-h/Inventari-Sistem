# Kapitulli — Continuous Integration (GitHub Actions)

```bash
cd semester-project/08-ci
npm install
npm run word
```

Dalja: `Kapitulli-8-Continuous-Integration.docx`

## Çfarë të vendosësh në raport (reale)

| Figura | Ku e merr |
|--------|-----------|
| **CI.1** | GitHub → repo → **Actions** → workflow **Inventari CI Tests** → ✓ green |
| **CI.2** | Kliko run → job **api-tests** → log me PASS TC-API-01…06 |
| **CI.3** | **Artifacts** → `ci-api-test-reports` → shkarko → hap `ci-api-report.html` |

Lokalisht (pa GitHub): `npm run test:api` → `test-reports/ci-api-report.html`
