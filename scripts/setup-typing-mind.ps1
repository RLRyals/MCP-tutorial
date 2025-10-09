# setup-typing-mind.ps1
# Typing Mind setup with MCP Connector for MCP Tutorial

param(
    [Parameter(Mandatory=$true)]
    [string]$AuthToken,

    [switch]$Help
)

if ($Help) {
    Write-Host @"
Typing Mind Setup for MCP Tutorial

This script sets up Typing Mind with the MCP Connector.

PREREQUISITES:
    - Node.js installed (https://nodejs.org)
    - Typing Mind auth token (get from Typing Mind settings)

USAGE:
    .\setup-typing-mind.ps1 -AuthToken YOUR_TOKEN

WHAT THIS DOES:
    1. Installs @typingmind/mcp connector globally
    2. Starts Docker containers in stdio mode
    3. Starts the MCP Connector with your auth token
    4. Shows you how to configure Typing Mind

MORE INFO:
    See docs/TYPING_MIND_CORRECT_SETUP.md
"@
    exit 0
}

if (-not $AuthToken) {
    Write-Host "ERROR: Auth token required" -ForegroundColor Red
    Write-Host "Get your token from: Typing Mind → Settings → MCP Servers → Auth Token" -ForegroundColor Yellow
    Write-Host "Usage: .\setup-typing-mind.ps1 -AuthToken YOUR_TOKEN" -ForegroundColor Yellow
    exit 1
}

$ErrorActionPreference = "Stop"

Write-Host "`n=== Typing Mind Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    Write-Host "Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found" -ForegroundColor Red
    Write-Host "Install from: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

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

# Install TypingMind MCP Connector
Write-Host "`nInstalling TypingMind MCP Connector..." -ForegroundColor Yellow
npm install -g @typingmind/mcp
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install connector" -ForegroundColor Red
    exit 1
}
Write-Host "Connector installed" -ForegroundColor Green

# Check for image
Write-Host "`nChecking for MCP Tutorial image..." -ForegroundColor Yellow
$imageExists = docker images mcp-tutorial:latest --format "{{.Repository}}" 2>$null
if (-not $imageExists) {
    Write-Host "ERROR: MCP Tutorial image not found" -ForegroundColor Red
    Write-Host "Please run: docker load -i mcp-tutorial-image.tar" -ForegroundColor Yellow
    exit 1
}
Write-Host "Image found" -ForegroundColor Green

# Start Docker containers (stdio mode)
Write-Host "`nStarting MCP servers..." -ForegroundColor Yellow
docker compose -f docker-compose.mcp.yml up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start services" -ForegroundColor Red
    exit 1
}

Write-Host "Waiting for services to start..." -ForegroundColor Gray
Start-Sleep -Seconds 10
Write-Host "Services started!" -ForegroundColor Green

# Show instructions
Write-Host "`n" -NoNewline
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Next Steps - Keep This Open  " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 1: Start the MCP Connector (in a NEW terminal):" -ForegroundColor Yellow
Write-Host ""
Write-Host "  npx @typingmind/mcp $AuthToken --config mcp-config.json" -ForegroundColor White
Write-Host ""
Write-Host "  (Keep that terminal running!)" -ForegroundColor Gray
Write-Host ""

Write-Host "STEP 2: Configure Typing Mind:" -ForegroundColor Yellow
Write-Host "  1. Open Typing Mind settings" -ForegroundColor White
Write-Host "  2. Go to: MCP Servers" -ForegroundColor White
Write-Host "  3. Add this URL: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 3: Test it!" -ForegroundColor Yellow
Write-Host "  Ask in Typing Mind: 'Can you list all authors?'" -ForegroundColor White
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Copy connector command to clipboard
$connectorCommand = "npx @typingmind/mcp $AuthToken --config mcp-config.json"
$connectorCommand | Set-Clipboard
Write-Host "Connector command copied to clipboard!" -ForegroundColor Green
Write-Host ""

Write-Host "Helpful Commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "View MCP server logs:" -ForegroundColor Yellow
Write-Host "  docker compose -f docker-compose.mcp.yml logs -f" -ForegroundColor Gray
Write-Host ""
Write-Host "Stop everything:" -ForegroundColor Yellow
Write-Host "  1. Stop connector (Ctrl+C in its terminal)" -ForegroundColor Gray
Write-Host "  2. docker compose -f docker-compose.mcp.yml down" -ForegroundColor Gray
Write-Host ""

Write-Host "Done! Now run the connector command in a new terminal." -ForegroundColor Green
Write-Host ""
