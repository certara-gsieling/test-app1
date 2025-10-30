# Project Documentation

This folder contains two tracks of project documentation:

- formal: Requirements, test scripts, and a requirements–tests traceability matrix
- engineering: Onboarding, architecture, surprises, and DevOps docs

## Layout

- formal/requirements.md — numbered requirements (R-###)
- formal/test-scripts.md — stepwise plain-text tests (T-###)
- formal/traceability-matrix.md — links R-### ↔ T-###
- engineering/onboarding.md — environment setup and common commands
- engineering/architecture.md — components, data flow, ports, logging
- engineering/surprises.md — gotchas and notes
- engineering/devops.md — build/run, logging policy, CI ideas

## Conventions

- Requirements IDs: R-###
- Test IDs: T-###
- Update the traceability matrix when adding/changing requirements or tests.

## End-to-end tests (Playwright + Allure)

- Install browsers (first run):
  - `npx playwright install --with-deps`
- Run Playwright tests:
  - `npm run test:pw`
- Open Playwright HTML report (after a run):
  - `npm run report`
- Generate Allure report (HTML) from results:
  - `npm run allure:generate`
- Open Allure report locally:
  - `npm run allure:open`

Configuration:
- Base URL is configurable via environment variables (checked in order):
  - `PLAYWRIGHT_BASE_URL`
  - `BASE_URL`
  - defaults to `http://localhost:11000`
  Example: `PLAYWRIGHT_BASE_URL=https://staging.example.com npm run test:pw`

Outputs:
- Playwright HTML: `playwright-report/`
- Allure results: `test-reports/allure-results/` → HTML: `test-reports/allure-report/`