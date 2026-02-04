# VICO Full Stack Startup - Companies + News Intelligence
# Starts ALL services: MongoDB + Backend + News Import + Frontend

Write-Host "`n" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   VICO VIETNAM COPILOT - FULL STACK STARTUP" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Features: Companies + News Intelligence" -ForegroundColor Cyan
Write-Host "   - Market Pulse (News Signals)" -ForegroundColor Cyan
Write-Host "   - AI Summarization" -ForegroundColor Cyan
Write-Host "   - Sentiment Analysis" -ForegroundColor Cyan
Write-Host "   - Entity Linking" -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Configuration
$mongoPath = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
$newsImportMode = "sample"  # Change to "full" for all 39,000 articles

Write-Host "[STARTUP CONFIGURATION]" -ForegroundColor Yellow
Write-Host "Base Directory: $baseDir" -ForegroundColor Yellow
Write-Host "MongoDB Path: $mongoPath" -ForegroundColor Yellow
Write-Host "News Import Mode: $newsImportMode (100 articles)" -ForegroundColor Yellow
Write-Host "Estimated Duration: ~8 minutes" -ForegroundColor Yellow
Write-Host "`n"

# ============================================================================
# STEP 1: MongoDB
# ============================================================================
Write-Host "[STEP 1] Starting MongoDB..." -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

if (Test-Path $mongoPath) {
    Write-Host "[OK] MongoDB found at: $mongoPath"
    $mongoProcess = Start-Process -FilePath $mongoPath `
        -NoNewWindow `
        -PassThru
    
    Write-Host "[OK] MongoDB started (PID: $($mongoProcess.Id))" -ForegroundColor Green
    Write-Host "     Listening on: mongodb://localhost:27017" -ForegroundColor Cyan
    Write-Host "     Waiting for MongoDB to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
} else {
    Write-Host "[ERROR] MongoDB not found at: $mongoPath" -ForegroundColor Red
    Write-Host "Please install MongoDB or update the path" -ForegroundColor Red
    exit 1
}

# ============================================================================
# STEP 2: Backend Server (Companies Auto-Load)
# ============================================================================
Write-Host "`n[STEP 2] Starting Backend Server..." -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

$backendProcess = Start-Process -FilePath "npm" `
    -ArgumentList "run server" `
    -WorkingDirectory $baseDir `
    -NoNewWindow `
    -PassThru

Write-Host "[OK] Backend server started (PID: $($backendProcess.Id))" -ForegroundColor Green
Write-Host "     Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "     Companies data: Auto-loaded (10,236 records)" -ForegroundColor Cyan
Write-Host "     Waiting for backend to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# ============================================================================
# STEP 3: Import News Data (100 articles for test)
# ============================================================================
Write-Host "`n[STEP 3] Importing News Intelligence Data..." -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

if ($newsImportMode -eq "sample") {
    Write-Host "[INFO] Mode: SAMPLE (100 articles) - ~5 minutes" -ForegroundColor Yellow
    $importProcess = Start-Process -FilePath "npm" `
        -ArgumentList "run import-news-sample" `
        -WorkingDirectory $baseDir `
        -NoNewWindow `
        -PassThru
} else {
    Write-Host "[INFO] Mode: FULL (39,000 articles) - ~2-4 hours" -ForegroundColor Yellow
    $importProcess = Start-Process -FilePath "npm" `
        -ArgumentList "run import-news" `
        -WorkingDirectory $baseDir `
        -NoNewWindow `
        -PassThru
}

Write-Host "[OK] News import started (PID: $($importProcess.Id))" -ForegroundColor Green
Write-Host "[INFO] Processing articles..." -ForegroundColor Yellow
Write-Host "[WAIT] Waiting for import to complete..." -ForegroundColor Yellow

# Wait for import to complete
$importProcess | Wait-Process

Write-Host "[OK] News data import completed!" -ForegroundColor Green
Write-Host "     - Articles loaded" -ForegroundColor Cyan
Write-Host "     - AI enrichment completed (signals, sentiment, summary)" -ForegroundColor Cyan
Write-Host "     - Full-text indexing enabled" -ForegroundColor Cyan

# ============================================================================
# STEP 4: Frontend (Vite)
# ============================================================================
Write-Host "`n[STEP 4] Starting Vite Frontend..." -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

$frontendProcess = Start-Process -FilePath "npm" `
    -ArgumentList "run dev" `
    -WorkingDirectory $baseDir `
    -NoNewWindow `
    -PassThru

Write-Host "[OK] Frontend started (PID: $($frontendProcess.Id))" -ForegroundColor Green
Write-Host "     Website: http://localhost:5173" -ForegroundColor Cyan

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "`n" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   VICO FULL STACK IS RUNNING" -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

Write-Host "[ACCESS POINTS]" -ForegroundColor Green
Write-Host "Frontend:        http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API:     http://localhost:3001" -ForegroundColor Cyan
Write-Host "MongoDB:         mongodb://localhost:27017" -ForegroundColor Cyan

Write-Host "`n[DATA LOADED]" -ForegroundColor Green
Write-Host "Companies:       10,236 records" -ForegroundColor Cyan
$articleCount = if ($newsImportMode -eq 'sample') { '100 articles (sample)' } else { '39,000 articles (full)' }
Write-Host "News Articles:   $articleCount" -ForegroundColor Cyan

Write-Host "`n[FEATURES AVAILABLE]" -ForegroundColor Green
Write-Host "[OK] Market Pulse (9 signal types)" -ForegroundColor Cyan
Write-Host "[OK] AI Summarization (Gemini)" -ForegroundColor Cyan
Write-Host "[OK] Sentiment Analysis (Positive/Negative/Neutral)" -ForegroundColor Cyan
Write-Host "[OK] Entity Linking (Company mentions)" -ForegroundColor Cyan
Write-Host "[OK] Search & Analytics" -ForegroundColor Cyan

Write-Host "`n[DOCUMENTATION]" -ForegroundColor Green
Write-Host "- 00_START_HERE.md" -ForegroundColor Cyan
Write-Host "- NEWS_INTELLIGENCE_QUICKSTART.md" -ForegroundColor Cyan
Write-Host "- NEWS_INTELLIGENCE_SETUP.md" -ForegroundColor Cyan

Write-Host "`n[IMPORTANT NOTES]" -ForegroundColor Yellow
Write-Host "- Keep all 4 windows open while using the platform" -ForegroundColor Yellow
Write-Host "- Close windows to stop services" -ForegroundColor Yellow
Write-Host "- First request may take a few seconds" -ForegroundColor Yellow

Write-Host "`n" -ForegroundColor Cyan
