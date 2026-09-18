@echo off
title KRATOSX - AI Network Attack Forecasting & SOC Platform
echo ====================================================
echo   KRATOSX: AI Attack Forecasting & SOC Platform    
echo ====================================================
echo.

cd /d "%~dp0"

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "KRATOSX Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Vite Frontend on http://127.0.0.1:5173 ...
start "KRATOSX Frontend" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 2 /nobreak >nul

echo.
echo Opening KRATOSX in default browser...
start http://localhost:5173/

echo ====================================================
echo   SERVERS RUNNING SUCCESSFULLY:
echo   - Web Platform:     http://localhost:5173/
echo   - Integrated Build: http://localhost:8000/
echo   - Swagger Docs:     http://localhost:8000/api/docs
echo ====================================================
