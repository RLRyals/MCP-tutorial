#!/bin/bash
# generate-docker-mcp-config.sh
# Generates Claude Desktop configuration for Docker-based MCP servers

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m'

ALL_SERVERS=false
SHOW_CONFIG=false
SERVERS=()

show_help() {
    cat << EOF
Generate Claude Desktop Config for Docker MCP Servers

This script generates the claude_desktop_config.json configuration
for running MCP servers via Docker containers.

USAGE:
    ./generate-docker-mcp-config.sh [OPTIONS]

OPTIONS:
    -a, --all              Include all 12 MCP servers
    -s, --servers <list>   Include specific servers (comma-separated)
    -c, --show-config      Display config without saving
    -h, --help             Show this help message

EXAMPLES:
    # Generate config with all servers
    ./generate-docker-mcp-config.sh --all

    # Generate config with specific servers
    ./generate-docker-mcp-config.sh --servers author,series,book

    # Just show what the config would look like
    ./generate-docker-mcp-config.sh --all --show-config

AVAILABLE SERVERS:
    author, series, book, character, timeline, metadata,
    trope, plot, relationship, story-analysis, world, writing

EOF
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--all)
            ALL_SERVERS=true
            shift
            ;;
        -s|--servers)
            IFS=',' read -ra SERVERS <<< "$2"
            shift 2
            ;;
        -c|--show-config)
            SHOW_CONFIG=true
            shift
            ;;
        -h|--help)
            show_help
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Available servers configuration
declare -A SERVER_INFO
SERVER_INFO[author]="author-manager|mcp-tutorial-author|Author management tools"
SERVER_INFO[series]="series-manager|mcp-tutorial-series|Book series management"
SERVER_INFO[book]="book-manager|mcp-tutorial-book|Book and chapter management"
SERVER_INFO[character]="character-manager|mcp-tutorial-character|Character tracking and development"
SERVER_INFO[timeline]="timeline-manager|mcp-tutorial-timeline|Story timeline management"
SERVER_INFO[metadata]="metadata-manager|mcp-tutorial-metadata|Metadata and lookup management"
SERVER_INFO[trope]="trope-manager|mcp-tutorial-trope|Literary trope tracking"
SERVER_INFO[plot]="plot-manager|mcp-tutorial-plot|Plot structure and threads"
SERVER_INFO[relationship]="relationship-manager|mcp-tutorial-relationship|Character relationship tracking"
SERVER_INFO[story-analysis]="story-analysis|mcp-tutorial-story-analysis|Story analysis tools"
SERVER_INFO[world]="world-builder|mcp-tutorial-world|World building management"
SERVER_INFO[writing]="writing-manager|mcp-tutorial-writing|Writing session management"

# Determine which servers to include
SELECTED_SERVERS=()

if [ "$ALL_SERVERS" = true ]; then
    SELECTED_SERVERS=("author" "series" "book" "character" "timeline" "metadata" "trope" "plot" "relationship" "story-analysis" "world" "writing")
elif [ ${#SERVERS[@]} -gt 0 ]; then
    for server in "${SERVERS[@]}"; do
        server=$(echo "$server" | xargs | tr '[:upper:]' '[:lower:]')
        if [[ -n "${SERVER_INFO[$server]}" ]]; then
            SELECTED_SERVERS+=("$server")
        else
            echo -e "${YELLOW}Warning: Unknown server '$server' (skipping)${NC}"
        fi
    done
else
    # Default servers
    SELECTED_SERVERS=("author" "series" "book" "character")
    echo -e "${CYAN}No servers specified. Including default set: ${SELECTED_SERVERS[*]}${NC}"
    echo -e "${CYAN}Use --all to include all, or --servers to specify which ones${NC}\n"
fi

if [ ${#SELECTED_SERVERS[@]} -eq 0 ]; then
    echo -e "${RED}No servers selected. Use --all or --servers <list>${NC}"
    exit 1
fi

# Build JSON configuration
JSON_CONFIG='{\n  "mcpServers": {'

FIRST=true
for server_key in "${SELECTED_SERVERS[@]}"; do
    IFS='|' read -r name container description <<< "${SERVER_INFO[$server_key]}"

    if [ "$FIRST" = true ]; then
        FIRST=false
    else
        JSON_CONFIG+=','
    fi

    JSON_CONFIG+="\n    \"$name\": {\n"
    JSON_CONFIG+="      \"command\": \"docker\",\n"
    JSON_CONFIG+="      \"args\": [\"exec\", \"-i\", \"$container\", \"node\", \"src/mcps/$server_key-server/index.js\"]\n"
    JSON_CONFIG+="    }"
done

JSON_CONFIG+='\n  }\n}'

# Display configuration
echo -e "${GREEN}"
echo "Generated Claude Desktop Configuration:"
echo "========================================"
echo -e "${NC}"

echo -e "${CYAN}Including ${#SELECTED_SERVERS[@]} MCP servers:${NC}"
for server_key in "${SELECTED_SERVERS[@]}"; do
    IFS='|' read -r name container description <<< "${SERVER_INFO[$server_key]}"
    echo -e "  ${GREEN}✓${NC} $name - ${GRAY}$description${NC}"
done
echo ""

echo -e "${GRAY}$JSON_CONFIG${NC}"

if [ "$SHOW_CONFIG" = true ]; then
    echo -e "\n${YELLOW}(Display only mode - not saving)${NC}"
    exit 0
fi

# Save to file
OUTPUT_FILE="claude_desktop_config.docker.json"
echo -e "$JSON_CONFIG" > "$OUTPUT_FILE"

echo -e "\n${GREEN}✓ Configuration saved to: $OUTPUT_FILE${NC}"

# Detect Claude Desktop config location
CLAUDE_CONFIG_PATH=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    CLAUDE_CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    CLAUDE_CONFIG_PATH="$APPDATA/Claude/claude_desktop_config.json"
fi

echo -e "\n${CYAN}Next Steps:${NC}"
echo "1. Ensure Docker containers are running:"
echo -e "   ${GRAY}docker-compose -f docker-compose.mcp.yml ps${NC}"

if [ -n "$CLAUDE_CONFIG_PATH" ]; then
    echo -e "\n2. Copy to your Claude Desktop config location:"
    echo -e "   ${GRAY}$CLAUDE_CONFIG_PATH${NC}"

    echo -e "\n3. Or merge with existing config if you have other MCP servers"

    read -p $'\nCopy to Claude Desktop config now? (y/n) ' -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        CLAUDE_DIR=$(dirname "$CLAUDE_CONFIG_PATH")
        mkdir -p "$CLAUDE_DIR"

        # Backup existing config
        if [ -f "$CLAUDE_CONFIG_PATH" ]; then
            BACKUP_PATH="${CLAUDE_CONFIG_PATH}.backup_$(date +%Y%m%d_%H%M%S)"
            cp "$CLAUDE_CONFIG_PATH" "$BACKUP_PATH"
            echo -e "${GREEN}✓ Backed up existing config to: $BACKUP_PATH${NC}"
        fi

        cp "$OUTPUT_FILE" "$CLAUDE_CONFIG_PATH"
        echo -e "${GREEN}✓ Configuration copied successfully!${NC}"
        echo -e "\n${YELLOW}⚠ IMPORTANT: Completely quit and restart Claude Desktop${NC}"
    fi
else
    echo -e "\n2. Copy this config to your Claude Desktop location"
fi

echo -e "\n4. Restart Claude Desktop (quit completely, don't just close)"
echo "5. Look for the 🔨 tool icon in Claude Desktop"

echo -e "\n${GREEN}Done! 🚀${NC}\n"
