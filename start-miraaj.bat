@echo off
title Miraaj V1 - AI Video Studio
echo ===================================================
echo Starting Miraaj V1 (Backend + Frontend)...
echo ===================================================

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000...
start "Miraaj Backend (FastAPI)" cmd /k "python -m uvicorn apps.api.src.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Launching Next.js Web Frontend on http://localhost:3000...
start "Miraaj Frontend (Next.js)" cmd /k "npm run dev:web"

echo.
echo Miraaj is starting up!
echo   Frontend : http://localhost:3000
echo   Backend  : http://127.0.0.1:8000
echo   API Docs : http://127.0.0.1:8000/docs
echo.
echo Servers are running in separate terminal windows.
echo Press any key to close this launcher...
pause >nul
