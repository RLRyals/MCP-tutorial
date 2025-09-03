# ======================================================================
# Quick Database Launcher
# ======================================================================
# Simple one-liner to start the database services

Write-Host "Starting MCP Tutorial Database..." -ForegroundColor Green

# Check if Docker is running, start services
if (docker info 2>$null) {
    Write-Host "Docker is running, starting services..." -ForegroundColor Cyan
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database services started successfully!" -ForegroundColor Green
        docker-compose ps
    }
} else {
    Write-Host "Docker Desktop is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again, or use the full startup script:" -ForegroundColor Yellow
    Write-Host "  .\scripts\start-database.ps1" -ForegroundColor Cyan
}
