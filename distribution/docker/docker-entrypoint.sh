#!/bin/bash
set -e

echo "=========================================="
echo "MCP Writing System - Connector Starting"
echo "=========================================="

# Function to wait for PostgreSQL
wait_for_postgres() {
    echo "⏳ Waiting for PostgreSQL to be ready..."

    local max_attempts=30
    local attempt=0

    until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
        attempt=$((attempt + 1))

        if [ $attempt -eq $max_attempts ]; then
            echo "❌ PostgreSQL did not become ready in time"
            exit 1
        fi

        echo "   PostgreSQL is unavailable - attempt $attempt/$max_attempts"
        sleep 2
    done

    echo "✅ PostgreSQL is ready!"
}

# Function to discover MCP servers
discover_mcp_servers() {
    echo ""
    echo "🔍 Discovering MCP servers..."

    local server_count=0
    local config_mcps_dir="/app/src/config-mcps"
    local mcps_dir="/app/src/mcps"

    # Count config-mcps servers
    if [ -d "$config_mcps_dir" ]; then
        for server_dir in "$config_mcps_dir"/*; do
            if [ -d "$server_dir" ] && [ -f "$server_dir/index.js" ]; then
                local server_name=$(basename "$server_dir")
                echo "   ✓ Found: $server_name (config-mcps)"
                server_count=$((server_count + 1))
            fi
        done
    fi

    # Count optional author-server if enabled
    if [ "$INCLUDE_AUTHOR_SERVER" = "true" ]; then
        if [ -f "$mcps_dir/author-server/index.js" ]; then
            echo "   ✓ Found: author-server (optional)"
            server_count=$((server_count + 1))
        fi
    fi

    echo "✅ Discovered $server_count MCP server(s)"
}

# Function to start MCP Connector
start_mcp_connector() {
    echo ""
    echo "🚀 Starting MCP Connector..."
    echo "   Port: ${PORT:-50880}"
    echo "   Auth Token: ${MCP_AUTH_TOKEN:0:8}****"
    echo "   Database: $POSTGRES_DB @ $POSTGRES_HOST"
    echo ""

    # Start the MCP Connector with the auth token
    # The connector will discover and run all MCP servers
    exec npx @typingmind/mcp@latest "$MCP_AUTH_TOKEN"
}

# Main execution
main() {
    # Validate required environment variables
    if [ -z "$MCP_AUTH_TOKEN" ]; then
        echo "❌ ERROR: MCP_AUTH_TOKEN is not set"
        exit 1
    fi

    if [ -z "$POSTGRES_PASSWORD" ]; then
        echo "❌ ERROR: POSTGRES_PASSWORD is not set"
        exit 1
    fi

    # Execute startup sequence
    wait_for_postgres
    discover_mcp_servers
    start_mcp_connector
}

# Run main function
main
