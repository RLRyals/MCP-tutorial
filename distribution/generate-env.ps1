# Generate .env file with secure random credentials
# This script creates a .env file with auto-generated secure passwords

param(
    [switch]$Force
)

$envFile = Join-Path $PSScriptRoot ".env"
$envExample = Join-Path $PSScriptRoot ".env.example"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "MCP Writing System - Environment Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if .env already exists
if ((Test-Path $envFile) -and -not $Force) {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $response = Read-Host "Overwrite? (y/N)"
    if ($response -ne "y") {
        Write-Host "Cancelled. Use -Force to overwrite without prompt." -ForegroundColor Gray
        exit 0
    }
}

# Function to generate secure random string
function New-SecureToken {
    param([int]$Length = 32)
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    $token = -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $token
}

# Function to generate secure password
function New-SecurePassword {
    param([int]$Length = 24)
    # Include special characters for database password
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    $password = -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $password
}

Write-Host "Generating secure credentials..." -ForegroundColor Yellow

# Generate secure values
$postgresPassword = New-SecurePassword -Length 32
$authToken = New-SecureToken -Length 48
$dbName = "mcp_writing_db"
$dbUser = "writer"
$dbPort = 5432

# Create .env content
$envContent = @"
# ==========================================
# MCP Writing System - Configuration
# AUTO-GENERATED: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ==========================================

# ==========================================
# PostgreSQL Database Configuration
# ==========================================
POSTGRES_DB=$dbName
POSTGRES_USER=$dbUser
POSTGRES_PASSWORD=$postgresPassword
POSTGRES_CONTAINER_NAME=mcp-writing-db
POSTGRES_PORT=$dbPort
POSTGRES_VOLUME_NAME=mcp-writing-data

# Database connection URL
DATABASE_URL=postgresql://${dbUser}:${postgresPassword}@localhost:${dbPort}/${dbName}

# PostgreSQL Performance Tuning (optional)
POSTGRES_SHARED_BUFFERS=256MB
POSTGRES_EFFECTIVE_CACHE_SIZE=1GB
POSTGRES_MAINTENANCE_WORK_MEM=128MB
POSTGRES_CHECKPOINT_COMPLETION_TARGET=0.9
POSTGRES_WAL_BUFFERS=16MB
POSTGRES_MAX_WORKER_PROCESSES=4
POSTGRES_MAX_PARALLEL_WORKERS_PER_GATHER=2
POSTGRES_EFFECTIVE_IO_CONCURRENCY=200

# ==========================================
# MCP Connector Configuration
# ==========================================
MCP_AUTH_TOKEN=$authToken

# MCP Connector port (Typing Mind standard)
MCP_CONNECTOR_PORT=50880
MCP_CONNECTOR_CONTAINER_NAME=mcp-connector

# Include optional author server
INCLUDE_AUTHOR_SERVER=true

# MCP STDIO mode (use false for REST API mode)
MCP_STDIO_MODE=false

# ==========================================
# Docker Configuration
# ==========================================
MCP_NETWORK_NAME=mcp-network

# ==========================================
# Node Environment
# ==========================================
NODE_ENV=development

# ==========================================
# Typing Mind Static Web Server (Optional)
# ==========================================
TYPING_MIND_PORT=3000
TYPING_MIND_DIR=./typing-mind-static
TYPING_MIND_CONTAINER_NAME=typing-mind-web

# ==========================================
# Legacy Settings (for backward compatibility)
# ==========================================
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=3500
"@

# Write .env file
$envContent | Out-File -FilePath $envFile -Encoding UTF8 -NoNewline

Write-Host "✅ .env file created successfully!" -ForegroundColor Green

# Display summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Configuration Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Database: $dbName" -ForegroundColor White
Write-Host "  User: $dbUser" -ForegroundColor White
Write-Host "  Password: $postgresPassword" -ForegroundColor White
Write-Host "  Port: $dbPort" -ForegroundColor White

Write-Host "`nMCP Connector:" -ForegroundColor Yellow
Write-Host "  Auth Token: $authToken" -ForegroundColor White
Write-Host "  Port: 50880" -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "⚠️  IMPORTANT - Save These Credentials!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nYour credentials are saved in:" -ForegroundColor White
Write-Host "  $envFile" -ForegroundColor Gray

Write-Host "`nFor Typing Mind configuration, you'll need:" -ForegroundColor Yellow
Write-Host "  MCP Connector URL: http://localhost:50880" -ForegroundColor White
Write-Host "  Auth Token: $authToken" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "  1. Review the .env file if needed" -ForegroundColor White
Write-Host "  2. Run: .\test-docker-stack.ps1 -Build" -ForegroundColor White
Write-Host "  3. Configure Typing Mind with the credentials above" -ForegroundColor White
Write-Host ""

# Optionally create a credentials backup
$credentialsFile = Join-Path $PSScriptRoot "credentials-backup.txt"
$credentialsBackup = @"
MCP Writing System Credentials
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Database Password: $postgresPassword
MCP Auth Token: $authToken

MCP Connector URL: http://localhost:50880

IMPORTANT: Keep this file secure and delete after saving credentials elsewhere!
"@

$credentialsBackup | Out-File -FilePath $credentialsFile -Encoding UTF8
Write-Host "📄 Credentials backup saved to: credentials-backup.txt" -ForegroundColor Gray
Write-Host "   (Delete this file after saving credentials securely)" -ForegroundColor Gray
Write-Host ""
