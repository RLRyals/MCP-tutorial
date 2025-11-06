# Complete Setup Script for MCP Writing System with Typing Mind
# This script automates the entire setup process

param(
    [switch]$SkipTypingMind,
    [switch]$Force,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "MCP Writing System - Complete Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# ============================================
# Step 1: Download Typing Mind Static Files
# ============================================
if (-not $SkipTypingMind) {
    Write-Host "Step 1: Downloading Typing Mind static files..." -ForegroundColor Yellow
    Write-Host "--------" -ForegroundColor Gray

    $downloadScript = Join-Path $ScriptDir "download-typingmind.ps1"

    if (Test-Path "$ScriptDir/typing-mind-static/index.html") {
        Write-Host "  Typing Mind files already exist" -ForegroundColor Green
        if ($Force) {
            Write-Host "  -Force specified, re-downloading..." -ForegroundColor Yellow
            & $downloadScript -Force
        } else {
            Write-Host "  Skipping download (use -Force to re-download)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  Downloading from GitHub..." -ForegroundColor Yellow
        & $downloadScript
    }

    Write-Host ""
} else {
    Write-Host "Step 1: Skipping Typing Mind download (-SkipTypingMind specified)" -ForegroundColor Gray
    Write-Host ""
}

# ============================================
# Step 2: Generate Environment Configuration
# ============================================
Write-Host "Step 2: Generating environment configuration..." -ForegroundColor Yellow
Write-Host "--------" -ForegroundColor Gray

$envFile = Join-Path $ScriptDir ".env"
$generateScript = Join-Path $ScriptDir "generate-env.ps1"

if (Test-Path $envFile) {
    Write-Host "  .env file already exists" -ForegroundColor Green
    if ($Force) {
        Write-Host "  -Force specified, regenerating..." -ForegroundColor Yellow
        & $generateScript -Force
    } else {
        Write-Host "  Skipping generation (use -Force to regenerate)" -ForegroundColor Gray
    }
} else {
    Write-Host "  Creating new .env file..." -ForegroundColor Yellow
    & $generateScript
}

Write-Host ""

# ============================================
# Step 3: Start Docker Stack
# ============================================
Write-Host "Step 3: Starting Docker stack..." -ForegroundColor Yellow
Write-Host "--------" -ForegroundColor Gray

$dockerDir = Join-Path $ScriptDir "docker"

# Function to check if Docker Desktop is installed
function Test-DockerInstalled {
    $dockerPath = Get-Command docker -ErrorAction SilentlyContinue
    if ($dockerPath) {
        return $true
    }
    return $false
}

# Function to test if Docker is running
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
        Write-Host "  Please start Docker Desktop manually and try again" -ForegroundColor Yellow
        return $false
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
    return $false
}

# Check if Docker is installed
if (-not (Test-DockerInstalled)) {
    Write-Host "  ERROR: Docker Desktop not installed!" -ForegroundColor Red
    Write-Host "  Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 2
}

# Check if Docker is running, start if not
if (-not (Test-DockerRunning)) {
    Write-Host "  Docker is not running" -ForegroundColor Yellow
    if (-not (Start-DockerDesktop)) {
        exit 3
    }
} else {
    Write-Host "  Docker is running" -ForegroundColor Green
}

# Start the stack
Push-Location $dockerDir
try {
    Write-Host "  Bringing up Docker services..." -ForegroundColor Yellow

    $buildFlag = ""
    if ($Force) {
        $buildFlag = "--build"
    }

    docker-compose --env-file ../.env up -d $buildFlag

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Docker services started successfully" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: Failed to start Docker services" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

Write-Host ""

# ============================================
# Step 4: Wait for Services to be Healthy
# ============================================
Write-Host "Step 4: Waiting for services to be healthy..." -ForegroundColor Yellow
Write-Host "--------" -ForegroundColor Gray

$maxAttempts = 30
$attempt = 0

# Wait for PostgreSQL
Write-Host "  Waiting for PostgreSQL..." -ForegroundColor Gray
while ($attempt -lt $maxAttempts) {
    $attempt++
    $postgresHealth = docker inspect --format='{{.State.Health.Status}}' mcp-writing-db 2>$null

    if ($postgresHealth -eq "healthy") {
        Write-Host "  PostgreSQL is healthy" -ForegroundColor Green
        break
    }

    if ($Verbose) {
        Write-Host "  Attempt $attempt/$maxAttempts - PostgreSQL: $postgresHealth" -ForegroundColor DarkGray
    }

    Start-Sleep -Seconds 2
}

if ($postgresHealth -ne "healthy") {
    Write-Host "  ERROR: PostgreSQL did not become healthy" -ForegroundColor Red
    exit 1
}

# Wait for MCP Connector
Write-Host "  Waiting for MCP Connector..." -ForegroundColor Gray
Write-Host "  (Initial startup may take 45-60 seconds)" -ForegroundColor DarkGray
$attempt = 0
$maxConnectorAttempts = 60  # Increased from 30 to allow more time
while ($attempt -lt $maxConnectorAttempts) {
    $attempt++
    $connectorHealth = docker inspect --format='{{.State.Health.Status}}' mcp-connector 2>$null

    if ($connectorHealth -eq "healthy") {
        Write-Host "  MCP Connector is healthy" -ForegroundColor Green
        break
    }

    if ($Verbose -or ($attempt % 10 -eq 0)) {
        Write-Host "  Attempt $attempt/$maxConnectorAttempts - MCP Connector: $connectorHealth" -ForegroundColor DarkGray
    }

    Start-Sleep -Seconds 2
}

if ($connectorHealth -ne "healthy") {
    Write-Host "  ERROR: MCP Connector did not become healthy" -ForegroundColor Red
    Write-Host "  Check logs with: cd docker && docker-compose logs mcp-connector" -ForegroundColor Yellow
    exit 1
}

# Check Typing Mind if not skipped
if (-not $SkipTypingMind) {
    Write-Host "  Waiting for Typing Mind web server..." -ForegroundColor Gray
    $attempt = 0
    $typingMindHealthy = $false

    while ($attempt -lt 10) {
        $attempt++
        $typingMindRunning = docker ps --filter "name=typing-mind-web" --format "{{.Status}}" 2>$null

        if ($typingMindRunning -match "Up") {
            Write-Host "  Typing Mind web server is running" -ForegroundColor Green
            $typingMindHealthy = $true
            break
        }

        if ($Verbose) {
            Write-Host "  Attempt $attempt/10 - Typing Mind: $typingMindRunning" -ForegroundColor DarkGray
        }

        Start-Sleep -Seconds 2
    }

    if (-not $typingMindHealthy) {
        Write-Host "  WARNING: Typing Mind web server did not start" -ForegroundColor Yellow
        Write-Host "  This may be normal if static files weren't downloaded" -ForegroundColor Gray
    }
}

Write-Host ""

# ============================================
# Step 5: Run Health Checks
# ============================================
Write-Host "Step 5: Running health checks..." -ForegroundColor Yellow
Write-Host "--------" -ForegroundColor Gray

# Test database
Write-Host "  Testing database connection..." -ForegroundColor Gray
$dbTest = docker exec mcp-writing-db psql -U writer -d mcp_writing_db -c "SELECT COUNT(*) FROM migrations;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Database is accessible" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Database connection failed" -ForegroundColor Red
    Write-Host "  $dbTest" -ForegroundColor Gray
    exit 1
}

# Test MCP Connector
Write-Host "  Testing MCP Connector..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:50880/ping" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  MCP Connector is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "  ERROR: MCP Connector is not responding" -ForegroundColor Red
    exit 1
}

# Test Typing Mind if not skipped
if (-not $SkipTypingMind) {
    Write-Host "  Testing Typing Mind web server..." -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "  Typing Mind web server is responding" -ForegroundColor Green
        }
    } catch {
        Write-Host "  WARNING: Typing Mind web server is not responding" -ForegroundColor Yellow
        Write-Host "  Make sure you downloaded the static files" -ForegroundColor Gray
    }
}

Write-Host ""

# ============================================
# Success Summary
# ============================================
Write-Host "========================================" -ForegroundColor Green
Write-Host " Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# Read auth token from .env
$authToken = "not-set"
if (Test-Path $envFile) {
    $authToken = (Select-String -Path $envFile -Pattern "MCP_AUTH_TOKEN=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
}

Write-Host "Services Running:" -ForegroundColor Cyan
Write-Host "  PostgreSQL Database:  http://localhost:5432" -ForegroundColor White
Write-Host "  MCP Connector:        http://localhost:50880" -ForegroundColor White

if (-not $SkipTypingMind) {
    Write-Host "  Typing Mind Web:      http://localhost:3000" -ForegroundColor White
}

Write-Host "`nMCP Connector Configuration:" -ForegroundColor Cyan
Write-Host "  URL: http://localhost:50880" -ForegroundColor White
Write-Host "  Auth Token: $authToken" -ForegroundColor White

if (-not $SkipTypingMind) {
    Write-Host "`nNext Steps:" -ForegroundColor Cyan
    Write-Host "  1. Open http://localhost:3000 in your browser" -ForegroundColor White
    Write-Host "  2. Enter your AI provider API keys" -ForegroundColor White
    Write-Host "  3. Go to Settings → Advanced → Model Context Protocol" -ForegroundColor White
    Write-Host "  4. Add MCP Connector with the URL and token above" -ForegroundColor White
} else {
    Write-Host "`nNext Steps:" -ForegroundColor Cyan
    Write-Host "  1. Configure your Typing Mind instance" -ForegroundColor White
    Write-Host "  2. Add MCP Connector with the URL and token above" -ForegroundColor White
}

Write-Host "`nUseful Commands:" -ForegroundColor Cyan
Write-Host "  View logs:  cd docker && docker-compose logs -f" -ForegroundColor White
Write-Host "  Stop:       cd docker && docker-compose down" -ForegroundColor White
Write-Host "  Restart:    cd docker && docker-compose restart" -ForegroundColor White

Write-Host ""
