# setup-typing-mind.ps1
# Simplified Typing Mind setup for MCP Tutorial

param(
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Typing Mind Setup for MCP Tutorial

This script starts the MCP servers in HTTP mode and shows you
the URLs to add in Typing Mind.

USAGE:
    .\setup-typing-mind.ps1

WHAT THIS DOES:
    1. Checks Docker is running
    2. Starts MCP servers in HTTP mode (ports 3501-3512)
    3. Shows you the URLs to copy into Typing Mind
    4. Opens Typing Mind settings (if possible)
"@
    exit 0
}

$ErrorActionPreference = "Stop"

Write-Host "`n=== Typing Mind Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop first" -ForegroundColor Yellow
    exit 1
}

# Check for image
Write-Host "`nChecking for MCP Tutorial image..." -ForegroundColor Yellow
$imageExists = docker images mcp-tutorial:latest --format "{{.Repository}}" 2>$null
if (-not $imageExists) {
    Write-Host "ERROR: MCP Tutorial image not found" -ForegroundColor Red
    Write-Host "Please run: docker load -i mcp-tutorial-image.tar" -ForegroundColor Yellow
    exit 1
}
Write-Host "Image found" -ForegroundColor Green

# Start HTTP servers
Write-Host "`nStarting MCP servers in HTTP mode..." -ForegroundColor Yellow
docker compose -f docker-compose.typing-mind.yml up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start services" -ForegroundColor Red
    exit 1
}

Write-Host "Waiting for services to start..." -ForegroundColor Gray
Start-Sleep -Seconds 10

Write-Host "Services started!" -ForegroundColor Green

# Test one endpoint
Write-Host "`nTesting connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3501/health" -UseBasicParsing -TimeoutSec 5 2>$null
    Write-Host "Services are responding" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Services may still be starting up" -ForegroundColor Yellow
}

# Show configuration
Write-Host "`n" -NoNewline
Write-Host "=======================" -ForegroundColor Cyan
Write-Host "  Typing Mind Setup  " -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 1: Open Typing Mind" -ForegroundColor Yellow
Write-Host "  Go to: https://www.typingmind.com/" -ForegroundColor White
Write-Host ""

Write-Host "STEP 2: Go to Settings → MCP Servers" -ForegroundColor Yellow
Write-Host ""

Write-Host "STEP 3: Add these servers (copy-paste the URLs):" -ForegroundColor Yellow
Write-Host ""

# Create a nice table
$servers = @(
    @{Name="Author Manager"; Port=3501}
    @{Name="Series Manager"; Port=3502}
    @{Name="Book Manager"; Port=3503}
    @{Name="Character Manager"; Port=3504}
    @{Name="Timeline Manager"; Port=3505}
    @{Name="Metadata Manager"; Port=3506}
    @{Name="Trope Manager"; Port=3507}
    @{Name="Plot Manager"; Port=3508}
    @{Name="Relationship Manager"; Port=3509}
    @{Name="Story Analysis"; Port=3510}
    @{Name="World Builder"; Port=3511}
    @{Name="Writing Manager"; Port=3512}
)

foreach ($server in $servers) {
    $name = $server.Name.PadRight(22)
    $url = "http://localhost:$($server.Port)"
    Write-Host "  $name" -NoNewline -ForegroundColor Cyan
    Write-Host " $url" -ForegroundColor White
}

Write-Host ""
Write-Host "STEP 4: Test it!" -ForegroundColor Yellow
Write-Host "  Ask in Typing Mind: 'Can you list all authors?'" -ForegroundColor White
Write-Host ""

# Offer to copy URLs to clipboard
Write-Host "Helpful Commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Copy ALL URLs at once:" -ForegroundColor Yellow
Write-Host @'
  $urls = 3501..3512 | ForEach-Object { "http://localhost:$_" }
  $urls -join "`n" | Set-Clipboard
  Write-Host "URLs copied to clipboard!"
'@ -ForegroundColor Gray

Write-Host ""
Write-Host "View server logs:" -ForegroundColor Yellow
Write-Host "  docker compose -f docker-compose.typing-mind.yml logs -f" -ForegroundColor Gray

Write-Host ""
Write-Host "Stop servers when done:" -ForegroundColor Yellow
Write-Host "  docker compose -f docker-compose.typing-mind.yml down" -ForegroundColor Gray

Write-Host ""
Write-Host "Done! 🎉" -ForegroundColor Green
Write-Host ""

# Ask if they want URLs copied
$response = Read-Host "Copy all URLs to clipboard now? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    $urls = 3501..3512 | ForEach-Object { "http://localhost:$_" }
    $urls -join "`n" | Set-Clipboard
    Write-Host "`nURLs copied! Paste into Typing Mind." -ForegroundColor Green
}
