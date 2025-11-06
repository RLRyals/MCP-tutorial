# Run MCP Writing System
# This script starts the MCP Writing System services
# Uses existing .env configuration (does NOT regenerate)
# Designed to be run every time the Electron app starts

param(
    [switch]$Verbose,
    [switch]$WaitForHealthy
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "MCP Writing System - Starting Services" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $ScriptDir ".env"
$dockerDir = Join-Path $ScriptDir "docker"

# ============================================
# Check Prerequisites
# ============================================
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Function to check if Docker Desktop is installed
function Test-DockerInstalled {
    $dockerPath = Get-Command docker -ErrorAction SilentlyContinue
    if ($dockerPath) {
        Write-Host "  Docker Desktop found" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ERROR: Docker Desktop not installed!" -ForegroundColor Red
        Write-Host "  Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 2  # Exit code 2 = Docker not installed
    }
}

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        $null = docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

# Function to start Docker Desktop on Windows
function Start-DockerDesktop {
    Write-Host "  Starting Docker Desktop..." -ForegroundColor Yellow

    # Try multiple common Docker Desktop paths
    $dockerPaths = @(
        "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe",
        "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe",
        "$env:LOCALAPPDATA\Docker\Docker Desktop.exe"
    )

    $dockerExe = $null
    foreach ($path in $dockerPaths) {
        if (Test-Path $path) {
            $dockerExe = $path
            break
        }
    }

    if (-not $dockerExe) {
        Write-Host "  ERROR: Could not find Docker Desktop executable" -ForegroundColor Red
        Write-Host "  Please start Docker Desktop manually" -ForegroundColor Yellow
        exit 3  # Exit code 3 = Docker installed but can't find executable
    }

    # Start Docker Desktop
    Start-Process -FilePath $dockerExe -WindowStyle Hidden

    # Wait for Docker to start (max 60 seconds)
    Write-Host "  Waiting for Docker to start..." -ForegroundColor Gray
    $maxWait = 60
    $waited = 0

    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 2
        $waited += 2

        if (Test-DockerRunning) {
            Write-Host "  Docker is ready" -ForegroundColor Green
            return $true
        }

        if ($Verbose) {
            Write-Host "  Waiting... ($waited/$maxWait seconds)" -ForegroundColor DarkGray
        }
    }

    Write-Host "  ERROR: Docker did not start in time" -ForegroundColor Red
    exit 4  # Exit code 4 = Docker started but didn't become ready
}

# Check if Docker is installed
if (-not (Test-DockerInstalled)) {
    exit 2
}

# Check if Docker is running, start if not
if (-not (Test-DockerRunning)) {
    Write-Host "  Docker is not running" -ForegroundColor Yellow
    Start-DockerDesktop
} else {
    Write-Host "  Docker is running" -ForegroundColor Green
}

# Check if .env exists
if (-not (Test-Path $envFile)) {
    Write-Host "  ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "  Run setup-all.ps1 first to complete initial setup" -ForegroundColor Yellow
    exit 1
}
Write-Host "  Configuration found" -ForegroundColor Green

# Check if Typing Mind files exist
$typingMindIndex = Join-Path $ScriptDir "typing-mind-static\index.html"
if (-not (Test-Path $typingMindIndex)) {
    Write-Host "  WARNING: Typing Mind files not found" -ForegroundColor Yellow
    Write-Host "  Run setup-all.ps1 to download them" -ForegroundColor Gray
}

Write-Host ""

# ============================================
# Start Docker Services
# ============================================
Write-Host "Starting Docker services..." -ForegroundColor Yellow

Push-Location $dockerDir
try {
    # Check if services are already running
    $runningContainers = docker ps --filter "name=mcp-" --format "{{.Names}}" 2>$null

    if ($runningContainers) {
        Write-Host "  Services already running:" -ForegroundColor Green
        foreach ($container in $runningContainers) {
            Write-Host "    - $container" -ForegroundColor Gray
        }

        # Just ensure they're healthy
        $needsRestart = $false
    } else {
        Write-Host "  Starting containers..." -ForegroundColor Yellow
        docker-compose --env-file ../.env up -d

        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Containers started" -ForegroundColor Green
        } else {
            Write-Host "  ERROR: Failed to start containers" -ForegroundColor Red
            exit 1
        }
    }
} finally {
    Pop-Location
}

Write-Host ""

# ============================================
# Wait for Services (if requested)
# ============================================
if ($WaitForHealthy) {
    Write-Host "Waiting for services to be healthy..." -ForegroundColor Yellow

    $maxAttempts = 30
    $attempt = 0

    # Wait for PostgreSQL
    Write-Host "  Checking PostgreSQL..." -ForegroundColor Gray
    while ($attempt -lt $maxAttempts) {
        $attempt++
        $postgresHealth = docker inspect --format='{{.State.Health.Status}}' mcp-writing-db 2>$null

        if ($postgresHealth -eq "healthy") {
            Write-Host "  PostgreSQL: healthy" -ForegroundColor Green
            break
        }

        if ($Verbose) {
            Write-Host "  Attempt $attempt/$maxAttempts - PostgreSQL: $postgresHealth" -ForegroundColor DarkGray
        }

        Start-Sleep -Seconds 2
    }

    if ($postgresHealth -ne "healthy") {
        Write-Host "  WARNING: PostgreSQL not healthy yet" -ForegroundColor Yellow
    }

    # Wait for MCP Connector
    Write-Host "  Checking MCP Connector..." -ForegroundColor Gray
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        $attempt++
        $connectorHealth = docker inspect --format='{{.State.Health.Status}}' mcp-connector 2>$null

        if ($connectorHealth -eq "healthy") {
            Write-Host "  MCP Connector: healthy" -ForegroundColor Green
            break
        }

        if ($Verbose) {
            Write-Host "  Attempt $attempt/$maxAttempts - MCP Connector: $connectorHealth" -ForegroundColor DarkGray
        }

        Start-Sleep -Seconds 2
    }

    if ($connectorHealth -ne "healthy") {
        Write-Host "  WARNING: MCP Connector not healthy yet" -ForegroundColor Yellow
    }

    Write-Host ""
}

# ============================================
# Get Connection Info
# ============================================
Write-Host "========================================" -ForegroundColor Green
Write-Host " Services Ready!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# Read auth token from .env
$authToken = "not-set"
if (Test-Path $envFile) {
    $authToken = (Select-String -Path $envFile -Pattern "MCP_AUTH_TOKEN=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
}

Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  PostgreSQL:      localhost:5432" -ForegroundColor White
Write-Host "  MCP Connector:   http://localhost:50880" -ForegroundColor White
Write-Host "  Typing Mind:     http://localhost:3000" -ForegroundColor White

Write-Host "`nMCP Connector:" -ForegroundColor Cyan
Write-Host "  URL: http://localhost:50880" -ForegroundColor White
Write-Host "  Token: $authToken" -ForegroundColor White

Write-Host "`nUseful Commands:" -ForegroundColor Cyan
Write-Host "  Stop:    cd docker && docker-compose --env-file ../.env down" -ForegroundColor White
Write-Host "  Logs:    cd docker && docker-compose --env-file ../.env logs -f" -ForegroundColor White
Write-Host "  Test:    .\test-docker-stack.ps1 -Verbose" -ForegroundColor White

Write-Host ""

# Return success
exit 0
