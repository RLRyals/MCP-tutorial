# ======================================================================
# MCP Tutorial Database Startup Script
# ======================================================================
# This script ensures Docker Desktop is running and starts the database
# services for the MCP Tutorial project.

param(
    [switch]$Force,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
MCP Tutorial Database Startup Script

USAGE:
    .\start-database.ps1 [-Force] [-Help]

OPTIONS:
    -Force    Force restart even if containers are already running
    -Help     Show this help message

DESCRIPTION:
    This script will:
    1. Check if Docker Desktop is running
    2. Start Docker Desktop if needed (with user confirmation)
    3. Wait for Docker daemon to be ready
    4. Start the database services using docker-compose
    5. Show service status and connection information
"@
    exit 0
}

# Colors for output
$ErrorColor = "Red"
$WarningColor = "Yellow"
$SuccessColor = "Green"
$InfoColor = "Cyan"

function Write-ColorOutput($Message, $Color = "White") {
    Write-Host $Message -ForegroundColor $Color
}

function Test-DockerDesktop {
    try {
        $dockerInfo = docker info 2>$null
        return $?
    }
    catch {
        return $false
    }
}

function Start-DockerDesktop {
    Write-ColorOutput "Docker Desktop is not running. Attempting to start it..." $InfoColor
    
    # Common Docker Desktop installation paths
    $dockerPaths = @(
        "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe",
        "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe",
        "${env:USERPROFILE}\AppData\Local\Docker\Docker Desktop.exe"
    )
    
    $dockerExe = $null
    foreach ($path in $dockerPaths) {
        if (Test-Path $path) {
            $dockerExe = $path
            break
        }
    }
    
    if (-not $dockerExe) {
        Write-ColorOutput "ERROR: Docker Desktop executable not found!" $ErrorColor
        Write-ColorOutput "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" $ErrorColor
        Write-ColorOutput "Or start Docker Desktop manually and run this script again." $WarningColor
        exit 1
    }
    
    # Ask user for confirmation
    $response = Read-Host "Would you like to start Docker Desktop? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-ColorOutput "Please start Docker Desktop manually and run this script again." $WarningColor
        exit 1
    }
    
    Write-ColorOutput "Starting Docker Desktop..." $InfoColor
    Start-Process -FilePath $dockerExe -WindowStyle Hidden
    
    # Wait for Docker Desktop to start
    Write-ColorOutput "Waiting for Docker Desktop to start (this may take 30-60 seconds)..." $InfoColor
    $timeout = 120 # 2 minutes timeout
    $elapsed = 0
    
    while (-not (Test-DockerDesktop) -and $elapsed -lt $timeout) {
        Start-Sleep -Seconds 5
        $elapsed += 5
        Write-Host "." -NoNewline -ForegroundColor $InfoColor
    }
    Write-Host ""
    
    if (-not (Test-DockerDesktop)) {
        Write-ColorOutput "ERROR: Docker Desktop failed to start within $timeout seconds." $ErrorColor
        Write-ColorOutput "Please start Docker Desktop manually and run this script again." $WarningColor
        exit 1
    }
    
    Write-ColorOutput "Docker Desktop is now running!" $SuccessColor
}

function Test-EnvironmentFile {
    $envFile = ".\.env"
    if (-not (Test-Path $envFile)) {
        Write-ColorOutput "WARNING: .env file not found!" $WarningColor
        Write-ColorOutput "Creating .env from template..." $InfoColor
        
        if (Test-Path ".\template.env") {
            Copy-Item ".\template.env" ".\.env"
            Write-ColorOutput "Created .env file from template. Please review and update the database credentials." $WarningColor
        } else {
            Write-ColorOutput "ERROR: template.env not found. Please create a .env file with database configuration." $ErrorColor
            exit 1
        }
    }
}

# ======================================================================
# MAIN SCRIPT EXECUTION
# ======================================================================

Write-ColorOutput "=" * 70 $InfoColor
Write-ColorOutput "MCP Tutorial Database Startup Script" $InfoColor
Write-ColorOutput "=" * 70 $InfoColor

# Check if we're in the right directory
if (-not (Test-Path ".\docker-compose.yml")) {
    Write-ColorOutput "ERROR: docker-compose.yml not found!" $ErrorColor
    Write-ColorOutput "Please run this script from the MCP-tutorial root directory." $ErrorColor
    exit 1
}

# Check environment file
Test-EnvironmentFile

# Check if Docker Desktop is running
Write-ColorOutput "Checking Docker Desktop status..." $InfoColor
if (-not (Test-DockerDesktop)) {
    Start-DockerDesktop
} else {
    Write-ColorOutput "Docker Desktop is running!" $SuccessColor
}

# Check if services are already running (unless -Force is used)
if (-not $Force) {
    try {
        $runningContainers = docker-compose ps --services --filter "status=running" 2>$null
        if ($runningContainers) {
            Write-ColorOutput "Database services are already running!" $SuccessColor
            $response = Read-Host "Would you like to restart them? (y/N)"
            if ($response -ne "y" -and $response -ne "Y") {
                Write-ColorOutput "Use -Force flag to restart services automatically." $InfoColor
                Write-ColorOutput "Current services status:" $InfoColor
                docker-compose ps
                exit 0
            }
            Write-ColorOutput "Restarting services..." $InfoColor
            docker-compose down
        }
    }
    catch {
        # If docker-compose command fails, continue with startup
    }
}

# Start the database services
Write-ColorOutput "Starting database services..." $InfoColor
Write-ColorOutput "Running: docker-compose up -d" $InfoColor

try {
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "=" * 70 $SuccessColor
        Write-ColorOutput "SUCCESS: Database services started!" $SuccessColor
        Write-ColorOutput "=" * 70 $SuccessColor
        
        # Show service status
        Write-ColorOutput "`nService Status:" $InfoColor
        docker-compose ps
        
        # Show connection information
        Write-ColorOutput "`nConnection Information:" $InfoColor
        Write-ColorOutput "Database Host: localhost" $InfoColor
        Write-ColorOutput "Database Port: 5432" $InfoColor
        Write-ColorOutput "Database Name: mcp_series (or as configured in .env)" $InfoColor
        Write-ColorOutput "`nTo view logs: docker-compose logs -f" $InfoColor
        Write-ColorOutput "To stop services: docker-compose down" $InfoColor
        
        # Check database health
        Write-ColorOutput "`nWaiting for database to be ready..." $InfoColor
        $healthTimeout = 30
        $healthElapsed = 0
        
        while ($healthElapsed -lt $healthTimeout) {
            $health = docker-compose ps --format json | ConvertFrom-Json | Where-Object { $_.Service -eq "postgres" } | Select-Object -ExpandProperty Health -ErrorAction SilentlyContinue
            if ($health -eq "healthy") {
                Write-ColorOutput "Database is healthy and ready for connections!" $SuccessColor
                break
            }
            Start-Sleep -Seconds 2
            $healthElapsed += 2
            Write-Host "." -NoNewline -ForegroundColor $InfoColor
        }
        
        if ($healthElapsed -ge $healthTimeout) {
            Write-ColorOutput "`nWARNING: Database health check timed out. Check logs with: docker-compose logs postgres" $WarningColor
        }
        
    } else {
        Write-ColorOutput "ERROR: Failed to start database services!" $ErrorColor
        Write-ColorOutput "Check the error messages above and your .env configuration." $ErrorColor
        exit 1
    }
}
catch {
    Write-ColorOutput "ERROR: An unexpected error occurred: $($_.Exception.Message)" $ErrorColor
    exit 1
}
