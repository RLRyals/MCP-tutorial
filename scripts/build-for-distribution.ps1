# build-for-distribution.ps1
# Script for instructors to build and package MCP Tutorial for student distribution

param(
    [string]$OutputDir = ".\distribution",
    [switch]$SkipBuild,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
MCP Tutorial - Build for Distribution

This script builds Docker images and packages them for student distribution.

USAGE:
    .\scripts\build-for-distribution.ps1 [OPTIONS]

OPTIONS:
    -OutputDir <path>    Directory to save distribution files (default: .\distribution)
    -SkipBuild          Skip building images (use existing images)
    -Help               Show this help message

EXAMPLES:
    # Build and package everything
    .\scripts\build-for-distribution.ps1

    # Use custom output directory
    .\scripts\build-for-distribution.ps1 -OutputDir "C:\course-materials\docker-images"

    # Package existing images without rebuilding
    .\scripts\build-for-distribution.ps1 -SkipBuild

OUTPUT:
    Creates the following files in the distribution directory:
    - mcp-tutorial-image.tar       (Docker image for all MCP servers)
    - student-setup-instructions.md (Installation guide for students)
    - .env.example                 (Environment template)
    - docker-compose.mcp.yml       (Compose file for students)

"@
    exit 0
}

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info "`n=== MCP Tutorial - Build for Distribution ===`n"

# Check if Docker is running
Write-Info "Checking Docker Desktop status..."
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker Desktop is not running. Please start Docker Desktop and try again."
        exit 1
    }
    Write-Success "✓ Docker Desktop is running"
} catch {
    Write-Error "Error checking Docker status: $_"
    exit 1
}

# Create output directory
Write-Info "`nCreating distribution directory: $OutputDir"
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}
Write-Success "✓ Distribution directory ready"

# Build Docker image
if (!$SkipBuild) {
    Write-Info "`nBuilding MCP Tutorial Docker image..."
    Write-Info "This may take a few minutes..."

    try {
        docker build -t mcp-tutorial:latest -f Dockerfile .
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker build failed"
            exit 1
        }
        Write-Success "✓ Docker image built successfully"
    } catch {
        Write-Error "Error building Docker image: $_"
        exit 1
    }
} else {
    Write-Warning "Skipping build (using existing image)"
}

# Export Docker image
Write-Info "`nExporting Docker image to tar file..."
Write-Info "This may take a few minutes (image size ~200-300MB)..."

try {
    $tarFile = Join-Path $OutputDir "mcp-tutorial-image.tar"
    docker save mcp-tutorial:latest -o $tarFile
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker save failed"
        exit 1
    }
    $fileSize = (Get-Item $tarFile).Length / 1MB
    Write-Success "✓ Image exported successfully ($([math]::Round($fileSize, 2)) MB)"
} catch {
    Write-Error "Error saving Docker image: $_"
    exit 1
}

# Copy necessary files for students
Write-Info "`nCopying student setup files..."

# Copy docker-compose file
Copy-Item "docker-compose.mcp.yml" (Join-Path $OutputDir "docker-compose.mcp.yml") -Force
Write-Success "✓ Copied docker-compose.mcp.yml"

# Copy/create .env.example
if (Test-Path "template.env") {
    Copy-Item "template.env" (Join-Path $OutputDir ".env.example") -Force
} else {
    @"
# MCP Tutorial Environment Variables
POSTGRES_DB=book_series_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
NODE_ENV=production
"@ | Out-File (Join-Path $OutputDir ".env.example") -Encoding UTF8
}
Write-Success "✓ Created .env.example"

# Create student setup instructions
$instructions = @"
# MCP Tutorial - Student Setup Instructions

## Prerequisites
- Docker Desktop 4.42.0 or later
- Claude Desktop (or compatible MCP client)

## Installation Steps

### 1. Install Docker Desktop
1. Download from: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. Verify installation: Open terminal and run \`docker --version\`

### 2. Enable Docker MCP Toolkit
1. Open Docker Desktop
2. Go to Settings → Beta features
3. Enable "Docker MCP Toolkit"
4. Restart Docker Desktop if prompted

### 3. Load MCP Tutorial Image
1. Open terminal/PowerShell
2. Navigate to this distribution folder
3. Run: \`docker load -i mcp-tutorial-image.tar\`
4. Wait for the image to load (this may take a minute)

### 4. Start the Services
1. Create your environment file:
   - Copy \`.env.example\` to \`.env\`
   - (Optional) Modify database credentials if needed

2. Start the database and MCP servers:
   \`\`\`powershell
   docker-compose -f docker-compose.mcp.yml up -d
   \`\`\`

3. Verify services are running:
   \`\`\`powershell
   docker-compose -f docker-compose.mcp.yml ps
   \`\`\`

### 5. Connect to Claude Desktop

#### Option A: Using Docker Desktop UI (Easiest)
1. Open Docker Desktop
2. Go to the "MCP" section
3. Find your running MCP servers (mcp-tutorial-*)
4. Click "Connect to Claude Desktop" for each server you want to use
5. Restart Claude Desktop

#### Option B: Manual Configuration
1. Locate your Claude Desktop config file:
   - **Windows**: \`%APPDATA%\Claude\claude_desktop_config.json\`
   - **macOS**: \`~/Library/Application Support/Claude/claude_desktop_config.json\`

2. Add MCP servers to the config:
   \`\`\`json
   {
     "mcpServers": {
       "author-manager": {
         "command": "docker",
         "args": ["exec", "-i", "mcp-tutorial-author", "node", "src/mcps/author-server/index.js"]
       },
       "series-manager": {
         "command": "docker",
         "args": ["exec", "-i", "mcp-tutorial-series", "node", "src/mcps/series-server/index.js"]
       },
       "book-manager": {
         "command": "docker",
         "args": ["exec", "-i", "mcp-tutorial-book", "node", "src/mcps/book-server/index.js"]
       }
     }
   }
   \`\`\`

3. Restart Claude Desktop

### 6. Test Your Setup
1. Open Claude Desktop
2. Look for the 🔨 (hammer) icon indicating MCP tools are available
3. Try asking: "Can you list all authors in my database?"
4. If successful, you should see the MCP tool being used!

## Available MCP Servers
- **mcp-author** - Author management
- **mcp-series** - Book series management
- **mcp-book** - Book and chapter management
- **mcp-character** - Character tracking
- **mcp-timeline** - Timeline management
- **mcp-metadata** - Metadata and lookups
- **mcp-trope** - Trope management
- **mcp-plot** - Plot structure
- **mcp-relationship** - Character relationships
- **mcp-story-analysis** - Story analysis tools
- **mcp-world** - World building
- **mcp-writing** - Writing session management

## Troubleshooting

### Docker image won't load
- Ensure you have enough disk space (need ~500MB free)
- Check Docker Desktop is running
- Try: \`docker system prune\` to free up space

### Services won't start
- Check if ports are already in use: \`docker-compose -f docker-compose.mcp.yml logs\`
- Verify .env file exists and has valid values
- Restart Docker Desktop

### Claude Desktop doesn't show MCP tools
- Verify services are running: \`docker ps\`
- Check config file syntax (must be valid JSON)
- Completely quit and restart Claude Desktop (not just close window)
- Check Claude Desktop logs for errors

### Database connection errors
- Ensure postgres container is healthy: \`docker ps\`
- Check DATABASE_URL in .env matches postgres credentials
- Wait 30 seconds after starting services for database to initialize

## Next Steps
Follow the course materials to learn how to:
- Run database migrations
- Create sample data
- Build custom MCP tools
- Extend the system with new features

## Support
Contact your instructor if you encounter issues not covered here.
"@

$instructions | Out-File (Join-Path $OutputDir "student-setup-instructions.md") -Encoding UTF8
Write-Success "✓ Created student setup instructions"

# Create a quick README
$readme = @"
# MCP Tutorial Distribution Package

This package contains everything students need to run the MCP Tutorial.

## Contents
- \`mcp-tutorial-image.tar\` - Docker image with all MCP servers
- \`docker-compose.mcp.yml\` - Docker Compose configuration
- \`.env.example\` - Environment variable template
- \`student-setup-instructions.md\` - Complete setup guide

## Quick Start
1. Ensure Docker Desktop 4.42+ is installed and running
2. Load the image: \`docker load -i mcp-tutorial-image.tar\`
3. Follow the instructions in \`student-setup-instructions.md\`

## Distribution
You can share this entire folder with students via:
- Cloud storage (Google Drive, Dropbox, OneDrive)
- Learning Management System (Canvas, Moodle, etc.)
- USB drive
- Network share

File size: ~200-300MB (compressed)
"@

$readme | Out-File (Join-Path $OutputDir "README.md") -Encoding UTF8
Write-Success "✓ Created README.md"

# Summary
Write-Success "`n=== Build Complete! ===`n"
Write-Info "Distribution files created in: $OutputDir"
Write-Info "`nContents:"
Get-ChildItem $OutputDir | ForEach-Object {
    $size = if ($_.PSIsContainer) { "folder" } else { "$([math]::Round($_.Length / 1MB, 2)) MB" }
    Write-Info "  - $($_.Name) ($size)"
}

Write-Info "`nNext Steps:"
Write-Info "1. Test the distribution on a clean machine (optional but recommended)"
Write-Info "2. Upload the contents of '$OutputDir' to your course platform"
Write-Info "3. Share the student-setup-instructions.md with your students"

Write-Success "`nDone! 🎉`n"
