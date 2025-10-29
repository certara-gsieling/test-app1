# Surprises and Gotchas

- Vite publicDir warning: outDir is a subfolder of public, so Vite warns. Intentional since Play serves from public/. Safe to ignore.
- sbt server lock error on Windows: "Could not create lock for \\.\pipe\sbt-server-... error 5" — transient; server still starts.
- Git CRLF notice: Git may convert LF/CRLF on Windows; safe, configured by core.autocrlf.
- sbt global logs: target/global-logging is sbt’s own logging, separate from Play’s logs/application.log.
