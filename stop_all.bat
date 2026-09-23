@echo off
title BuzzScout - Stop All Servers
color 0C
echo ===================================================
echo        Stopping All BuzzScout Processes...
echo ===================================================
echo.

echo Searching for processes running on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Terminating process PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo Terminating any active background workers...
taskkill /F /FI "WINDOWTITLE eq BuzzScout*" >nul 2>&1

echo.
echo ===================================================
echo  [SUCCESS] All BuzzScout servers have been stopped!
echo ===================================================
echo.
timeout /t 3 >nul
