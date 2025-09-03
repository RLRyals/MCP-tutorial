@echo off
REM ======================================================================
REM MCP Tutorial Database Startup Script (Batch Version)
REM ======================================================================

echo.
echo ======================================================================
echo MCP Tutorial Database Startup Script
echo ======================================================================

REM Check if we're in the right directory
if not exist "docker-compose.yml" (
    echo ERROR: docker-compose.yml not found!
    echo Please run this script from the MCP-tutorial root directory.
    pause
    exit /b 1
)

REM Check for .env file
if not exist ".env" (
    echo WARNING: .env file not found!
    if exist "template.env" (
        echo Creating .env from template...
        copy "template.env" ".env" >nul
        echo Created .env file. Please review and update database credentials.
        echo.
    ) else (
        echo ERROR: template.env not found!
        echo Please create a .env file with database configuration.
        pause
        exit /b 1
    )
)

REM Check if Docker is available
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH!
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker Desktop is running
echo Checking Docker Desktop status...
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker Desktop is not running!
    echo.
    echo Please start Docker Desktop and then press any key to continue...
    pause
    
    REM Wait for Docker to be ready
    echo Waiting for Docker Desktop to be ready...
    :wait_loop
    docker info >nul 2>&1
    if errorlevel 1 (
        timeout /t 5 /nobreak >nul
        goto wait_loop
    )
    echo Docker Desktop is now ready!
) else (
    echo Docker Desktop is running!
)

REM Start the database services
echo.
echo Starting database services...
echo Running: docker-compose up -d
docker-compose up -d

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start database services!
    echo Check the error messages above and your .env configuration.
    pause
    exit /b 1
)

echo.
echo ======================================================================
echo SUCCESS: Database services started!
echo ======================================================================
echo.
echo Service Status:
docker-compose ps

echo.
echo Connection Information:
echo Database Host: localhost
echo Database Port: 5432
echo Database Name: mcp_series (or as configured in .env)
echo.
echo To view logs: docker-compose logs -f
echo To stop services: docker-compose down
echo.
pause
