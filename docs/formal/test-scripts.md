# Test Scripts

Test scripts are plain text with IDs T-###.

## T-001: Health endpoint returns 200 JSON
- Pre: Play app running on http://localhost:11000
- Steps:
  1. curl -sS -D - http://localhost:11000/health -o /dev/null
  2. Observe HTTP/1.1 200 OK
  3. curl -s http://localhost:11000/health | jq
  4. Expected: {"status":"ok"}

## T-002: Application log file overwrites on run
- Pre: Stop any running server
- Steps:
  1. Delete logs/application.log if present
  2. Start: sbt "~run 11000" (or run 11000)
  3. Confirm logs/application.log is created and has content
  4. Stop server and edit file to add marker line XYZ
  5. Start server again
  6. Expected: logs/application.log exists and does NOT contain XYZ (file overwritten)

## T-003: React Hello World renders and increments
- Pre: Frontend built (npm run build) and server running on 11000
- Steps:
  1. Open http://localhost:11000/
  2. Expected: Page shows heading "Hello World" and "Counter: 0"
  3. Click Increment
  4. Expected: Counter updates to 1
