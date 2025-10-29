# Architecture

## Overview
- Backend: Play Framework 3 (Java), APIs only
- Frontend: React + Vite (JS), Redux Toolkit; production bundle served by Play

## Ports
- Play dev server: 11000
- Vite dev server: 5173

## Assets
- Production bundle output: public/app/app.js
- Play view loads script via @routes.Assets.versioned("app/app.js")

## Dev vs Prod
- Dev: Vite serves assets on 5173 with proxy to Play for /health and /api
- Prod/dev via Play: Built bundle is served by Play from public/app/app.js

## Logging
- Logback writes logs/application.log, append disabled (overwrites each run)

## Notable Components
- app/controllers/HealthController.java — GET /health
- app/views/index.scala.html — root div and script tag

## Data Flow
Browser → index.scala.html → loads app.js → React mounts to #root → Redux store manages state → API calls (future) via /api proxied to Play.
