@echo off
title SignalPulse - Stop All Servers
color 0C
echo ===================================================
echo        Stopping All SignalPulse Processes...
echo ===================================================
echo.

echo Searching for processes running on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Terminating process PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo Terminating any active background workers...
taskkill /F /FI "WINDOWTITLE eq SignalPulse*" >nul 2>&1

echo.
echo ===================================================
echo  [SUCCESS] All SignalPulse servers have been stopped!
echo ===================================================
echo.
timeout /t 3 >nul
