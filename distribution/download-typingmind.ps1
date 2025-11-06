# Download Typing Mind static files from GitHub
# This script fetches the latest self-hosted version of Typing Mind

param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "=========================================="
Write-Host "Typing Mind Downloader"
Write-Host "=========================================="
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetDir = Join-Path $ScriptDir "typing-mind-static"
$TempDir = Join-Path $env:TEMP "typingmind-download-$(Get-Random)"

# Check if files already exist
if ((Test-Path (Join-Path $TargetDir "index.html")) -and -not $Force) {
    Write-Host "  Typing Mind files already exist in $TargetDir" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Do you want to re-download and overwrite? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host " Download cancelled" -ForegroundColor Red
        exit 0
    }
    Write-Host ""
}

# Check if git is installed
try {
    $gitVersion = git --version
} catch {
    Write-Host " Error: git is not installed" -ForegroundColor Red
    Write-Host "   Please install git first:" -ForegroundColor Yellow
    Write-Host "   Download from: https://git-scm.com/download/win" -ForegroundColor Cyan
    exit 1
}

Write-Host " Downloading Typing Mind from GitHub..." -ForegroundColor Cyan
Write-Host "   Repository: https://github.com/TypingMind/typingmind" -ForegroundColor Gray
Write-Host ""

# Create temp directory
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

try {
    # Clone the repository
    Write-Host "   Cloning repository..." -ForegroundColor Gray
    git clone --depth 1 https://github.com/TypingMind/typingmind.git $TempDir 2>&1 | ForEach-Object {
        Write-Host "   $_" -ForegroundColor DarkGray
    }

    if (-not (Test-Path (Join-Path $TempDir "src"))) {
        throw "Failed to download Typing Mind files - src folder not found"
    }

    Write-Host ""
    Write-Host " Download complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host " Installing files to $TargetDir..." -ForegroundColor Cyan

    # Create target directory if it doesn't exist
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null

    # Backup README.md if it exists
    $readmePath = Join-Path $TargetDir "README.md"
    $readmeBackup = $null
    if (Test-Path $readmePath) {
        $readmeBackup = Get-Content $readmePath -Raw
    }

    # Remove old files (except README.md)
    Get-ChildItem -Path $TargetDir -Exclude "README.md" | Remove-Item -Recurse -Force

    # Copy new files
    $srcPath = Join-Path $TempDir "src"
    Get-ChildItem -Path $srcPath | Copy-Item -Destination $TargetDir -Recurse -Force

    # Restore README.md if it was backed up
    if ($readmeBackup) {
        Set-Content -Path $readmePath -Value $readmeBackup
    }

    # Count files and calculate size
    $fileCount = (Get-ChildItem -Path $TargetDir -Recurse -File | Measure-Object).Count
    $totalSize = (Get-ChildItem -Path $TargetDir -Recurse | Measure-Object -Property Length -Sum).Sum
    $totalSizeMB = [math]::Round($totalSize / 1MB, 2)

    Write-Host " Installation complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host " Statistics:" -ForegroundColor Cyan
    Write-Host "   Files installed: $fileCount" -ForegroundColor Gray
    Write-Host "   Total size: $totalSizeMB MB" -ForegroundColor Gray
    Write-Host "   Location: $TargetDir" -ForegroundColor Gray
    Write-Host ""
    Write-Host " Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Start Docker: cd docker; docker-compose up -d" -ForegroundColor Yellow
    Write-Host "   2. Access Typing Mind: http://localhost:3000" -ForegroundColor Yellow
    Write-Host "   3. Configure MCP Connector in Typing Mind settings" -ForegroundColor Yellow
    Write-Host ""
    Write-Host " For detailed instructions, see TYPING-MIND-SETUP.md" -ForegroundColor Gray
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host " Done!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green

} catch {
    Write-Host ""
    Write-Host " Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "If the error persists, you can manually download:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://github.com/TypingMind/typingmind" -ForegroundColor Cyan
    Write-Host "2. Click 'Code' → 'Download ZIP'" -ForegroundColor Cyan
    Write-Host "3. Extract the 'src' folder contents to: $TargetDir" -ForegroundColor Cyan
    exit 1
} finally {
    # Cleanup temp directory
    if (Test-Path $TempDir) {
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
