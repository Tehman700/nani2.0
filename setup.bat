@echo off
title NANI 2.0 — Setup
color 0A

echo.
echo  ================================================
echo   NANI 2.0 — Smart School Pickup System
echo   First-Time Setup Script
echo  ================================================
echo.

:: ── 1. Check Python ─────────────────────────────────────────
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Python not found.
    echo  Download from: https://www.python.org/downloads/
    echo  Make sure to check "Add Python to PATH" during install.
    pause & exit /b 1
)
echo  [OK] Python found.

:: ── 2. Check Node.js ─────────────────────────────────────────
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js not found.
    echo  Download from: https://nodejs.org/  (choose LTS)
    pause & exit /b 1
)
echo  [OK] Node.js found.

:: ── 3. Create Python virtual environment ─────────────────────
if not exist "backend\venv" (
    echo.
    echo  [SETUP] Creating Python virtual environment...
    python -m venv backend\venv
    if %errorlevel% neq 0 (
        echo  [ERROR] Failed to create venv.
        pause & exit /b 1
    )
    echo  [OK] Virtual environment created.
) else (
    echo  [OK] Virtual environment already exists.
)

:: ── 4. Install Python dependencies ───────────────────────────
echo.
echo  [SETUP] Installing Python packages (this may take a minute)...
call backend\venv\Scripts\activate.bat
pip install -r backend\requirements.txt --quiet
if %errorlevel% neq 0 (
    echo  [ERROR] pip install failed. Check your internet connection.
    pause & exit /b 1
)
echo  [OK] Python packages installed.

:: ── 5. Create .env if it doesn't exist ────────────────────────
if not exist "backend\.env" (
    echo.
    echo  [CONFIG] Creating .env from template...
    copy backend\.env.example backend\.env >nul
    echo.
    echo  ================================================
    echo   ACTION REQUIRED — Edit backend\.env
    echo  ================================================
    echo.
    echo   Open the file:  backend\.env
    echo   Change these values to match YOUR MySQL setup:
    echo.
    echo     DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/nani2
    echo     SECRET_KEY=any-random-long-string-here
    echo.
    echo   Then come back here and press any key to continue.
    echo.
    notepad backend\.env
    pause
) else (
    echo  [OK] .env file already exists.
)

:: ── 6. Create MySQL database if it doesn't exist ─────────────
echo.
echo  [DB] Make sure you have created the database in MySQL Workbench:
echo       CREATE DATABASE nani2;
echo.
echo  Press any key once the database exists...
pause >nul

:: ── 7. Run Alembic migrations ─────────────────────────────────
echo.
echo  [DB] Running database migrations...
cd backend
call venv\Scripts\activate.bat
alembic upgrade head
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Migration failed. Common reasons:
    echo    - Wrong password in backend\.env
    echo    - MySQL service not running
    echo    - Database "nani2" not created yet
    cd ..
    pause & exit /b 1
)
cd ..
echo  [OK] Database tables created successfully.

:: ── 8. Install Node.js packages ───────────────────────────────
echo.
echo  [SETUP] Installing frontend packages...
cd frontend
npm install --silent
if %errorlevel% neq 0 (
    echo  [ERROR] npm install failed.
    cd ..
    pause & exit /b 1
)
cd ..
echo  [OK] Frontend packages installed.

:: ── 9. Done ───────────────────────────────────────────────────
echo.
echo  ================================================
echo   Setup complete! Run start.bat to launch the app.
echo  ================================================
echo.
pause
