@echo off
REM Start all VICO services

echo.
echo ==================================================
echo VICO Intelligence Platform - Complete Startup
echo ==================================================
echo.

REM Kill existing processes
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo 1. Starting Vietnamese Embedding Server (Port 5000)...
start "Vietnamese Embedding Server" .\.venv\Scripts\python.exe services\vietnamese_embedding_server.py 5000
timeout /t 3 /nobreak >nul

echo 2. Starting Node Backend (Port 3001)...
start "Node Backend" cmd /k npm run server
timeout /t 2 /nobreak >nul

echo 3. Starting Vite Frontend (Port 3000)...
start "Vite Frontend" cmd /k npm run dev
timeout /t 2 /nobreak >nul

echo.
echo ==================================================
echo SUCCESS! VICO Platform Started
echo ==================================================
echo.
echo Access Points:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:3001
echo   Embedding: http://localhost:5000
echo.
echo Close these windows to stop services.
echo.
