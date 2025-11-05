    # Test Docker Stack for MCP Writing System
    # This script verifies the Docker setup is working correctly

param(
    [switch]$Build,
    [switch]$Clean,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "MCP Writing System - Docker Stack Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Change to docker directory
$dockerDir = Join-Path $PSScriptRoot "docker"
Push-Location $dockerDir


    # Function to test if Docker is running
    function Test-DockerRunning {
        Write-Host "Checking Docker status..." -ForegroundColor Yellow
        try {
            $null = docker ps 2>&1
            Write-Host " Docker is running" -ForegroundColor Green
            return $true
        } catch {
            Write-Host " Docker is not running" -ForegroundColor Red
            Write-Host "  Please start Docker Desktop and try again" -ForegroundColor Yellow
            return $false
        }
    }

    # Function to check if .env exists
    function Test-EnvFile {
        $envFile = Join-Path $PSScriptRoot ".env"
        $envExample = Join-Path $PSScriptRoot ".env.example"

        if (Test-Path $envFile) {
            Write-Host " .env file found" -ForegroundColor Green
            return $true
        } else {
            Write-Host " .env file not found" -ForegroundColor Red
            if (Test-Path $envExample) {
                Write-Host "  Creating .env from .env.example..." -ForegroundColor Yellow
                Copy-Item $envExample $envFile
                Write-Host "    Please edit .env and set secure passwords!" -ForegroundColor Yellow
                Write-Host "  Required: POSTGRES_PASSWORD, MCP_AUTH_TOKEN" -ForegroundColor Yellow
                return $false
            }
        }
    }

    # Function to clean up containers
    function Remove-Stack {
        Write-Host "`nCleaning up existing containers..." -ForegroundColor Yellow
        docker-compose --env-file ../.env down -v
        Write-Host " Cleanup complete" -ForegroundColor Green
    }

    # Function to build and start stack
    function Start-Stack {
        Write-Host "`nStarting Docker stack..." -ForegroundColor Yellow

        if ($Build) {
            Write-Host "Building images..." -ForegroundColor Yellow
            docker-compose --env-file ../.env build --no-cache
        }

        Write-Host "Starting containers..." -ForegroundColor Yellow
        docker-compose --env-file ../.env up -d

        Write-Host " Containers started" -ForegroundColor Green
    }

    # Function to wait for services
    function Wait-ForServices {
        Write-Host "`nWaiting for services to be healthy..." -ForegroundColor Yellow

        $maxAttempts = 30
        $attempt = 0

        while ($attempt -lt $maxAttempts) {
            $attempt++
            Write-Host "  Attempt $attempt/$maxAttempts..." -NoNewline

            $postgresHealth = docker inspect --format='{{.State.Health.Status}}' mcp-writing-db 2>$null
            $connectorHealth = docker inspect --format='{{.State.Health.Status}}' mcp-connector 2>$null

            if ($postgresHealth -eq "healthy" -and $connectorHealth -eq "healthy") {
                Write-Host " " -ForegroundColor Green
                return $true
            }

            Write-Host " PostgreSQL: $postgresHealth, MCP Connector: $connectorHealth" -ForegroundColor Gray
            Start-Sleep -Seconds 2
        }

        Write-Host "`n Services did not become healthy in time" -ForegroundColor Red
        return $false
    }

    # Function to test database connection
    function Test-Database {
        Write-Host "`nTesting database connection..." -ForegroundColor Yellow

        $result = docker exec mcp-writing-db psql -U writer -d mcp_writing_db -c "SELECT COUNT(*) FROM migrations;" 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host " Database is accessible" -ForegroundColor Green
            Write-Host "  Migrations table exists" -ForegroundColor Gray
            return $true
        } else {
            Write-Host " Database connection failed" -ForegroundColor Red
            return $false
        }
    }

    # Function to test MCP Connector
    function Test-MCPConnector {
        Write-Host "`nTesting MCP Connector..." -ForegroundColor Yellow

        try {
            $response = Invoke-WebRequest -Uri "http://localhost:50880/health" -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host " MCP Connector is responding" -ForegroundColor Green
                Write-Host "  Endpoint: http://localhost:50880" -ForegroundColor Gray
                return $true
            }
        } catch {
            Write-Host " MCP Connector is not responding" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
            return $false
        }
    }

    # Function to show container logs
    function Show-Logs {
        if ($Verbose) {
            Write-Host "`nContainer Logs:" -ForegroundColor Cyan
            Write-Host "================`n" -ForegroundColor Cyan

            Write-Host "PostgreSQL Logs:" -ForegroundColor Yellow
            docker logs mcp-writing-db --tail 20

            Write-Host "`nMCP Connector Logs:" -ForegroundColor Yellow
            docker logs mcp-connector --tail 20
        }
    }

    # Function to show connection info
    function Show-ConnectionInfo {
        Write-Host "`n========================================" -ForegroundColor Cyan
        Write-Host "Connection Information" -ForegroundColor Cyan
        Write-Host "========================================`n" -ForegroundColor Cyan

        # Read auth token from .env
        $envFile = Join-Path $PSScriptRoot ".env"
        $authToken = "not-set"
        if (Test-Path $envFile) {
            $authToken = (Select-String -Path $envFile -Pattern "MCP_AUTH_TOKEN=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
        }

        Write-Host "MCP Connector Endpoint:" -ForegroundColor Yellow
        Write-Host "  URL: http://localhost:50880" -ForegroundColor White
        Write-Host "  Auth Token: $authToken" -ForegroundColor White

        Write-Host "`nPostgreSQL Database:" -ForegroundColor Yellow
        Write-Host "  Host: localhost" -ForegroundColor White
        Write-Host "  Port: 5432" -ForegroundColor White
        Write-Host "  Database: mcp_writing_db" -ForegroundColor White
        Write-Host "  User: writer" -ForegroundColor White

        Write-Host "`nTyping Mind Configuration:" -ForegroundColor Yellow
        Write-Host "  1. Open Typing Mind in your browser" -ForegroundColor White
        Write-Host "  2. Go to Settings → Advanced → Model Context Protocol" -ForegroundColor White
        Write-Host "  3. Add MCP Connector:" -ForegroundColor White
        Write-Host "     - URL: http://localhost:50880" -ForegroundColor Gray
        Write-Host "     - Token: $authToken" -ForegroundColor Gray
        Write-Host ""
    }
 try {
    
        # Main test sequence
        if ($Clean) {
            Remove-Stack
            Write-Host "`nCleanup complete. Run without -Clean to start." -ForegroundColor Green
            exit 0
        }

        # Run tests
        if (-not (Test-DockerRunning)) { exit 1 }
        if (-not (Test-EnvFile)) { exit 1 }

        Remove-Stack
        Start-Stack

        if (-not (Wait-ForServices)) {
            Show-Logs
            exit 1
        }

        $dbOk = Test-Database
        $connectorOk = Test-MCPConnector

        Show-Logs

        if ($dbOk -and $connectorOk) {
            Write-Host "`n========================================" -ForegroundColor Green
            Write-Host " All tests passed!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green

            Show-ConnectionInfo

            Write-Host "`nNext Steps:" -ForegroundColor Cyan
            Write-Host "  • Configure Typing Mind with the connection info above" -ForegroundColor White
            Write-Host "  • View logs: docker-compose logs -f" -ForegroundColor White
            Write-Host "  • Stop stack: docker-compose down" -ForegroundColor White
            Write-Host ""

            exit 0
        } else {
            Write-Host "`n========================================" -ForegroundColor Red
            Write-Host " Some tests failed" -ForegroundColor Red
            Write-Host "========================================" -ForegroundColor Red
            Write-Host "`nCheck logs with: docker-compose logs" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host "`nERROR: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    } finally {
        Pop-Location
    }
