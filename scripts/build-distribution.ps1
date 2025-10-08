# build-distribution.ps1
# Simple script to build MCP Tutorial distribution package

param(
    [string]$OutputDir = ".\distribution",
    [switch]$Help
)

if ($Help) {
    Write-Host @"
MCP Tutorial - Build Distribution Package

USAGE:
    .\scripts\build-distribution.ps1 [-OutputDir <path>]

OPTIONS:
    -OutputDir <path>    Output directory (default: .\distribution)
    -Help               Show this help

EXAMPLES:
    .\scripts\build-distribution.ps1
    .\scripts\build-distribution.ps1 -OutputDir "C:\output"
"@
    exit 0
}

$ErrorActionPreference = "Stop"

Write-Host "`n=== MCP Tutorial - Build Distribution ===" -ForegroundColor Cyan
Write-Host ""

# Check Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if image exists
Write-Host "`nChecking for mcp-tutorial image..." -ForegroundColor Yellow
$imageExists = docker images mcp-tutorial:latest --format "{{.Repository}}" 2>$null
if (-not $imageExists) {
    Write-Host "Image not found. Building mcp-tutorial:latest..." -ForegroundColor Yellow
    docker build -t mcp-tutorial:latest .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker build failed" -ForegroundColor Red
        exit 1
    }
}
Write-Host "Image ready: mcp-tutorial:latest" -ForegroundColor Green

# Create output directory
Write-Host "`nCreating output directory: $OutputDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
Write-Host "Directory created" -ForegroundColor Green

# Export Docker image
Write-Host "`nExporting Docker image..." -ForegroundColor Yellow
Write-Host "(This may take a few minutes)" -ForegroundColor Gray
$tarFile = Join-Path $OutputDir "mcp-tutorial-image.tar"
docker save mcp-tutorial:latest -o $tarFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to export image" -ForegroundColor Red
    exit 1
}
$size = [math]::Round((Get-Item $tarFile).Length / 1MB, 1)
Write-Host "Image exported: $size MB" -ForegroundColor Green

# Copy docker-compose file
Write-Host "`nCopying docker-compose file..." -ForegroundColor Yellow
Copy-Item "docker-compose.mcp.yml" (Join-Path $OutputDir "docker-compose.mcp.yml") -Force
Write-Host "Copied docker-compose.mcp.yml" -ForegroundColor Green

# Copy mcp-config.json (for Typing Mind users)
Write-Host "`nCopying mcp-config.json..." -ForegroundColor Yellow
Copy-Item "mcp-config.json" (Join-Path $OutputDir "mcp-config.json") -Force
Write-Host "Copied mcp-config.json (for Typing Mind)" -ForegroundColor Green

# Create .env.example
Write-Host "`nCreating .env.example..." -ForegroundColor Yellow
$envContent = @"
# MCP Tutorial Environment Variables
POSTGRES_DB=book_series_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
NODE_ENV=production
"@
$envContent | Out-File (Join-Path $OutputDir ".env.example") -Encoding UTF8
Write-Host "Created .env.example" -ForegroundColor Green

# Copy installation scripts
Write-Host "`nCopying installation scripts..." -ForegroundColor Yellow
if (Test-Path "scripts\student-install.ps1") {
    Copy-Item "scripts\student-install.ps1" (Join-Path $OutputDir "student-install.ps1") -Force
    Write-Host "Copied student-install.ps1" -ForegroundColor Green
}
if (Test-Path "scripts\student-install.sh") {
    Copy-Item "scripts\student-install.sh" (Join-Path $OutputDir "student-install.sh") -Force
    Write-Host "Copied student-install.sh" -ForegroundColor Green
}

# Create README
Write-Host "`nCreating README..." -ForegroundColor Yellow
$readmeContent = @"
# MCP Tutorial Distribution Package

## What's Included

- mcp-tutorial-image.tar - Docker image with all MCP servers (~250MB)
- docker-compose.mcp.yml - Service configuration
- mcp-config.json - MCP Connector config (for Typing Mind users)
- .env.example - Environment template
- student-install.ps1 - Windows installer
- student-install.sh - Mac/Linux installer

## Quick Start

### Windows (PowerShell)
``````powershell
.\student-install.ps1
``````

### Mac/Linux (Bash)
``````bash
chmod +x student-install.sh
./student-install.sh
``````

## Manual Installation

1. Load the image:
   ``````
   docker load -i mcp-tutorial-image.tar
   ``````

2. Copy .env.example to .env:
   ``````
   cp .env.example .env
   ``````

3. Start services:
   ``````
   docker compose -f docker-compose.mcp.yml up -d
   ``````

4. Configure Claude Desktop - see full documentation

## Requirements

- Docker Desktop 4.42+
- Claude Desktop (or Typing Mind)

## Support

See the complete setup guide in the full documentation or contact your instructor.
"@
$readmeContent | Out-File (Join-Path $OutputDir "README.md") -Encoding UTF8
Write-Host "Created README.md" -ForegroundColor Green

# Summary
Write-Host "`n=== Build Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Distribution created in: $OutputDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contents:" -ForegroundColor Cyan
Get-ChildItem $OutputDir | ForEach-Object {
    $size = if ($_.PSIsContainer) { "folder" } else { "$([math]::Round($_.Length / 1MB, 1)) MB" }
    Write-Host "  - $($_.Name) ($size)" -ForegroundColor White
}
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test on a clean machine (optional)" -ForegroundColor White
Write-Host "2. Upload to your LMS/Google Drive" -ForegroundColor White
Write-Host "3. Share with students" -ForegroundColor White
Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host ""
