@echo off
cd /d "%~dp0"
echo Starting Scraper API from: %CD%
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo.
echo Server: http://localhost:3000
echo Health: http://localhost:3000/health
echo.
node server.js
