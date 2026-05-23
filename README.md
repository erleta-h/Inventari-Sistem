# Inventari-Sistem

Sistem për menaxhimin e inventarit dhe distribucionit të produkteve sanitare.

## Stack

- **Frontend:** React, Vite, Tailwind (`frontend/`)
- **Backend:** Express, Sequelize, MySQL (`backend/`)

## Nisja e shpejtë

```bash
# Backend
cd backend
cp env.example .env   # përshtatni DB
npm install
npm run seed
npm run dev

# Frontend (terminal i ri)
cd frontend
npm install
npm run dev
```

Aplikacioni: http://localhost:5173 — API: http://localhost:3000

## Kredencialet e testit

| Rol | Email | Fjalëkalim |
|-----|-------|------------|
| Admin | admin@inventari.com | admin123 |
| Menaxher | menaxher@inventari.com | menaxher123 |

(Më shumë në `backend/src/config/seed.ts`)

## Testet

```bash
npm install          # root — Selenium
npm run test:api     # API tests
npm run test:ui      # 10 Selenium UI tests
```

## Projekt semestral (Testimi i Softuerit)

Dokumentacioni i plotë: **[semester-project/](semester-project/)**

- Modelimi, Test Strategy/Plan, 45 manual TC, Postman, JMeter, 12 bugs, ISO 25010, raport final
