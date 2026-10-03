# Miraaj Development Environment Startup Script for PowerShell
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Starting Miraaj Development Stack..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Start Redis if not already running
$redisRunning = $false
try {
    $ping = & "$PSScriptRoot\..\bin\redis\redis-cli.exe" ping 2>$null
    if ($ping -match "PONG") { $redisRunning = $true }
} catch {}

if (-not $redisRunning) {
    Write-Host "[1/3] Launching background Redis server on localhost:6379..." -ForegroundColor Yellow
    Start-Process -FilePath "$PSScriptRoot\..\bin\redis\redis-server.exe" -ArgumentList "--port 6379" -WindowStyle Hidden
    Start-Sleep -Seconds 1
} else {
    Write-Host "[1/3] Redis is already running on localhost:6379." -ForegroundColor Green
}

# 2. Launch FastAPI Server
Write-Host "[2/3] Launching FastAPI API server on http://localhost:8000..." -ForegroundColor Yellow
$apiProcess = Start-Process -FilePath "python" -ArgumentList "-m uvicorn apps.api.src.main:app --host 0.0.0.0 --port 8000 --reload" -PassThru

# 3. Launch Next.js Web App
Write-Host "[3/3] Launching Next.js frontend on http://localhost:3000..." -ForegroundColor Yellow
$webProcess = Start-Process -FilePath "npm" -ArgumentList "run dev --workspace=apps/web" -PassThru

Write-Host "============================================================" -ForegroundColor Green
Write-Host " Miraaj V1 Stack is live!" -ForegroundColor Green
Write-Host " Web UI     : http://localhost:3000" -ForegroundColor Cyan
Write-Host " API Docs   : http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host " API Health : http://localhost:8000/api/v1/health" -ForegroundColor Cyan
Write-Host " Press Ctrl+C in terminal windows to stop." -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
