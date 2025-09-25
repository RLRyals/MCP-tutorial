# List Database Tables Script
# This script will list all tables in the PostgreSQL database

# Function to display colorful messages with error handling
function Write-ColorOutput($Message, $Color = "White") {
    try {
        Write-Host $Message -ForegroundColor $Color
    }
    catch {
        # Fallback to regular Write-Host if color output fails
        Write-Host $Message
    }
}

# Banner
Write-ColorOutput "========================================================" "Cyan"
Write-ColorOutput "       MCP Tutorial - List Database Tables Script       " "Cyan"
Write-ColorOutput "========================================================" "Cyan"
Write-ColorOutput ""

# Check if the database container is running
Write-ColorOutput "Checking if PostgreSQL database is running..." "Yellow"
$containerRunning = docker ps | Select-String "postgres"

if (-not $containerRunning) {
    Write-ColorOutput "Database container not detected. Starting database..." "Yellow"
    try {
        & "$PSScriptRoot\..\start-database.ps1"
        Write-ColorOutput "Database started successfully!" "Green"
    } catch {
        Write-ColorOutput "Error starting database: $_" "Red"
        Write-ColorOutput "Please start the database manually with: scripts\start-database.ps1" "Red"
        exit 1
    }
} else {
    Write-ColorOutput "Database container is running." "Green"
}

# Execute the SQL file to list all tables
Write-ColorOutput ""
Write-ColorOutput "Listing all tables in the database..." "Yellow"

try {
    $env:PGPASSWORD = "postgres"
    $result = docker exec postgres psql -U postgres -d mcp -c "
SELECT 
    table_schema, 
    table_name
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public' AND 
    table_type = 'BASE TABLE'
ORDER BY 
    table_schema, 
    table_name;"
    
    Write-ColorOutput "Tables retrieved successfully!" "Green"
    Write-ColorOutput ""
    Write-ColorOutput "Database Tables:" "Cyan"
    Write-ColorOutput "$result"
} catch {
    Write-ColorOutput "Error listing tables: $_" "Red"
    exit 1
}

Write-ColorOutput ""
Write-ColorOutput "========================================================" "Cyan"
Write-ColorOutput "                  Operation complete                    " "Cyan"
Write-ColorOutput "========================================================" "Cyan"