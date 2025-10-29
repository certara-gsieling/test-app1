# DevOps

## Build & Run
- Backend: sbt "~run 11000"
- Frontend prod bundle: npm run build → public/app/app.js
- Frontend dev server: npm run dev → http://localhost:5173

## Testing
- Unit/UI: npm test (Jest + Testing Library)
- Screenshots: npm run screenshot; watcher: npm run watch:screenshots

## Logging Policy
- logs/application.log
- Overwrites on each run (no rolling)

## Ports
- 11000 (Play), 5173 (Vite)

## CI Notes (future)
- Cache ~/.ivy2, ~/.sbt, ~/.cache/Coursier
- Cache ~/.npm
- Jobs: sbt compile/test, npm ci && npm test && npm run build, optional playwright screenshots
