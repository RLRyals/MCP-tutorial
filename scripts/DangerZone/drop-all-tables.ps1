# Drop All Tables Script
# This script will drop all tables in the database to allow for a clean retest

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
Write-ColorOutput "          MCP Tutorial - Drop All Tables Script         " "Cyan"
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
Write-ColorOutput "WARNING: This script will DROP ALL TABLES in your database!" "Yellow"
Write-ColorOutput "All existing data will be permanently deleted!" "Red"
$confirmation = Read-Host "Are you sure you want to proceed? (y/n)"

if ($confirmation -ne 'y') {
    Write-ColorOutput "Operation cancelled." "Yellow"
    exit 0
}

# Create SQL file with DROP commands
$dropSqlPath = "$PSScriptRoot\drop-all-tables.sql"
Write-ColorOutput "Creating drop tables SQL script..." "Yellow"

$dropSqlContent = @'
-- Drop All Tables Script
-- This script drops all tables in the database in the correct order to handle dependencies

BEGIN;

-- Disable triggers temporarily to avoid issues with cascading deletes
SET session_replication_role = 'replica';

-- Drop tables in reverse order of dependencies

-- Drop character/chapter relationship tables
DROP TABLE IF EXISTS character_chapter_presence CASCADE;
DROP TABLE IF EXISTS chapter_plot_points CASCADE;
DROP TABLE IF EXISTS chapter_scenes CASCADE;
DROP TABLE IF EXISTS character_knowledge CASCADE;
DROP TABLE IF EXISTS character_arcs CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;

-- Drop metadata and relationship tables
DROP TABLE IF EXISTS tropes CASCADE;
DROP TABLE IF EXISTS plot_threads CASCADE;
DROP TABLE IF EXISTS book_metadata CASCADE;
DROP TABLE IF EXISTS relationship_types CASCADE;
DROP TABLE IF EXISTS plot_thread_statuses CASCADE;
DROP TABLE IF EXISTS plot_thread_types CASCADE;
DROP TABLE IF EXISTS genres CASCADE;

-- Drop world building tables
DROP TABLE IF EXISTS world_regions CASCADE;
DROP TABLE IF EXISTS world_cultures CASCADE;
DROP TABLE IF EXISTS world_species CASCADE;
DROP TABLE IF EXISTS world_locations CASCADE;
DROP TABLE IF EXISTS world_systems CASCADE;
DROP TABLE IF EXISTS world_objects CASCADE;
DROP TABLE IF EXISTS world_history CASCADE;
DROP TABLE IF EXISTS world_events CASCADE;

-- Drop writing tables
DROP TABLE IF EXISTS writing_styles CASCADE;
DROP TABLE IF EXISTS writing_notes CASCADE;
DROP TABLE IF EXISTS writing_feedback CASCADE;
DROP TABLE IF EXISTS writing_revisions CASCADE;

-- Drop timeline tables
DROP TABLE IF EXISTS series_timeline CASCADE;
DROP TABLE IF EXISTS timeline_events CASCADE;
DROP TABLE IF EXISTS event_chapter_mapping CASCADE;

-- Drop core content tables
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS series CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
DROP TABLE IF EXISTS metadata CASCADE;

-- Drop tracking tables (keep this one for last)
DROP TABLE IF EXISTS migrations CASCADE;

-- Restore triggers
SET session_replication_role = 'origin';

COMMIT;

SELECT 'All tables have been dropped successfully.' as status;
'@

$dropSqlContent | Out-File -FilePath $dropSqlPath -Encoding utf8

# Execute the SQL file
Write-ColorOutput "Dropping all tables..." "Yellow"

try {
    $env:PGPASSWORD = "postgres"
    docker exec postgres psql -U postgres -d mcp -f /scripts/DangerZone/drop-all-tables.sql
    Write-ColorOutput "All tables dropped successfully!" "Green"
} catch {
    Write-ColorOutput "Error dropping tables: $_" "Red"
    exit 1
}

Write-ColorOutput ""
Write-ColorOutput "Database has been reset. You can now run the migrations again to rebuild the schema." "Green"
Write-ColorOutput "To rebuild the database, run: scripts\reset-and-rebuild-database.ps1" "Yellow"