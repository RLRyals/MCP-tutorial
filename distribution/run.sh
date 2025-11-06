#!/bin/bash
# Run MCP Writing System (Mac/Linux)
# This script starts the MCP Writing System services
# Uses existing .env configuration (does NOT regenerate)
# Designed to be run every time the Electron app starts

set -e

VERBOSE=false
WAIT_FOR_HEALTHY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -w|--wait)
            WAIT_FOR_HEALTHY=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

echo ""
echo "========================================"
echo "MCP Writing System - Starting Services"
echo "========================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
DOCKER_DIR="$SCRIPT_DIR/docker"

# ============================================
# Functions
# ============================================

check_docker_installed() {
    if command -v docker &> /dev/null; then
        echo "✓ Docker Desktop found"
        return 0
    else
        echo "✗ ERROR: Docker Desktop not installed!"
        echo "  Download from: https://www.docker.com/products/docker-desktop"
        exit 2  # Exit code 2 = Docker not installed
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
        exit 3  # Exit code 3 = Docker installed but can't find app
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
    exit 4  # Exit code 4 = Docker started but didn't become ready
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
    exit 4
}

# ============================================
# Check Prerequisites
# ============================================
echo "Checking prerequisites..."

# Check if Docker is installed
check_docker_installed

# Check if Docker is running, start if not
if ! check_docker_running; then
    echo "  Docker is not running"

    # Detect OS and start Docker accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        start_docker_desktop_mac
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        start_docker_desktop_linux
    else
        echo "✗ ERROR: Unsupported OS: $OSTYPE"
        exit 5
    fi
else
    echo "✓ Docker is running"
fi

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "✗ ERROR: .env file not found!"
    echo "  Run setup-all.sh first to complete initial setup"
    exit 1
fi
echo "✓ Configuration found"

# Check if Typing Mind files exist
TYPING_MIND_INDEX="$SCRIPT_DIR/typing-mind-static/index.html"
if [ ! -f "$TYPING_MIND_INDEX" ]; then
    echo "⚠ WARNING: Typing Mind files not found"
    echo "  Run setup-all.sh to download them"
fi

echo ""

# ============================================
# Start Docker Services
# ============================================
echo "Starting Docker services..."

cd "$DOCKER_DIR"

# Check if services are already running
RUNNING_CONTAINERS=$(docker ps --filter "name=mcp-" --format "{{.Names}}" 2>/dev/null || true)

if [ -n "$RUNNING_CONTAINERS" ]; then
    echo "✓ Services already running:"
    echo "$RUNNING_CONTAINERS" | while read -r container; do
        echo "  - $container"
    done
else
    echo "  Starting containers..."
    docker-compose --env-file ../.env up -d

    if [ $? -eq 0 ]; then
        echo "✓ Containers started"
    else
        echo "✗ ERROR: Failed to start containers"
        exit 1
    fi
fi

cd "$SCRIPT_DIR"

echo ""

# ============================================
# Wait for Services (if requested)
# ============================================
if [ "$WAIT_FOR_HEALTHY" = true ]; then
    echo "Waiting for services to be healthy..."

    MAX_ATTEMPTS=30

    # Wait for PostgreSQL
    echo "  Checking PostgreSQL..."
    ATTEMPT=0
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        ATTEMPT=$((ATTEMPT + 1))
        POSTGRES_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' mcp-writing-db 2>/dev/null || echo "unknown")

        if [ "$POSTGRES_HEALTH" = "healthy" ]; then
            echo "✓ PostgreSQL: healthy"
            break
        fi

        if [ "$VERBOSE" = true ]; then
            echo "  Attempt $ATTEMPT/$MAX_ATTEMPTS - PostgreSQL: $POSTGRES_HEALTH"
        fi

        sleep 2
    done

    if [ "$POSTGRES_HEALTH" != "healthy" ]; then
        echo "⚠ WARNING: PostgreSQL not healthy yet"
    fi

    # Wait for MCP Connector
    echo "  Checking MCP Connector..."
    ATTEMPT=0
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        ATTEMPT=$((ATTEMPT + 1))
        CONNECTOR_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' mcp-connector 2>/dev/null || echo "unknown")

        if [ "$CONNECTOR_HEALTH" = "healthy" ]; then
            echo "✓ MCP Connector: healthy"
            break
        fi

        if [ "$VERBOSE" = true ]; then
            echo "  Attempt $ATTEMPT/$MAX_ATTEMPTS - MCP Connector: $CONNECTOR_HEALTH"
        fi

        sleep 2
    done

    if [ "$CONNECTOR_HEALTH" != "healthy" ]; then
        echo "⚠ WARNING: MCP Connector not healthy yet"
    fi

    echo ""
fi

# ============================================
# Get Connection Info
# ============================================
echo "========================================"
echo " Services Ready!"
echo "========================================"
echo ""

# Read auth token from .env
AUTH_TOKEN="not-set"
if [ -f "$ENV_FILE" ]; then
    AUTH_TOKEN=$(grep "MCP_AUTH_TOKEN=" "$ENV_FILE" | cut -d '=' -f2)
fi

echo "Services:"
echo "  PostgreSQL:      localhost:5432"
echo "  MCP Connector:   http://localhost:50880"
echo "  Typing Mind:     http://localhost:3000"

echo ""
echo "MCP Connector:"
echo "  URL: http://localhost:50880"
echo "  Token: $AUTH_TOKEN"

echo ""
echo "Useful Commands:"
echo "  Stop:    cd docker && docker-compose --env-file ../.env down"
echo "  Logs:    cd docker && docker-compose --env-file ../.env logs -f"
echo "  Test:    ./test-docker-stack.ps1 -Verbose"

echo ""

# Return success
exit 0
