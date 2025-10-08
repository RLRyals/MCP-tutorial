#!/bin/bash
# build-for-distribution.sh
# Script for instructors to build and package MCP Tutorial for student distribution

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
OUTPUT_DIR="./distribution"
SKIP_BUILD=false

# Helper functions
print_success() { echo -e "${GREEN}$*${NC}"; }
print_info() { echo -e "${CYAN}$*${NC}"; }
print_warning() { echo -e "${YELLOW}$*${NC}"; }
print_error() { echo -e "${RED}$*${NC}"; }

show_help() {
    cat << EOF
MCP Tutorial - Build for Distribution

This script builds Docker images and packages them for student distribution.

USAGE:
    ./scripts/build-for-distribution.sh [OPTIONS]

OPTIONS:
    -o, --output-dir <path>    Directory to save distribution files (default: ./distribution)
    -s, --skip-build           Skip building images (use existing images)
    -h, --help                 Show this help message

EXAMPLES:
    # Build and package everything
    ./scripts/build-for-distribution.sh

    # Use custom output directory
    ./scripts/build-for-distribution.sh -o ~/course-materials/docker-images

    # Package existing images without rebuilding
    ./scripts/build-for-distribution.sh --skip-build

OUTPUT:
    Creates the following files in the distribution directory:
    - mcp-tutorial-image.tar       (Docker image for all MCP servers)
    - student-setup-instructions.md (Installation guide for students)
    - .env.example                 (Environment template)
    - docker-compose.mcp.yml       (Compose file for students)

EOF
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -o|--output-dir)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -s|--skip-build)
            SKIP_BUILD=true
            shift
            ;;
        -h|--help)
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

print_info "\n=== MCP Tutorial - Build for Distribution ===\n"

# Check if Docker is running
print_info "Checking Docker Desktop status..."
if ! docker info &>/dev/null; then
    print_error "✗ Docker Desktop is not running. Please start Docker Desktop and try again."
    exit 1
fi
print_success "✓ Docker Desktop is running"

# Create output directory
print_info "\nCreating distribution directory: $OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"
print_success "✓ Distribution directory ready"

# Build Docker image
if [ "$SKIP_BUILD" = false ]; then
    print_info "\nBuilding MCP Tutorial Docker image..."
    print_info "This may take a few minutes..."

    if ! docker build -t mcp-tutorial:latest -f Dockerfile .; then
        print_error "✗ Docker build failed"
        exit 1
    fi
    print_success "✓ Docker image built successfully"
else
    print_warning "Skipping build (using existing image)"
fi

# Export Docker image
print_info "\nExporting Docker image to tar file..."
print_info "This may take a few minutes (image size ~200-300MB)..."

TAR_FILE="$OUTPUT_DIR/mcp-tutorial-image.tar"
if ! docker save mcp-tutorial:latest -o "$TAR_FILE"; then
    print_error "✗ Docker save failed"
    exit 1
fi

FILE_SIZE=$(du -h "$TAR_FILE" | cut -f1)
print_success "✓ Image exported successfully ($FILE_SIZE)"

# Copy necessary files for students
print_info "\nCopying student setup files..."

# Copy docker-compose file
cp docker-compose.mcp.yml "$OUTPUT_DIR/docker-compose.mcp.yml"
print_success "✓ Copied docker-compose.mcp.yml"

# Copy/create .env.example
if [ -f "template.env" ]; then
    cp template.env "$OUTPUT_DIR/.env.example"
else
    cat > "$OUTPUT_DIR/.env.example" << 'EOF'
# MCP Tutorial Environment Variables
POSTGRES_DB=book_series_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
NODE_ENV=production
EOF
fi
print_success "✓ Created .env.example"

# Create student setup instructions
cat > "$OUTPUT_DIR/student-setup-instructions.md" << 'EOF'
# MCP Tutorial - Student Setup Instructions

## Prerequisites
- Docker Desktop 4.42.0 or later
- Claude Desktop (or compatible MCP client)

## Installation Steps

### 1. Install Docker Desktop
1. Download from: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. Verify installation: Open terminal and run `docker --version`

### 2. Enable Docker MCP Toolkit
1. Open Docker Desktop
2. Go to Settings → Beta features
3. Enable "Docker MCP Toolkit"
4. Restart Docker Desktop if prompted

### 3. Load MCP Tutorial Image
1. Open terminal
2. Navigate to this distribution folder
3. Run: `docker load -i mcp-tutorial-image.tar`
4. Wait for the image to load (this may take a minute)

### 4. Start the Services
1. Create your environment file:
   - Copy `.env.example` to `.env`
   - (Optional) Modify database credentials if needed

2. Start the database and MCP servers:
   ```bash
   docker-compose -f docker-compose.mcp.yml up -d
   ```

3. Verify services are running:
   ```bash
   docker-compose -f docker-compose.mcp.yml ps
   ```

### 5. Connect to Claude Desktop

#### Option A: Using Docker Desktop UI (Easiest)
1. Open Docker Desktop
2. Go to the "MCP" section
3. Find your running MCP servers (mcp-tutorial-*)
4. Click "Connect to Claude Desktop" for each server you want to use
5. Restart Claude Desktop

#### Option B: Manual Configuration
1. Locate your Claude Desktop config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add MCP servers to the config:
   ```json
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
   ```

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
- Try: `docker system prune` to free up space

### Services won't start
- Check if ports are already in use: `docker-compose -f docker-compose.mcp.yml logs`
- Verify .env file exists and has valid values
- Restart Docker Desktop

### Claude Desktop doesn't show MCP tools
- Verify services are running: `docker ps`
- Check config file syntax (must be valid JSON)
- Completely quit and restart Claude Desktop (not just close window)
- Check Claude Desktop logs for errors

### Database connection errors
- Ensure postgres container is healthy: `docker ps`
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
EOF
print_success "✓ Created student setup instructions"

# Create a quick README
cat > "$OUTPUT_DIR/README.md" << 'EOF'
# MCP Tutorial Distribution Package

This package contains everything students need to run the MCP Tutorial.

## Contents
- `mcp-tutorial-image.tar` - Docker image with all MCP servers
- `docker-compose.mcp.yml` - Docker Compose configuration
- `.env.example` - Environment variable template
- `student-setup-instructions.md` - Complete setup guide

## Quick Start
1. Ensure Docker Desktop 4.42+ is installed and running
2. Load the image: `docker load -i mcp-tutorial-image.tar`
3. Follow the instructions in `student-setup-instructions.md`

## Distribution
You can share this entire folder with students via:
- Cloud storage (Google Drive, Dropbox, OneDrive)
- Learning Management System (Canvas, Moodle, etc.)
- USB drive
- Network share

File size: ~200-300MB (compressed)
EOF
print_success "✓ Created README.md"

# Summary
print_success "\n=== Build Complete! ===\n"
print_info "Distribution files created in: $OUTPUT_DIR"
print_info "\nContents:"
ls -lh "$OUTPUT_DIR" | awk '{if(NR>1) printf "  - %-40s %s\n", $9, $5}'

print_info "\nNext Steps:"
print_info "1. Test the distribution on a clean machine (optional but recommended)"
print_info "2. Upload the contents of '$OUTPUT_DIR' to your course platform"
print_info "3. Share the student-setup-instructions.md with your students"

print_success "\nDone! 🎉\n"
