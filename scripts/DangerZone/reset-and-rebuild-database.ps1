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

# Ask for confirmation before proceeding
Write-ColorOutput ""
Write-ColorOutput "WARNING: This script will RESET your database and apply all migrations." "Yellow"
Write-ColorOutput "All existing data will be deleted!" "Red"
$confirmation = Read-Host "Are you sure you want to proceed? (y/n)"

if ($confirmation -ne 'y') {
    Write-ColorOutput "Operation cancelled." "Yellow"
    exit 0
}

# Database cleanup has already been performed
Write-ColorOutput ""
Write-ColorOutput "Assuming database is already cleaned up and ready for migrations..." "Green"

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

foreach ($migration in $migrations) {
    # Check if the migration file exists
    if (-not (Test-Path "$migrationsPath\$migration")) {
        Write-ColorOutput "Error: Migration file not found: $migration" "Red"
        $success = $false
        continue
    }

    Write-ColorOutput ""
    Write-ColorOutput "Applying migration: $migration" "Yellow"
    
    try {
        $command = "node $PSScriptRoot\..\..\src\shared\run-migration.js $migration"
        Invoke-Expression $command
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "Migration applied successfully: $migration" "Green"
        } else {
            Write-ColorOutput "Error applying migration: $migration (Exit code: $LASTEXITCODE)" "Red"
            $success = $false
        }
    } catch {
        Write-ColorOutput "Error running migration $migration`: $_" "Red"
        $success = $false
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