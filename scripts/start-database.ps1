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
    try {
        Write-Host $Message -ForegroundColor $Color
    }
    catch {
        # Fallback to regular Write-Host if color output fails
        Write-Host $Message
    }
}

function Test-DockerDesktop {
    try {
        # Try a simple docker command that should work quickly
        docker ps --quiet 2>$null | Out-Null
        return $?
    }
    catch {
        return $false
    }
}

function Test-DockerProcess {
    $dockerProcesses = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
    return ($null -ne $dockerProcesses -and $dockerProcesses.Count -gt 0)
}

function Start-DockerDesktop {
    Write-ColorOutput "Docker Desktop is not running. Checking existing processes..." $InfoColor
    
    # Check if Docker Desktop process is already running
    if (Test-DockerProcess) {
        Write-ColorOutput "WARNING: Docker Desktop process found but not responding." $WarningColor
        Write-ColorOutput "Attempting to stop existing Docker Desktop processes..." $InfoColor
        
        try {
            Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 5  # Give it time to shut down
        }
        catch {
            Write-ColorOutput "ERROR: Failed to stop existing Docker Desktop process. Please stop it manually." $ErrorColor
            exit 1
        }
    }
    
    Write-ColorOutput "Attempting to start Docker Desktop..." $InfoColor
    
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
    
    Write-ColorOutput "Waiting for Docker Desktop to initialize (timeout: 60 seconds)..." $InfoColor
    $timeout = 60 # 1 minute timeout
    $elapsed = 0
    $checkInterval = 3 # Check every 3 seconds
    
    while ($elapsed -lt $timeout) {
        if (Test-DockerProcess) {
            # Once process exists, check if Docker is responsive
            if (Test-DockerDesktop) {
                Write-ColorOutput "Docker Desktop is ready!" $SuccessColor
                Start-Sleep -Seconds 2  # Brief pause to ensure stability
                return
            }
        }
        
        Start-Sleep -Seconds $checkInterval
        $elapsed += $checkInterval
        Write-Host "." -NoNewline -ForegroundColor $InfoColor
    }
    Write-Host ""
    
    Write-ColorOutput "ERROR: Docker Desktop failed to start within 60 seconds." $ErrorColor
    Write-ColorOutput "Please start Docker Desktop manually and run this script again." $WarningColor
    exit 1
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
        $runningContainers = docker compose ps --services --filter "status=running" 2>$null
        if ($runningContainers) {
            Write-ColorOutput "Database services are already running!" $SuccessColor
            $response = Read-Host "Would you like to restart them? (y/N)"
            if ($response -ne "y" -and $response -ne "Y") {
                Write-ColorOutput "Use -Force flag to restart services automatically." $InfoColor
                Write-ColorOutput "Current services status:" $InfoColor
                docker compose ps
                exit 0
            }
            Write-ColorOutput "Restarting services..." $InfoColor
            docker compose down
        }
    }
    catch {
        # If docker compose command fails, continue with startup
    }
}

# Start the database services
Write-ColorOutput "Starting database services..." $InfoColor
Write-ColorOutput "Running: docker compose up -d" $InfoColor

try {
    docker compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "=" * 70 $SuccessColor
        Write-ColorOutput "SUCCESS: Database services started!" $SuccessColor
        Write-ColorOutput "=" * 70 $SuccessColor
        
        # Verify all services are running
        Write-ColorOutput "`nVerifying services..." $InfoColor
        $services = docker compose ps --services
        
        if (-not $services) {
            Write-ColorOutput "ERROR: No services found in docker compose configuration!" $ErrorColor
            Write-ColorOutput "Check your docker-compose.yml file." $ErrorColor
            exit 1
        }
        
        $allServicesRunning = $true
        $failedServices = @()
        
        foreach ($service in $services) {
            $containerStatus = docker compose ps --format json 2>$null | ConvertFrom-Json | Where-Object { $_.Service -eq $service }
            
            if (-not $containerStatus) {
                $allServicesRunning = $false
                $failedServices += $service
            } else {
                # Check if container is running or starting (it might take time to fully start)
                if ($containerStatus.State -notmatch "running|starting") {
                    $allServicesRunning = $false
                    $failedServices += $service
                }
            }
        }
        
        if (-not $allServicesRunning) {
            Write-ColorOutput "`nERROR: Some services failed to start:" $ErrorColor
            foreach ($service in $failedServices) {
                Write-ColorOutput "- $service" $ErrorColor
                Write-ColorOutput ("Logs for " + $service + ":") $InfoColor
                docker compose logs $service 2>&1
            }
            Write-ColorOutput "`nPlease check the logs above for errors." $ErrorColor
            Write-ColorOutput "You may need to run 'docker compose down' and try again." $WarningColor
            exit 1
        }
        
        # Show service status
        Write-ColorOutput "`nService Status:" $InfoColor
        docker compose ps
        
        # Show connection information
        Write-ColorOutput "`nConnection Information:" $InfoColor
        Write-ColorOutput "Database Host: localhost" $InfoColor
        Write-ColorOutput "Database Port: 5432" $InfoColor
        Write-ColorOutput "Database Name: mcp_series (or as configured in .env)" $InfoColor
        Write-ColorOutput "`nTo view logs: docker compose logs -f" $InfoColor
        Write-ColorOutput "To stop services: docker compose down" $InfoColor
        
        # Check database health and container status
        Write-ColorOutput "`nWaiting for services to be fully ready..." $InfoColor
        $healthTimeout = 30
        $healthElapsed = 0
        
        # Keep track of which services have become healthy
        $healthyServices = @{}
        
        while ($healthElapsed -lt $healthTimeout) {
            $pendingServices = @()
            
            foreach ($service in $services) {
                # Skip if we already know this service is healthy
                if ($healthyServices[$service]) { continue }
                
                $containerInfo = docker compose ps --format json 2>$null | ConvertFrom-Json | 
                    Where-Object { $_.Service -eq $service }
                
                if ($containerInfo) {
                    # For services with health checks
                    if ($containerInfo.PSObject.Properties.Name -contains "Health") {
                        if ($containerInfo.Health -eq "healthy") {
                            $healthyServices[$service] = $true
                            Write-ColorOutput "Service '$service' is healthy!" $SuccessColor
                        } else {
                            $pendingServices += $service
                        }
                    }
                    # For services without health checks, just check if they're running
                    elseif ($containerInfo.State -eq "running") {
                        $healthyServices[$service] = $true
                        Write-ColorOutput "Service '$service' is running!" $SuccessColor
                    } else {
                        $pendingServices += $service
                    }
                } else {
                    $pendingServices += $service
                }
            }
            
            # If all services are healthy, we're done
            if ($pendingServices.Count -eq 0) {
                Write-ColorOutput "All services are ready!" $SuccessColor
                break
            }
            
            Start-Sleep -Seconds 2
            $healthElapsed += 2
            Write-Host "." -NoNewline -ForegroundColor $InfoColor
        }
        
        if ($healthElapsed -ge $healthTimeout) {
            Write-ColorOutput "`nWARNING: Some services are still initializing:" $WarningColor
            foreach ($service in $services) {
                if (-not $healthyServices[$service]) {
                    Write-ColorOutput "- $service" $WarningColor
                }
            }
            Write-ColorOutput "Services may still be starting. Check status with: docker compose ps" $InfoColor
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
