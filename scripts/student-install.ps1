# student-install.ps1
# Automated installation script for MCP Tutorial students

param(
    [switch]$SkipDocker,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
MCP Tutorial - Student Installation Script

This script automates the setup of the MCP Tutorial environment.

USAGE:
    .\scripts\student-install.ps1 [OPTIONS]

OPTIONS:
    -SkipDocker    Skip Docker checks and image loading
    -Help          Show this help message

EXAMPLES:
    # Full automated installation
    .\student-install.ps1

    # Skip Docker setup (if already loaded)
    .\student-install.ps1 -SkipDocker

WHAT THIS SCRIPT DOES:
    1. Checks Docker Desktop is running
    2. Loads the MCP Tutorial Docker image
    3. Creates .env file from template
    4. Starts all services
    5. Runs database migrations
    6. Offers to configure Claude Desktop

"@
    exit 0
}

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Step {
    param([string]$Step, [string]$Message)
    Write-Host "`n[$Step] " -ForegroundColor Yellow -NoNewline
    Write-Host $Message -ForegroundColor White
}

Write-Info @"

╔════════════════════════════════════════╗
║  MCP Tutorial - Student Installation  ║
╔════════════════════════════════════════╝

"@

# Step 1: Check Docker Desktop
if (!$SkipDocker) {
    Write-Step "1/6" "Checking Docker Desktop..."

    try {
        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "✗ Docker Desktop is not running"
            Write-Warning "`nPlease:"
            Write-Warning "1. Start Docker Desktop"
            Write-Warning "2. Wait for it to fully start (icon should be green)"
            Write-Warning "3. Run this script again"
            exit 1
        }
        Write-Success "✓ Docker Desktop is running"

        # Check Docker version
        $version = docker version --format '{{.Server.Version}}' 2>&1
        Write-Info "  Docker version: $version"

    } catch {
        Write-Error "✗ Error checking Docker: $_"
        exit 1
    }

    # Step 2: Load Docker image
    Write-Step "2/6" "Loading MCP Tutorial Docker image..."

    $imagePath = "mcp-tutorial-image.tar"
    if (!(Test-Path $imagePath)) {
        Write-Error "✗ Image file not found: $imagePath"
        Write-Warning "`nMake sure you're running this script from the distribution folder"
        Write-Warning "The folder should contain: mcp-tutorial-image.tar"
        exit 1
    }

    Write-Info "  Loading image (this may take 1-2 minutes)..."
    try {
        docker load -i $imagePath
        if ($LASTEXITCODE -ne 0) {
            Write-Error "✗ Failed to load Docker image"
            exit 1
        }
        Write-Success "✓ Docker image loaded successfully"
    } catch {
        Write-Error "✗ Error loading image: $_"
        exit 1
    }

    # Verify image
    $imageCheck = docker images mcp-tutorial --format "{{.Repository}}:{{.Tag}}" 2>&1
    if ($imageCheck -match "mcp-tutorial") {
        Write-Success "✓ Image verified: $imageCheck"
    } else {
        Write-Warning "⚠ Could not verify image, but continuing..."
    }
} else {
    Write-Warning "Skipping Docker checks (as requested)"
}

# Step 3: Create .env file
Write-Step "3/6" "Setting up environment configuration..."

if (!(Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Success "✓ Created .env from template"
    } else {
        # Create a basic .env if example doesn't exist
        @"
POSTGRES_DB=book_series_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
NODE_ENV=production
"@ | Out-File ".env" -Encoding UTF8
        Write-Success "✓ Created default .env file"
    }
} else {
    Write-Info "  .env file already exists (keeping existing configuration)"
}

# Step 4: Start services
Write-Step "4/6" "Starting MCP Tutorial services..."

Write-Info "  Starting database and MCP servers..."
try {
    docker-compose -f docker-compose.mcp.yml up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Error "✗ Failed to start services"
        exit 1
    }
    Write-Success "✓ Services started"
} catch {
    Write-Error "✗ Error starting services: $_"
    exit 1
}

# Wait for database to be ready
Write-Info "  Waiting for database to be ready..."
$maxWait = 30
$waited = 0
while ($waited -lt $maxWait) {
    $dbStatus = docker-compose -f docker-compose.mcp.yml ps postgres --format json 2>&1 | ConvertFrom-Json
    if ($dbStatus.Health -eq "healthy") {
        Write-Success "✓ Database is ready"
        break
    }
    Start-Sleep -Seconds 2
    $waited += 2
    Write-Host "." -NoNewline
}

if ($waited -ge $maxWait) {
    Write-Warning "`n⚠ Database may not be fully ready yet. Check with: docker-compose -f docker-compose.mcp.yml logs postgres"
}

# Step 5: Show running services
Write-Step "5/6" "Verifying services..."

try {
    $services = docker-compose -f docker-compose.mcp.yml ps --format "table {{.Name}}\t{{.Status}}"
    Write-Info "`n$services`n"
    Write-Success "✓ All services are running"
} catch {
    Write-Warning "⚠ Could not verify services status"
}

# Step 6: Configure Claude Desktop
Write-Step "6/6" "Claude Desktop configuration..."

Write-Info @"

You have two options to connect Claude Desktop:

OPTION A - Docker Desktop UI (Recommended):
  1. Open Docker Desktop
  2. Go to the 'Containers' section
  3. Find the mcp-tutorial containers
  4. Click 'Connect to Claude Desktop' for each MCP server
  5. Restart Claude Desktop

OPTION B - Manual Configuration:
  Edit your Claude Desktop config file and add the MCP servers.

"@

$response = Read-Host "Would you like help with manual configuration? (y/n)"

if ($response -eq "y" -or $response -eq "Y") {
    Write-Info "`nClaude Desktop config file locations:"
    Write-Info "  Windows: %APPDATA%\Claude\claude_desktop_config.json"
    Write-Info "  macOS: ~/Library/Application Support/Claude/claude_desktop_config.json"

    Write-Info "`nSample configuration (copy this into your config file):"
    Write-Host @"

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

"@ -ForegroundColor Gray

    Write-Info "`nAdd more servers as needed following the same pattern."
}

# Final summary
Write-Success @"

╔═══════════════════════════════════════╗
║     Installation Complete! 🎉         ║
╚═══════════════════════════════════════╝

"@

Write-Info "Next Steps:"
Write-Info "1. Configure Claude Desktop (see options above)"
Write-Info "2. Restart Claude Desktop completely"
Write-Info "3. Look for the 🔨 tool icon in Claude Desktop"
Write-Info "4. Try: 'Can you list all authors?'"

Write-Info "`nUseful Commands:"
Write-Info "  View logs:     docker-compose -f docker-compose.mcp.yml logs -f"
Write-Info "  Stop services: docker-compose -f docker-compose.mcp.yml down"
Write-Info "  Restart:       docker-compose -f docker-compose.mcp.yml restart"

Write-Info "`nFor troubleshooting, see: student-setup-instructions.md"
Write-Success "`nHappy writing! 📚✨`n"
