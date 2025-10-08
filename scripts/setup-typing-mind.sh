#!/bin/bash
# setup-typing-mind.sh
# Typing Mind setup with MCP Connector for MCP Tutorial

set -e

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
RED='\033[0;31m'
NC='\033[0m'

show_help() {
    cat << EOF
Typing Mind Setup for MCP Tutorial

This script sets up Typing Mind with the MCP Connector.

PREREQUISITES:
    - Node.js installed (https://nodejs.org)
    - Typing Mind auth token (get from Typing Mind settings)

USAGE:
    ./setup-typing-mind.sh YOUR_AUTH_TOKEN

WHAT THIS DOES:
    1. Installs @typingmind/mcp connector globally
    2. Starts Docker containers in stdio mode
    3. Shows you how to start the MCP Connector
    4. Shows you how to configure Typing Mind

MORE INFO:
    See docs/TYPING_MIND_CORRECT_SETUP.md
EOF
    exit 0
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    show_help
fi

if [[ -z "$1" ]]; then
    echo -e "${RED}ERROR: Auth token required${NC}"
    echo -e "${YELLOW}Get your token from: Typing Mind → Settings → MCP Servers → Auth Token${NC}"
    echo -e "${YELLOW}Usage: ./setup-typing-mind.sh YOUR_AUTH_TOKEN${NC}"
    exit 1
fi

AUTH_TOKEN="$1"

echo -e "${CYAN}\n=== Typing Mind Setup ===${NC}\n"

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if ! command -v node &>/dev/null; then
    echo -e "${RED}ERROR: Node.js not found${NC}"
    echo -e "${YELLOW}Install from: https://nodejs.org${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}Node.js $NODE_VERSION installed${NC}"

# Check Docker
echo -e "${YELLOW}Checking Docker...${NC}"
if ! docker info &>/dev/null; then
    echo -e "${RED}ERROR: Docker is not running${NC}"
    echo -e "${YELLOW}Please start Docker Desktop first${NC}"
    exit 1
fi
echo -e "${GREEN}Docker is running${NC}"

# Install TypingMind MCP Connector
echo -e "\n${YELLOW}Installing TypingMind MCP Connector...${NC}"
if ! npm install -g @typingmind/mcp; then
    echo -e "${RED}ERROR: Failed to install connector${NC}"
    exit 1
fi
echo -e "${GREEN}Connector installed${NC}"

# Check for image
echo -e "\n${YELLOW}Checking for MCP Tutorial image...${NC}"
if ! docker images mcp-tutorial:latest --format "{{.Repository}}" 2>/dev/null | grep -q mcp-tutorial; then
    echo -e "${RED}ERROR: MCP Tutorial image not found${NC}"
    echo -e "${YELLOW}Please run: docker load -i mcp-tutorial-image.tar${NC}"
    exit 1
fi
echo -e "${GREEN}Image found${NC}"

# Start Docker containers (stdio mode)
echo -e "\n${YELLOW}Starting MCP servers...${NC}"
if ! docker compose -f docker-compose.mcp.yml up -d; then
    echo -e "${RED}ERROR: Failed to start services${NC}"
    exit 1
fi

echo -e "${GRAY}Waiting for services to start...${NC}"
sleep 10
echo -e "${GREEN}Services started!${NC}"

# Show instructions
echo -e "\n${CYAN}================================${NC}"
echo -e "${CYAN}  Next Steps - Keep This Open  ${NC}"
echo -e "${CYAN}================================${NC}\n"

echo -e "${YELLOW}STEP 1: Start the MCP Connector (in a NEW terminal):${NC}\n"
echo -e "${WHITE}  npx @typingmind/mcp $AUTH_TOKEN --config mcp-config.json${NC}\n"
echo -e "${GRAY}  (Keep that terminal running!)${NC}\n"

echo -e "${YELLOW}STEP 2: Configure Typing Mind:${NC}"
echo -e "${WHITE}  1. Open Typing Mind settings${NC}"
echo -e "${WHITE}  2. Go to: MCP Servers${NC}"
echo -e "${WHITE}  3. Add this URL: ${NC}${CYAN}http://localhost:3000${NC}\n"

echo -e "${YELLOW}STEP 3: Test it!${NC}"
echo -e "${WHITE}  Ask in Typing Mind: 'Can you list all authors?'${NC}\n"

echo -e "${CYAN}================================${NC}\n"

# Copy connector command to clipboard (Mac only)
CONNECTOR_CMD="npx @typingmind/mcp $AUTH_TOKEN --config mcp-config.json"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "$CONNECTOR_CMD" | pbcopy
    echo -e "${GREEN}✓ Connector command copied to clipboard!${NC}\n"
elif command -v xclip &>/dev/null; then
    echo "$CONNECTOR_CMD" | xclip -selection clipboard
    echo -e "${GREEN}✓ Connector command copied to clipboard!${NC}\n"
fi

echo -e "${CYAN}Helpful Commands:${NC}\n"

echo -e "${YELLOW}View MCP server logs:${NC}"
echo -e "${GRAY}  docker compose -f docker-compose.mcp.yml logs -f${NC}\n"

echo -e "${YELLOW}Stop everything:${NC}"
echo -e "${GRAY}  1. Stop connector (Ctrl+C in its terminal)${NC}"
echo -e "${GRAY}  2. docker compose -f docker-compose.mcp.yml down${NC}\n"

echo -e "${GREEN}Done! Now run the connector command in a new terminal. 🎉${NC}\n"
