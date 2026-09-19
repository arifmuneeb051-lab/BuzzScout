@echo off
title SignalPulse - Start All Servers
color 0B
echo ===================================================
echo        Starting SignalPulse Platform...
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Verifying Database Client...
call npx prisma generate >nul 2>&1

echo [2/3] Starting SignalPulse Production Server on port 3000...
start "SignalPulse Server" /min cmd /c "npm start"

echo [3/3] Starting Background Radar Worker...
start "SignalPulse Worker" /min cmd /c "npm run worker"

echo.
echo Waiting for server initialization...
timeout /t 3 /nobreak >nul

echo.
echo ===================================================
echo  [SUCCESS] SignalPulse is LIVE!
echo  Opening browser at: http://localhost:3000
echo  Admin Portal at:     http://localhost:3000/admin
echo ===================================================
start http://localhost:3000

echo.
echo Press any key to close this launcher window (servers remain running).
pause >nul
