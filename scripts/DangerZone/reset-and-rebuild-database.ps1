# Reset and Rebuild Database Script
# This script will clean the database and then run all migrations in order

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
Write-ColorOutput "    MCP Tutorial - Database Reset and Rebuild Script    " "Cyan"
Write-ColorOutput "========================================================" "Cyan"
Write-ColorOutput ""

# Function to load environment variables from .env file
function Load-EnvFile {
    param(
        [string]$EnvFilePath
    )
    
    if (Test-Path $EnvFilePath) {
        $envContent = Get-Content $EnvFilePath -ErrorAction SilentlyContinue
        $envVars = @{}
        
        foreach ($line in $envContent) {
            if ($line -match '^\s*([^#][^=]+)=(.*)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                # Remove surrounding quotes if present
                $value = $value -replace '^[''"]|[''"]$', ''
                $envVars[$key] = $value
            }
        }
        return $envVars
    }
    return @{}
}

# Set default values
$containerName = "postgres" # Default container name
$dbName = "mcp_series" # Default database name
$dbUser = "postgres" # Default user
$dbPassword = $null

# Load variables from .env file
$envFilePath = "$PSScriptRoot\..\..\\.env"
if (Test-Path $envFilePath) {
    $envVars = Load-EnvFile -EnvFilePath $envFilePath
    
    # Override defaults with values from .env if they exist
    if ($envVars.ContainsKey("POSTGRES_CONTAINER_NAME")) { $containerName = $envVars["POSTGRES_CONTAINER_NAME"] }
    if ($envVars.ContainsKey("POSTGRES_DB")) { $dbName = $envVars["POSTGRES_DB"] }
    if ($envVars.ContainsKey("POSTGRES_USER")) { $dbUser = $envVars["POSTGRES_USER"] }
    if ($envVars.ContainsKey("POSTGRES_PASSWORD")) { $dbPassword = $envVars["POSTGRES_PASSWORD"] }
} else {
    Write-ColorOutput "Error: .env file not found at: $envFilePath" "Red"
    Write-ColorOutput "Please ensure you have a properly configured .env file" "Yellow"
    exit 1
}

# Check if the database container is running
Write-ColorOutput "Checking if PostgreSQL database is running (container: $containerName)..." "Yellow"
$containerRunning = docker ps | Select-String $containerName

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
    Write-ColorOutput "Database container ($containerName) is running." "Green"
}

# Ask for confirmation before proceeding
Write-ColorOutput ""
Write-ColorOutput "WARNING: This script will RESET your database and apply all migrations." "Yellow"
Write-ColorOutput "All existing data will be deleted!" "Red"
$confirmation = Read-Host "Are you sure you want to proceed? (y/n)"

if ($confirmation -ne 'y') {
    Write-ColorOutput "Operation cancelled." "Yellow"
    exit 0
}

# Drop all tables from the database
Write-ColorOutput ""
Write-ColorOutput "Dropping all tables from the database..." "Yellow"

# Check if the existing drop-all-tables.sql script exists
$dropSqlPath = "$PSScriptRoot\drop-all-tables.sql"
if (Test-Path $dropSqlPath) {
    Write-ColorOutput "Using existing drop tables SQL script..." "Green"
} else {
    Write-ColorOutput "Error: drop-all-tables.sql not found at $dropSqlPath" "Red"
    Write-ColorOutput "Please make sure the script exists before running this reset script." "Red"
    exit 1
}

# Write-ColorOutput database connection information
Write-ColorOutput "Database connection information:" "Yellow"
Write-ColorOutput "Container name: $containerName" "Green"
Write-ColorOutput "Database name: $dbName" "Green"
Write-ColorOutput "Database user: $dbUser" "Green"

# Check if container exists
$containerExists = docker ps | Select-String $containerName
if (-not $containerExists) {
    Write-ColorOutput "Error: Container '$containerName' not found!" "Red"
    Write-ColorOutput "Please make sure the database container is running with name: $containerName" "Red"
    Write-ColorOutput "You may need to update the POSTGRES_CONTAINER_NAME in your .env file" "Yellow"
    exit 1
}

# Execute the SQL file
try {
    Write-ColorOutput "Using container name: $containerName" "Yellow"
    Write-ColorOutput "Using database: $dbName" "Yellow"
    Write-ColorOutput "Using user: $dbUser" "Yellow"
    
    # The password is already set in the container from the POSTGRES_PASSWORD env variable
    # We don't need to set PGPASSWORD separately
    
    docker exec $containerName psql -U $dbUser -d $dbName -f /scripts/DangerZone/drop-all-tables.sql
    Write-ColorOutput "All tables dropped successfully!" "Green"
} catch {
    Write-ColorOutput "Error dropping tables: $_" "Red"
    Write-ColorOutput "Check that your PostgreSQL container is running and properly configured." "Yellow"
    Write-ColorOutput "Verify your database credentials in the .env file." "Yellow"
    exit 1
}

# Check that run-migration.js exists
$migrationRunnerPath = "$PSScriptRoot\..\..\src\shared\run-migration.js"
if (-not (Test-Path $migrationRunnerPath)) {
    Write-ColorOutput "Error: Migration runner script not found at: $migrationRunnerPath" "Red"
    Write-ColorOutput "Please make sure the script exists before running migrations." "Red"
    exit 1
}

# Define migration files in order
$migrations = @(
    "001_create_core_schema.sql",
    "002_update_series_schema.sql",
    "003_add_character_schema.sql",
    "004_plot_structure_and_universal_framework.sql",
    "005_update_author_email_constraint.sql",
    "006_add_book_metadata_plot_thread_and_tropes_tables.sql",
    "007_add_event_chapter_mapping.sql",
    "008_add_world_schema.sql",
    "009_writing_migration.sql",
    "010_update_table_schema.sql",
    "011_Universal_Schema_Migrations.sql"
)

# Run all migrations in order
Write-ColorOutput ""
Write-ColorOutput "Starting migrations..." "Cyan"

$migrationsPath = "$PSScriptRoot\..\..\migrations"
$success = $true

# The migrations will use the DATABASE_URL from the .env file directly
# No need to modify environment variables as they're already set correctly in the .env file
# The Node.js migration script will read from .env automatically

foreach ($migration in $migrations) {
    # Check if the migration file exists
    if (-not (Test-Path "$migrationsPath\$migration")) {
        Write-ColorOutput "Error: Migration file not found: $migration" "Red"
        Write-ColorOutput "Stopping migration process due to missing file." "Red"
        exit 1
    }

    Write-ColorOutput ""
    Write-ColorOutput "Applying migration: $migration" "Yellow"
    
    try {
        # Pass environment with correct DATABASE_URL directly to the migration script
        $command = "node `"$PSScriptRoot\..\..\src\shared\run-migration.js`" `"$migration`""
        Write-ColorOutput "Running command: $command" "Gray"
        
        # Change to the project root directory before running the migration
        Push-Location "$PSScriptRoot\..\.."
        try {
            $result = Invoke-Expression $command
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "Migration applied successfully: $migration" "Green"
            } else {
                Write-ColorOutput "Error applying migration: $migration (Exit code: $LASTEXITCODE)" "Red"
                Write-ColorOutput "Stopping migration process due to failure." "Red"
                Pop-Location
                exit 1
            }
        } finally {
            Pop-Location
        }
    } catch {
        Write-ColorOutput "Error running migration $migration`: $_" "Red"
        Write-ColorOutput "Stopping migration process due to error." "Red"
        exit 1
    }
}

# Report final status
Write-ColorOutput ""
if ($success) {
    Write-ColorOutput "All migrations have been successfully applied!" "Green"
    Write-ColorOutput "Your database is now ready to use with the updated schema." "Green"
} else {
    Write-ColorOutput "Some migrations failed. Please check the error messages above." "Red"
    Write-ColorOutput "You may need to fix issues and rerun this script." "Red"
}

Write-ColorOutput ""
Write-ColorOutput "========================================================" "Cyan"
Write-ColorOutput "                  Operation complete                    " "Cyan"
Write-ColorOutput "========================================================" "Cyan"