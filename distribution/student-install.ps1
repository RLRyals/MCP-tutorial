# student-install-simple.ps1
# Simplified installation script for MCP Tutorial students

param(
    [switch]$SkipDocker,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
MCP Tutorial - Student Installation

USAGE:
    .\student-install.ps1 [-SkipDocker]

OPTIONS:
    -SkipDocker    Skip Docker checks and image loading
    -Help          Show this help

WHAT THIS DOES:
    1. Checks Docker Desktop is running
    2. Loads the MCP Tutorial Docker image
    3. Creates .env file
    4. Starts all services
    5. Helps configure Claude Desktop
"@
    exit 0
}

$ErrorActionPreference = "Stop"

Write-Host "`n=== MCP Tutorial - Student Installation ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Docker
if (-not $SkipDocker) {
    Write-Host "[1/6] Checking Docker Desktop..." -ForegroundColor Yellow

    try {
        docker info | Out-Null
        Write-Host "Docker Desktop is running" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Docker Desktop is not running" -ForegroundColor Red
        Write-Host "`nPlease:" -ForegroundColor Yellow
        Write-Host "1. Start Docker Desktop" -ForegroundColor White
        Write-Host "2. Wait for it to fully start (green icon)" -ForegroundColor White
        Write-Host "3. Run this script again" -ForegroundColor White
        exit 1
    }

    $version = docker version --format '{{.Server.Version}}' 2>$null
    Write-Host "Docker version: $version" -ForegroundColor Gray

    # Step 2: Load Docker image
    Write-Host "`n[2/6] Loading MCP Tutorial Docker image..." -ForegroundColor Yellow

    $imagePath = "mcp-tutorial-image.tar"
    if (-not (Test-Path $imagePath)) {
        Write-Host "ERROR: Image file not found: $imagePath" -ForegroundColor Red
        Write-Host "Make sure you're running this from the distribution folder" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "Loading image (this may take 1-2 minutes)..." -ForegroundColor Gray
    docker load -i $imagePath
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to load Docker image" -ForegroundColor Red
        exit 1
    }
    Write-Host "Docker image loaded successfully" -ForegroundColor Green

    # Verify
    $imageCheck = docker images mcp-tutorial --format "{{.Repository}}:{{.Tag}}" 2>$null | Select-Object -First 1
    if ($imageCheck) {
        Write-Host "Image verified: $imageCheck" -ForegroundColor Green
    }
} else {
    Write-Host "Skipping Docker checks (as requested)" -ForegroundColor Yellow
}

# Step 3: Create .env file
Write-Host "`n[3/6] Setting up environment..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env from template" -ForegroundColor Green
    } else {
        $envContent = @"
POSTGRES_DB=book_series_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
NODE_ENV=production
"@
        $envContent | Out-File ".env" -Encoding UTF8
        Write-Host "Created default .env file" -ForegroundColor Green
    }
} else {
    Write-Host ".env file already exists (keeping existing)" -ForegroundColor Gray
}

# Step 4: Start services
Write-Host "`n[4/6] Starting MCP Tutorial services..." -ForegroundColor Yellow

Write-Host "Starting database and MCP servers..." -ForegroundColor Gray
docker compose -f docker-compose.mcp.yml up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start services" -ForegroundColor Red
    exit 1
}
Write-Host "Services started" -ForegroundColor Green

# Wait for database
Write-Host "`nWaiting for database to be ready..." -ForegroundColor Gray
$maxWait = 30
$waited = 0

while ($waited -lt $maxWait) {
    $dbReady = docker exec mcp-tutorial-db pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database is ready" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 2
    $waited += 2
    Write-Host "." -NoNewline
}

if ($waited -ge $maxWait) {
    Write-Host "`nWARNING: Database may not be fully ready" -ForegroundColor Yellow
    Write-Host "Check logs: docker compose -f docker-compose.mcp.yml logs postgres" -ForegroundColor Gray
}

# Step 5: Show running services
Write-Host "`n[5/6] Verifying services..." -ForegroundColor Yellow

docker compose -f docker-compose.mcp.yml ps
Write-Host "`nAll services are running" -ForegroundColor Green

# Step 6: Configure Claude Desktop
Write-Host "`n[6/6] Claude Desktop configuration..." -ForegroundColor Yellow

Write-Host @"

You have two options to connect Claude Desktop:

OPTION A - Docker Desktop UI (Recommended):
  1. Open Docker Desktop
  2. Go to the 'Containers' section
  3. Find the mcp-tutorial containers
  4. Click 'Connect to Claude Desktop' for each MCP server
  5. Restart Claude Desktop

OPTION B - Manual Configuration:
  Edit your Claude Desktop config file and add the MCP servers.
  Location:
    Windows: %APPDATA%\Claude\claude_desktop_config.json
    macOS: ~/Library/Application Support/Claude/claude_desktop_config.json

"@ -ForegroundColor Cyan

$response = Read-Host "`nWould you like help with manual configuration? (y/n)"

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "`nSample configuration to add to your claude_desktop_config.json:" -ForegroundColor Cyan
    Write-Host @'

{
  "mcpServers": {
    "author-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-author", "node", "src/mcps/author-server/index.js"]
    },
    "series-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-series", "node", "src/mcps/series-server/index.js"]
    },
    "book-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-book", "node", "src/mcps/book-server/index.js"]
    },
    "character-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-character", "node", "src/mcps/character-server/index.js"]
    }
  }
}

'@ -ForegroundColor Gray

    Write-Host "`nAdd more servers as needed following the same pattern." -ForegroundColor Gray
}

# Final summary
Write-Host "`n=== Installation Complete ===" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure Claude Desktop (see options above)" -ForegroundColor White
Write-Host "2. Restart Claude Desktop completely" -ForegroundColor White
Write-Host "3. Look for the hammer icon in Claude Desktop" -ForegroundColor White
Write-Host "4. Try: 'Can you list all authors?'" -ForegroundColor White

Write-Host "`nUseful Commands:" -ForegroundColor Cyan
Write-Host "  View logs:     docker compose -f docker-compose.mcp.yml logs -f" -ForegroundColor Gray
Write-Host "  Stop services: docker compose -f docker-compose.mcp.yml down" -ForegroundColor Gray
Write-Host "  Restart:       docker compose -f docker-compose.mcp.yml restart" -ForegroundColor Gray

Write-Host "`nHappy writing!" -ForegroundColor Green
Write-Host ""
