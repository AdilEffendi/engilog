@echo off
setlocal EnableDelayedExpansion
title EngiLog System (Background)
color 0B

:: ==========================================
::              ASCII ART HEADER
:: ==========================================
cls
echo.
echo  =================================================================================
echo   EngiLog INVISIBLE LAUNCHER - SILENT MODE
echo  =================================================================================
echo   This window will close in a few seconds...
echo.

:: ==========================================
:: 1. KILL EXISTING PROCESSES (Cleanup)
:: ==========================================
echo  [1/7] Cleaning previous sessions...

:: Kill process on Port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

:: Kill process on Port 5000 (Backend/Other)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

:: General Cleanup
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM cloudflared.exe >nul 2>&1
taskkill /F /IM mysqld.exe >nul 2>&1
timeout /t 3 /nobreak >nul

:: ==========================================
:: 2. MYSQL REPAIR (ARIA_LOG)
:: ==========================================
echo  [2/7] Checking Database Health...
if exist "C:\xampp\mysql\data\aria_log.*" (
    del /F /Q "C:\xampp\mysql\data\aria_log.*" >nul 2>&1
)

:: ==========================================
:: 3. START MYSQL (Hidden)
:: ==========================================
echo  [3/7] Starting Database (Hidden)...
if exist "C:\xampp\mysql\bin\mysqld.exe" (
    wscript launcher.vbs "C:\xampp\mysql\bin\mysqld.exe"
    timeout /t 3 /nobreak >nul
) else (
    msg * "ERROR: MySQL executable not found!"
    exit
)

:: ==========================================
:: 4. START BACKEND (Hidden)
:: ==========================================
echo  [4/7] Launching Backend (Hidden)...
if exist "backend" (
    wscript launcher.vbs "cmd /c cd backend && node server.js"
)

:: ==========================================
:: 5. START FRONTEND (Hidden)
:: ==========================================
echo  [5/7] Launching Frontend (Hidden)...
if exist "frontend" (
    wscript launcher.vbs "cmd /c cd frontend && npm start"
)

:: ==========================================
:: 6. START TUNNEL (Hidden)
:: ==========================================
echo  [6/7] Connecting Tunnel (Hidden)...
if exist "cloudflared.exe" (
    wscript launcher.vbs "cmd /c cloudflared tunnel --config config.yml run"
)

:: ==========================================
:: 7. LAUNCH BROWSER & EXIT
:: ==========================================
echo  [7/7] Opening Dashboard...
timeout /t 5 /nobreak >nul
start https://engilog.site

exit
