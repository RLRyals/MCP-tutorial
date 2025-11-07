# Update Typing Mind Files for Electron App
# This script is designed to be called by an Electron app to update Typing Mind
# It handles backup, download, and rollback on failure

param(
    [Parameter(Mandatory=$true)]
    [string]$TargetDir,  # Where typing-mind-static is located

    [Parameter(Mandatory=$false)]
    [string]$DockerComposeDir  # Where docker-compose.yml is located (to restart container)
)

$ErrorActionPreference = "Stop"

# Validate target directory
if (-not (Test-Path $TargetDir)) {
    Write-Output "ERROR|Target directory does not exist: $TargetDir"
    exit 1
}

$BackupDir = "$TargetDir-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$TempDir = Join-Path (Split-Path $TargetDir -Parent) ".tmp-typingmind-update"

try {
    Write-Output "INFO|Starting Typing Mind update"
    Write-Output "INFO|Target: $TargetDir"

    # Create temp directory
    Write-Output "INFO|Creating temporary directory"
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

    # Clone repository
    Write-Output "INFO|Downloading latest Typing Mind from GitHub"
    $gitOutput = git clone --depth 1 https://github.com/TypingMind/typingmind.git "$TempDir" 2>&1

    if ($LASTEXITCODE -ne 0) {
        Write-Output "ERROR|Git clone failed: $gitOutput"
        exit 1
    }

    # Check for src folder
    $srcPath = Join-Path $TempDir "src"
    if (-not (Test-Path $srcPath)) {
        Write-Output "ERROR|Repository structure has changed - src folder not found"
        Write-Output "INFO|Available folders:"
        Get-ChildItem -Path $TempDir -Directory | ForEach-Object {
            Write-Output "INFO|  - $($_.Name)"
        }
        exit 1
    }

    # Backup current installation
    Write-Output "INFO|Backing up current installation"
    if (Test-Path $TargetDir) {
        Copy-Item -Path $TargetDir -Destination $BackupDir -Recurse -Force
        Write-Output "INFO|Backup created: $BackupDir"
    }

    # Remove old files (except backup)
    Write-Output "INFO|Removing old files"
    Get-ChildItem -Path $TargetDir | Remove-Item -Recurse -Force

    # Copy new files
    Write-Output "INFO|Installing new files"
    Get-ChildItem -Path $srcPath | Copy-Item -Destination $TargetDir -Recurse -Force

    # Verify installation
    if (-not (Test-Path (Join-Path $TargetDir "index.html"))) {
        Write-Output "ERROR|Installation verification failed - index.html not found"

        # Restore backup
        Write-Output "INFO|Restoring from backup"
        Remove-Item -Path $TargetDir -Recurse -Force
        Copy-Item -Path $BackupDir -Destination $TargetDir -Recurse -Force
        exit 1
    }

    # Count files
    $fileCount = (Get-ChildItem -Path $TargetDir -Recurse -File | Measure-Object).Count
    $totalSize = (Get-ChildItem -Path $TargetDir -Recurse | Measure-Object -Property Length -Sum).Sum
    $totalSizeMB = [math]::Round($totalSize / 1MB, 2)

    Write-Output "SUCCESS|Update complete"
    Write-Output "INFO|Files: $fileCount"
    Write-Output "INFO|Size: $totalSizeMB MB"

    # Restart Docker container if docker-compose directory provided
    if ($DockerComposeDir -and (Test-Path $DockerComposeDir)) {
        Write-Output "INFO|Restarting Typing Mind container"

        Push-Location $DockerComposeDir
        try {
            docker-compose restart typing-mind-web 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Output "INFO|Container restarted successfully"
            } else {
                Write-Output "WARN|Failed to restart container - please restart manually"
            }
        } finally {
            Pop-Location
        }
    }

    # Cleanup backup after success
    Write-Output "INFO|Cleaning up backup"
    Remove-Item -Path $BackupDir -Recurse -Force

    Write-Output "SUCCESS|Typing Mind updated successfully"
    exit 0

} catch {
    Write-Output "ERROR|Update failed: $_"

    # Restore backup if it exists
    if (Test-Path $BackupDir) {
        Write-Output "INFO|Restoring from backup"

        if (Test-Path $TargetDir) {
            Remove-Item -Path $TargetDir -Recurse -Force -ErrorAction SilentlyContinue
        }

        Copy-Item -Path $BackupDir -Destination $TargetDir -Recurse -Force
        Write-Output "INFO|Backup restored successfully"
    }

    exit 1

} finally {
    # Cleanup temp directory
    if (Test-Path $TempDir) {
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
