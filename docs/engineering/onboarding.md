# Onboarding

## Prerequisites
- Java 21 (e.g., Amazon Corretto 21)
- sbt (1.11.x)
- Node 22 (use `.nvmrc`)

## Setup
1. nvm use
2. npm install
3. sbt "~run 11000"  # Play on port 11000
4. In another shell: npm run dev  # Vite on 5173
5. Optional: npm run watch:screenshots  # auto screenshots

## Useful Commands
- curl http://localhost:11000/health
- npm test
- npm run build
- npm run preview

## Logs
- App logs: logs/application.log (overwrites each run)
