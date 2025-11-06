#!/bin/bash
# Complete Setup Script for MCP Writing System with Typing Mind (Mac/Linux)
# This script automates the entire setup process

set -e

SKIP_TYPING_MIND=false
FORCE=false
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-typing-mind)
            SKIP_TYPING_MIND=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

echo ""
echo "========================================"
echo "MCP Writing System - Complete Setup"
echo "========================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ============================================
# Functions
# ============================================

check_docker_installed() {
    if command -v docker &> /dev/null; then
        return 0
    else
        return 1
    fi
}

check_docker_running() {
    if docker ps &> /dev/null; then
        return 0
    else
        return 1
    fi
}

start_docker_desktop_mac() {
    echo "  Starting Docker Desktop..."

    # Start Docker Desktop on Mac
    if [ -d "/Applications/Docker.app" ]; then
        open -a Docker
    else
        echo "✗ ERROR: Docker Desktop not found in /Applications"
        echo "  Please install Docker Desktop for Mac"
        return 1
    fi

    # Wait for Docker to start (max 60 seconds)
    echo "  Waiting for Docker to start..."
    local max_wait=60
    local waited=0

    while [ $waited -lt $max_wait ]; do
        sleep 2
        waited=$((waited + 2))

        if check_docker_running; then
            echo "✓ Docker is ready"
            return 0
        fi

        if [ "$VERBOSE" = true ]; then
            echo "  Waiting... ($waited/$max_wait seconds)"
        fi
    done

    echo "✗ ERROR: Docker did not start in time"
    return 1
}

start_docker_desktop_linux() {
    echo "  Starting Docker service..."

    # Try systemctl first (most common)
    if command -v systemctl &> /dev/null; then
        sudo systemctl start docker
        sleep 3

        if check_docker_running; then
            echo "✓ Docker is ready"
            return 0
        fi
    fi

    # Try service command
    if command -v service &> /dev/null; then
        sudo service docker start
        sleep 3

        if check_docker_running; then
            echo "✓ Docker is ready"
            return 0
        fi
    fi

    echo "✗ ERROR: Could not start Docker"
    echo "  Please start Docker manually"
    return 1
}

# ============================================
# Step 1: Download Typing Mind Static Files
# ============================================
if [ "$SKIP_TYPING_MIND" = false ]; then
    echo "Step 1: Downloading Typing Mind static files..."
    echo "--------"

    DOWNLOAD_SCRIPT="$SCRIPT_DIR/download-typingmind.sh"
    TYPING_MIND_INDEX="$SCRIPT_DIR/typing-mind-static/index.html"

    if [ -f "$TYPING_MIND_INDEX" ]; then
        echo "✓ Typing Mind files already exist"
        if [ "$FORCE" = true ]; then
            echo "  --force specified, re-downloading..."
            bash "$DOWNLOAD_SCRIPT"
        else
            echo "  Skipping download (use --force to re-download)"
        fi
    else
        echo "  Downloading from GitHub..."
        bash "$DOWNLOAD_SCRIPT"
    fi

    echo ""
else
    echo "Step 1: Skipping Typing Mind download (--skip-typing-mind specified)"
    echo ""
fi

# ============================================
# Step 2: Generate Environment Configuration
# ============================================
echo "Step 2: Generating environment configuration..."
echo "--------"

ENV_FILE="$SCRIPT_DIR/.env"
GENERATE_SCRIPT="$SCRIPT_DIR/generate-env.sh"

if [ -f "$ENV_FILE" ]; then
    echo "✓ .env file already exists"
    if [ "$FORCE" = true ]; then
        echo "  --force specified, regenerating..."
        if [ -f "$GENERATE_SCRIPT" ]; then
            bash "$GENERATE_SCRIPT" --force
        else
            echo "⚠ WARNING: generate-env.sh not found, skipping regeneration"
        fi
    else
        echo "  Skipping generation (use --force to regenerate)"
    fi
else
    echo "  Creating new .env file..."
    if [ -f "$GENERATE_SCRIPT" ]; then
        bash "$GENERATE_SCRIPT"
    else
        echo "⚠ WARNING: generate-env.sh not found"
        echo "  You need to create .env file manually"
        echo "  Or copy from template.env and edit"
    fi
fi

echo ""

# ============================================
# Step 3: Start Docker Stack
# ============================================
echo "Step 3: Starting Docker stack..."
echo "--------"

DOCKER_DIR="$SCRIPT_DIR/docker"

# Check if Docker is installed
if ! check_docker_installed; then
    echo "✗ ERROR: Docker Desktop not installed!"
    echo "  Download from: https://www.docker.com/products/docker-desktop"
    exit 2
fi

# Check if Docker is running, start if not
if ! check_docker_running; then
    echo "  Docker is not running"

    # Detect OS and start Docker accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if ! start_docker_desktop_mac; then
            exit 3
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if ! start_docker_desktop_linux; then
            exit 4
        fi
    else
        echo "✗ ERROR: Unsupported OS: $OSTYPE"
        exit 5
    fi
else
    echo "✓ Docker is running"
fi

# Start the stack
cd "$DOCKER_DIR"

echo "  Bringing up Docker services..."

BUILD_FLAG=""
if [ "$FORCE" = true ]; then
    BUILD_FLAG="--build"
fi

docker-compose --env-file ../.env up -d $BUILD_FLAG

if [ $? -eq 0 ]; then
    echo "✓ Docker services started successfully"
else
    echo "✗ ERROR: Failed to start Docker services"
    exit 1
fi

cd "$SCRIPT_DIR"

echo ""

# ============================================
# Step 4: Wait for Services to be Healthy
# ============================================
echo "Step 4: Waiting for services to be healthy..."
echo "--------"

MAX_ATTEMPTS=30

# Wait for PostgreSQL
echo "  Checking PostgreSQL..."
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))

    POSTGRES_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' mcp-writing-db 2>/dev/null || echo "unknown")

    if [ "$POSTGRES_HEALTH" = "healthy" ]; then
        echo "✓ PostgreSQL is healthy"
        break
    fi

    if [ "$VERBOSE" = true ]; then
        echo "  Attempt $ATTEMPT/$MAX_ATTEMPTS - PostgreSQL: $POSTGRES_HEALTH"
    fi

    sleep 2
done

if [ "$POSTGRES_HEALTH" != "healthy" ]; then
    echo "✗ PostgreSQL did not become healthy in time"
    exit 1
fi

# Wait for MCP Connector
echo "  Checking MCP Connector..."
echo "  (Initial startup may take 45-60 seconds)"
MAX_CONNECTOR_ATTEMPTS=60  # Increased from 30 to allow more time
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_CONNECTOR_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))

    CONNECTOR_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' mcp-connector 2>/dev/null || echo "unknown")

    if [ "$CONNECTOR_HEALTH" = "healthy" ]; then
        echo "✓ MCP Connector is healthy"
        break
    fi

    # Show progress every 10 attempts or if verbose
    if [ "$VERBOSE" = true ] || [ $((ATTEMPT % 10)) -eq 0 ]; then
        echo "  Attempt $ATTEMPT/$MAX_CONNECTOR_ATTEMPTS - MCP Connector: $CONNECTOR_HEALTH"
    fi

    sleep 2
done

if [ "$CONNECTOR_HEALTH" != "healthy" ]; then
    echo "✗ MCP Connector did not become healthy in time"
    echo "  Check logs with: cd docker && docker-compose logs mcp-connector"
    exit 1
fi

echo ""

# ============================================
# Step 5: Run Health Checks
# ============================================
echo "Step 5: Running health checks..."
echo "--------"

# Test database
echo "  Testing database connection..."
DB_TEST=$(docker exec mcp-writing-db psql -U writer -d mcp_writing_db -c "SELECT COUNT(*) FROM migrations;" 2>&1)
if [ $? -eq 0 ]; then
    echo "✓ Database is accessible"
else
    echo "✗ ERROR: Database connection failed"
    echo "  $DB_TEST"
    exit 1
fi

# Test MCP Connector
echo "  Testing MCP Connector..."
if command -v curl &> /dev/null; then
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:50880/ping)
    if [ "$RESPONSE" = "200" ]; then
        echo "✓ MCP Connector is responding"
    else
        echo "✗ ERROR: MCP Connector is not responding (HTTP $RESPONSE)"
        exit 1
    fi
else
    echo "⚠ WARNING: curl not found, skipping MCP Connector test"
fi

# Test Typing Mind if not skipped
if [ "$SKIP_TYPING_MIND" = false ]; then
    echo "  Testing Typing Mind web server..."
    if command -v curl &> /dev/null; then
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
        if [ "$RESPONSE" = "200" ]; then
            echo "✓ Typing Mind web server is responding"
        else
            echo "⚠ WARNING: Typing Mind web server is not responding (HTTP $RESPONSE)"
            echo "  Make sure you downloaded the static files"
        fi
    fi
fi

echo ""

# ============================================
# Success Summary
# ============================================
echo "========================================"
echo " Setup Complete!"
echo "========================================"
echo ""

# Read auth token from .env
AUTH_TOKEN="not-set"
if [ -f "$ENV_FILE" ]; then
    AUTH_TOKEN=$(grep "MCP_AUTH_TOKEN=" "$ENV_FILE" | cut -d '=' -f2)
fi

echo "Services Running:"
echo "  PostgreSQL Database:  http://localhost:5432"
echo "  MCP Connector:        http://localhost:50880"

if [ "$SKIP_TYPING_MIND" = false ]; then
    echo "  Typing Mind Web:      http://localhost:3000"
fi

echo ""
echo "MCP Connector Configuration:"
echo "  URL: http://localhost:50880"
echo "  Auth Token: $AUTH_TOKEN"

if [ "$SKIP_TYPING_MIND" = false ]; then
    echo ""
    echo "Next Steps:"
    echo "  1. Open http://localhost:3000 in your browser"
    echo "  2. Enter your AI provider API keys"
    echo "  3. Go to Settings → Advanced → Model Context Protocol"
    echo "  4. Add MCP Connector with the URL and token above"
else
    echo ""
    echo "Next Steps:"
    echo "  1. Configure your Typing Mind instance"
    echo "  2. Add MCP Connector with the URL and token above"
fi

echo ""
echo "Useful Commands:"
echo "  View logs:  cd docker && docker-compose logs -f"
echo "  Stop:       cd docker && docker-compose down"
echo "  Restart:    cd docker && docker-compose restart"

echo ""

exit 0
