@echo off
title NANI 2.0 — Starting...
color 0A

echo.
echo  ================================================
echo   NANI 2.0 — Smart School Pickup System
echo  ================================================
echo.

:: ── Check setup has been run ─────────────────────────────────
if not exist "backend\venv" (
    echo  [ERROR] Setup not done. Run setup.bat first.
    pause & exit /b 1
)
if not exist "backend\.env" (
    echo  [ERROR] backend\.env missing. Run setup.bat first.
    pause & exit /b 1
)
if not exist "frontend\node_modules" (
    echo  [ERROR] Frontend not installed. Run setup.bat first.
    pause & exit /b 1
)

:: ── Start Redis (if installed) ────────────────────────────────
where redis-server >nul 2>&1
if %errorlevel% equ 0 (
    echo  [OK] Starting Redis...
    start "Redis" /MIN cmd /c redis-server
    timeout /t 1 /nobreak >nul
) else (
    echo  [WARN] Redis not found — queue live-update features will not work.
    echo         Install with: winget install Redis.Redis
    echo.
)

:: ── Start Backend ─────────────────────────────────────────────
echo  [START] Launching backend on http://localhost:8000 ...
start "NANI Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

:: ── Start Frontend ────────────────────────────────────────────
echo  [START] Launching frontend on http://localhost:5173 ...
start "NANI Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo  ================================================
echo   App is starting up...
echo.
echo   Frontend  →  http://localhost:5173
echo   Backend   →  http://localhost:8000
echo   API Docs  →  http://localhost:8000/docs
echo.
echo   Open MySQL Workbench and connect to:
echo     Host: localhost  Port: 3306
echo     Database: nani2
echo  ================================================
echo.
echo  Close the two terminal windows to stop the app.
echo.
pause
