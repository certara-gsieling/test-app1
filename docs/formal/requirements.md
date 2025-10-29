# Formal Requirements

Each requirement has an ID R-###.

- R-001: Health endpoint
  - The API exposes GET /health that returns 200 and JSON {"status":"ok"}.
  - Priority: Must

- R-002: Single application log file (overwrite on run)
  - The app writes to logs/application.log and overwrites (no rolling) on each run.
  - Priority: Must

- R-003: React Hello World page
  - The main page renders a React app that shows a Hello World heading and a counter.
  - In production, JavaScript loads from /assets/app/app.js.
  - Priority: Should
