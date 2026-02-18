# VICO FULL STACK - QUICK START
# Khoi dong tat ca: MongoDB + Backend + Frontend + Open Browser

Write-Host "`n" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "     VICO FULL STACK - ENTERPRISE DEPLOYMENT    " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "`n"

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# ============================================================================
# STEP 1: Start MongoDB Service
# ============================================================================
Write-Host "[1] MONGODB - Khoi dong MongoDB Service..." -ForegroundColor Yellow
$mongoService = Get-Service MongoDB -ErrorAction SilentlyContinue

if ($mongoService) {
    if ($mongoService.Status -eq "Running") {
        Write-Host "   [OK] MongoDB dang chay (PID: $($mongoService.ProcessId))" -ForegroundColor Green
        Write-Host "   mongodb://localhost:27017" -ForegroundColor Cyan
    } else {
        Write-Host "   [*] Khoi dong MongoDB..." -ForegroundColor Yellow
        Start-Service MongoDB -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
        Write-Host "   [OK] MongoDB da khoi dong" -ForegroundColor Green
        Write-Host "   mongodb://localhost:27017" -ForegroundColor Cyan
    }
} else {
    Write-Host "   [ERROR] MongoDB Service khong tim thay!" -ForegroundColor Red
    Write-Host "   Hay cai MongoDB tu https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
}

Write-Host "`n"

# ============================================================================
# STEP 2: Kill existing processes on ports 3000 & 3001
# ============================================================================
Write-Host "[2] CLEANUP - Don dep cac process cu..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force 2>&1 | Out-Null
Start-Sleep -Seconds 1
Write-Host "   [OK] Cac process cu da dung" -ForegroundColor Green

Write-Host "`n"

# ============================================================================
# STEP 3: Start Backend (Express on port 3001)
# ============================================================================
Write-Host "[3] BACKEND - Khoi dong Backend Server..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "powershell.exe" `
    -ArgumentList "-NoExit", "-Command", "cd '$baseDir'; Write-Host '[*] Khoi dong Backend...' -ForegroundColor Yellow; npm run server" `
    -PassThru

Write-Host "   [*] Backend dang khoi dong (PID: $($backendProcess.Id))..." -ForegroundColor Yellow
Write-Host "   http://localhost:3001" -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host "`n"

# ============================================================================
# STEP 4: Start Frontend (Vite on port 3000)
# ============================================================================
Write-Host "[4] FRONTEND - Khoi dong Frontend (Vite)..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "powershell.exe" `
    -ArgumentList "-NoExit", "-Command", "cd '$baseDir'; Write-Host '[*] Khoi dong Frontend...' -ForegroundColor Yellow; npm run dev" `
    -PassThru

Write-Host "   [*] Frontend dang khoi dong (PID: $($frontendProcess.Id))..." -ForegroundColor Yellow
Write-Host "   http://localhost:3000" -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host "`n"

# ============================================================================
# STEP 5: Open Browser
# ============================================================================
Write-Host "[5] BROWSER - Mo trinh duyet..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"
Write-Host "   [OK] Dang mo http://localhost:3000" -ForegroundColor Green

Write-Host "`n"

# ============================================================================
# Summary
# ============================================================================
Write-Host "================================================" -ForegroundColor Green
Write-Host "         [OK] FULL STACK DA KHOI DONG!            " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "`n"

Write-Host "STATUS:" -ForegroundColor Cyan
Write-Host "   [OK] MongoDB    : http://localhost:27017" -ForegroundColor Green
Write-Host "   [OK] Backend    : http://localhost:3001" -ForegroundColor Green
Write-Host "   [OK] Frontend   : http://localhost:3000" -ForegroundColor Green

Write-Host "`n"

Write-Host "FEATURES:" -ForegroundColor Cyan
Write-Host "   - Companies Intelligence" -ForegroundColor Magenta
Write-Host "   - Live News & Market Pulse" -ForegroundColor Magenta
Write-Host "   - Sentiment Analysis" -ForegroundColor Magenta
Write-Host "   - Competitor Analysis" -ForegroundColor Magenta
Write-Host "   - GTM Strategy Builder" -ForegroundColor Magenta

Write-Host "`n"

Write-Host "DE DUNG TAT CA:" -ForegroundColor Yellow
Write-Host "   1. Dong cac Terminal PowerShell" -ForegroundColor White
Write-Host "   2. Hoac chay: Get-Process node | Stop-Process -Force" -ForegroundColor White
Write-Host "   3. Dung MongoDB: Stop-Service MongoDB" -ForegroundColor White

Write-Host "`n"
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Happy coding!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "`n"

# Keep main window open
Read-Host "Nhan Enter de dong..."
