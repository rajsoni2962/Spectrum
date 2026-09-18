# KRATOSX Local Server Launcher
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  KRATOSX: AI Attack Forecasting & SOC Platform    " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"

Write-Host "[1/2] Starting FastAPI Backend (Port 8000)..." -ForegroundColor Yellow
$backendJob = Start-Process python -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000" -WorkingDirectory $backendDir -PassThru -NoNewWindow

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting Vite Frontend (Port 5173)..." -ForegroundColor Yellow
$frontendJob = Start-Process npm -ArgumentList "run dev -- --host 127.0.0.1 --port 5173" -WorkingDirectory $frontendDir -PassThru -NoNewWindow

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  KRATOSX IS NOW LIVE AND STREAMING TELEMETRY!      " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  • SOC Web Application:  http://localhost:5173/   " -ForegroundColor White
Write-Host "  • Production Build:     http://localhost:8000/   " -ForegroundColor White
Write-Host "  • REST API & Swagger:   http://localhost:8000/api/docs" -ForegroundColor White
Write-Host "  • Live WebSocket:       ws://localhost:8000/api/v1/live/ws" -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Press Ctrl+C or close terminal to stop servers." -ForegroundColor Gray

# Open default browser automatically
Start-Process "http://localhost:5173/"

Wait-Process -Id $backendJob.Id
