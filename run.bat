@echo off
echo ========================================
echo    CareFlow - Starting All Services
echo ========================================

echo [1/2] Starting Flask Backend on port 5000...
start "CareFlow Backend" cmd /k "cd /d D:\xampp\Desktop\PROJECT\236268-43893-650\careflow_backend && .\venv\Scripts\python.exe app.py"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Vite Frontend on port 3001...
start "CareFlow Frontend" cmd /k "cd /d D:\xampp\Desktop\PROJECT\236268-43893-650\careflow_frontend && npm run dev"

echo.
echo ========================================
echo  Backend  -> http://127.0.0.1:5000
echo  Frontend -> http://localhost:3001
echo ========================================
echo Both servers are starting in separate windows!
pause
