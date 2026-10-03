Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting Miraaj V1 (Backend + Frontend)..." -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Write-Host "[1/2] Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList '/k "python -m uvicorn apps.api.src.main:app --host 127.0.0.1 --port 8000 --reload"'

Write-Host "[2/2] Launching Next.js Web Frontend on http://localhost:3000..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList '/k "npm run dev:web"'

Write-Host "`nMiraaj is starting up!" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend  : http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "  API Docs : http://127.0.0.1:8000/docs`n" -ForegroundColor Green
