Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CareFlow - Starting All Services     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "[1/2] Starting Flask Backend on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\careflow_backend'; .\venv\Scripts\python.exe app.py"

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting Vite Frontend on port 3001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\careflow_frontend'; npm run dev"

Write-Host "`nBoth servers have been launched in separate windows!" -ForegroundColor Yellow
Write-Host "Backend API : http://127.0.0.1:5000" -ForegroundColor White
Write-Host "Frontend App: http://localhost:3001" -ForegroundColor White
