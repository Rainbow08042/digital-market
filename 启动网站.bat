@echo off
setlocal
title Digital Market

pushd "%~dp0"
if errorlevel 1 (
    echo [ERROR] Could not open the project folder.
    pause
    exit /b 1
)

where node.exe >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is missing. Install Node.js LTS, then run this script again.
    goto :failed
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm is missing. Reinstall Node.js LTS, then run this script again.
    goto :failed
)

if not exist "node_modules\.bin\vite.cmd" (
    echo Installing project dependencies...
    call npm.cmd ci
    if errorlevel 1 goto :failed
)

echo Starting Digital Market and opening your browser...
echo Keep this window open. Press Ctrl+C to stop the website.
echo The website address will appear below.
call npm.cmd run dev -- --open
if errorlevel 1 goto :failed

popd
exit /b 0

:failed
echo [ERROR] Startup failed. See the message above for details.
popd
pause
exit /b 1
