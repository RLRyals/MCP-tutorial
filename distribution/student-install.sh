#!/bin/bash
# student-install.sh
# Automated installation script for MCP Tutorial students

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SKIP_DOCKER=false

# Helper functions
print_success() { echo -e "${GREEN}$*${NC}"; }
print_info() { echo -e "${CYAN}$*${NC}"; }
print_warning() { echo -e "${YELLOW}$*${NC}"; }
print_error() { echo -e "${RED}$*${NC}"; }
print_step() {
    echo -e "\n${YELLOW}[$1]${NC} $2"
}

show_help() {
    cat << EOF
MCP Tutorial - Student Installation Script

This script automates the setup of the MCP Tutorial environment.

USAGE:
    ./student-install.sh [OPTIONS]

OPTIONS:
    -s, --skip-docker    Skip Docker checks and image loading
    -h, --help           Show this help message

EXAMPLES:
    # Full automated installation
    ./student-install.sh

    # Skip Docker setup (if already loaded)
    ./student-install.sh --skip-docker

WHAT THIS SCRIPT DOES:
    1. Checks Docker Desktop is running
    2. Loads the MCP Tutorial Docker image
    3. Creates .env file from template
    4. Starts all services
    5. Runs database migrations
    6. Offers to configure Claude Desktop

EOF
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--skip-docker)
            SKIP_DOCKER=true
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

print_info "
╔════════════════════════════════════════╗
║  MCP Tutorial - Student Installation  ║
╚════════════════════════════════════════╝
"

# Step 1: Check Docker Desktop
if [ "$SKIP_DOCKER" = false ]; then
    print_step "1/6" "Checking Docker Desktop..."

    if ! docker info &>/dev/null; then
        print_error "✗ Docker Desktop is not running"
        print_warning "\nPlease:"
        print_warning "1. Start Docker Desktop"
        print_warning "2. Wait for it to fully start (icon should be green)"
        print_warning "3. Run this script again"
        exit 1
    fi
    print_success "✓ Docker Desktop is running"

    # Check Docker version
    VERSION=$(docker version --format '{{.Server.Version}}' 2>&1)
    print_info "  Docker version: $VERSION"

    # Step 2: Load Docker image
    print_step "2/6" "Loading MCP Tutorial Docker image..."

    IMAGE_PATH="mcp-tutorial-image.tar"
    if [ ! -f "$IMAGE_PATH" ]; then
        print_error "✗ Image file not found: $IMAGE_PATH"
        print_warning "\nMake sure you're running this script from the distribution folder"
        print_warning "The folder should contain: mcp-tutorial-image.tar"
        exit 1
    fi

    print_info "  Loading image (this may take 1-2 minutes)..."
    if ! docker load -i "$IMAGE_PATH"; then
        print_error "✗ Failed to load Docker image"
        exit 1
    fi
    print_success "✓ Docker image loaded successfully"

    # Verify image
    IMAGE_CHECK=$(docker images mcp-tutorial --format "{{.Repository}}:{{.Tag}}" 2>&1 | head -n1)
    if [[ "$IMAGE_CHECK" == *"mcp-tutorial"* ]]; then
        print_success "✓ Image verified: $IMAGE_CHECK"
    else
        print_warning "⚠ Could not verify image, but continuing..."
    fi
else
    print_warning "Skipping Docker checks (as requested)"
fi

# Step 3: Create .env file
print_step "3/6" "Setting up environment configuration..."

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env"
        print_success "✓ Created .env from template"
    else
        # Create a basic .env if example doesn't exist
        cat > ".env" << 'EOF'
POSTGRES_DB=book_series_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
NODE_ENV=production
EOF
        print_success "✓ Created default .env file"
    fi
else
    print_info "  .env file already exists (keeping existing configuration)"
fi

# Step 4: Start services
print_step "4/6" "Starting MCP Tutorial services..."

print_info "  Starting database and MCP servers..."
if ! docker-compose -f docker-compose.mcp.yml up -d; then
    print_error "✗ Failed to start services"
    exit 1
fi
print_success "✓ Services started"

# Wait for database to be ready
print_info "  Waiting for database to be ready..."
MAX_WAIT=30
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if docker exec mcp-tutorial-db pg_isready -U postgres &>/dev/null; then
        print_success "✓ Database is ready"
        break
    fi
    sleep 2
    WAITED=$((WAITED + 2))
    echo -n "."
done

if [ $WAITED -ge $MAX_WAIT ]; then
    print_warning "\n⚠ Database may not be fully ready yet. Check with: docker-compose -f docker-compose.mcp.yml logs postgres"
fi

# Step 5: Show running services
print_step "5/6" "Verifying services..."

docker-compose -f docker-compose.mcp.yml ps
print_success "✓ All services are running"

# Step 6: Configure Claude Desktop
print_step "6/6" "Claude Desktop configuration..."

print_info "
You have two options to connect Claude Desktop:

OPTION A - Docker Desktop UI (Recommended):
  1. Open Docker Desktop
  2. Go to the 'Containers' section
  3. Find the mcp-tutorial containers
  4. Click 'Connect to Claude Desktop' for each MCP server
  5. Restart Claude Desktop

OPTION B - Manual Configuration:
  Edit your Claude Desktop config file and add the MCP servers.
"

read -p "Would you like help with manual configuration? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "\nClaude Desktop config file locations:"
    print_info "  macOS: ~/Library/Application Support/Claude/claude_desktop_config.json"
    print_info "  Windows: %APPDATA%\\Claude\\claude_desktop_config.json"

    print_info "\nSample configuration (copy this into your config file):"
    cat << 'EOF'

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
    },
    "character-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-character", "node", "src/mcps/character-server/index.js"]
    }
  }
}

EOF

    print_info "Add more servers as needed following the same pattern."
fi

# Final summary
print_success "
╔═══════════════════════════════════════╗
║     Installation Complete! 🎉         ║
╚═══════════════════════════════════════╝
"

print_info "Next Steps:"
print_info "1. Configure Claude Desktop (see options above)"
print_info "2. Restart Claude Desktop completely"
print_info "3. Look for the 🔨 tool icon in Claude Desktop"
print_info "4. Try: 'Can you list all authors?'"

print_info "\nUseful Commands:"
print_info "  View logs:     docker-compose -f docker-compose.mcp.yml logs -f"
print_info "  Stop services: docker-compose -f docker-compose.mcp.yml down"
print_info "  Restart:       docker-compose -f docker-compose.mcp.yml restart"

print_info "\nFor troubleshooting, see: student-setup-instructions.md"
print_success "\nHappy writing! 📚✨\n"
