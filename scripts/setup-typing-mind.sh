#!/bin/bash
# setup-typing-mind.sh
# Simplified Typing Mind setup for MCP Tutorial

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

This script starts the MCP servers in HTTP mode and shows you
the URLs to add in Typing Mind.

USAGE:
    ./setup-typing-mind.sh

WHAT THIS DOES:
    1. Checks Docker is running
    2. Starts MCP servers in HTTP mode (ports 3501-3512)
    3. Shows you the URLs to copy into Typing Mind
EOF
    exit 0
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    show_help
fi

echo -e "${CYAN}\n=== Typing Mind Setup ===${NC}\n"

# Check Docker
echo -e "${YELLOW}Checking Docker...${NC}"
if ! docker info &>/dev/null; then
    echo -e "${RED}ERROR: Docker is not running${NC}"
    echo -e "${YELLOW}Please start Docker Desktop first${NC}"
    exit 1
fi
echo -e "${GREEN}Docker is running${NC}"

# Check for image
echo -e "\n${YELLOW}Checking for MCP Tutorial image...${NC}"
if ! docker images mcp-tutorial:latest --format "{{.Repository}}" 2>/dev/null | grep -q mcp-tutorial; then
    echo -e "${RED}ERROR: MCP Tutorial image not found${NC}"
    echo -e "${YELLOW}Please run: docker load -i mcp-tutorial-image.tar${NC}"
    exit 1
fi
echo -e "${GREEN}Image found${NC}"

# Start HTTP servers
echo -e "\n${YELLOW}Starting MCP servers in HTTP mode...${NC}"
if ! docker compose -f docker-compose.typing-mind.yml up -d; then
    echo -e "${RED}ERROR: Failed to start services${NC}"
    exit 1
fi

echo -e "${GRAY}Waiting for services to start...${NC}"
sleep 10

echo -e "${GREEN}Services started!${NC}"

# Test one endpoint
echo -e "\n${YELLOW}Testing connection...${NC}"
if curl -s -f http://localhost:3501/health &>/dev/null; then
    echo -e "${GREEN}Services are responding${NC}"
else
    echo -e "${YELLOW}WARNING: Services may still be starting up${NC}"
fi

# Show configuration
echo -e "\n${CYAN}=======================${NC}"
echo -e "${CYAN}  Typing Mind Setup  ${NC}"
echo -e "${CYAN}=======================${NC}\n"

echo -e "${YELLOW}STEP 1: Open Typing Mind${NC}"
echo -e "${WHITE}  Go to: https://www.typingmind.com/${NC}\n"

echo -e "${YELLOW}STEP 2: Go to Settings → MCP Servers${NC}\n"

echo -e "${YELLOW}STEP 3: Add these servers (copy-paste the URLs):${NC}\n"

# Show servers
printf "${CYAN}  %-22s${NC} ${WHITE}%s${NC}\n" "Author Manager" "http://localhost:3501"
printf "${CYAN}  %-22s${NC} ${WHITE}%s${NC}\n" "Series Manager" "http://localhost:3502"
printf "${CYAN}  %-22s${NC} ${WHITE}%s${NC}\n" "Book Manager" "http://localhost:3503"
printf "${CYAN}  %-22s${NC} ${WHITE}%s${NC}\n" "Character Manager" "http://localhost:3504"
printf "${CYAN}  %-22s${NC} ${WHITE}%s${NC}\n" "Timeline Manager" "http://localhost:3505"
printf "${CYAN}  %-22s${NC} ${WHITE}%s${NC}\n" "Metadata Manager" "http://localhost:3506"
printf "${CYAN}  %-22s${NC} ${WHITE}%s${NC}\n" "Trope Manager" "http://localhost:3507"
printf "${CYAN}  %-22s${NC} ${WHITE}%s${NC}\n" "Plot Manager" "http://localhost:3508"
printf "${CYAN}  %-22s${NC} ${WHITE}%s${NC}\n" "Relationship Manager" "http://localhost:3509"
printf "${CYAN}  %-22s${NC} ${WHITE}%s${NC}\n" "Story Analysis" "http://localhost:3510"
printf "${CYAN}  %-22s${NC} ${WHITE}%s${NC}\n" "World Builder" "http://localhost:3511"
printf "${CYAN}  %-22s${NC} ${WHITE}%s${NC}\n" "Writing Manager" "http://localhost:3512"

echo -e "\n${YELLOW}STEP 4: Test it!${NC}"
echo -e "${WHITE}  Ask in Typing Mind: 'Can you list all authors?'${NC}\n"

echo -e "${CYAN}Helpful Commands:${NC}\n"

echo -e "${YELLOW}Copy ALL URLs at once (Mac):${NC}"
echo -e "${GRAY}  for port in {3501..3512}; do echo \"http://localhost:\$port\"; done | pbcopy${NC}"
echo -e "${GRAY}  echo \"URLs copied to clipboard!\"${NC}\n"

echo -e "${YELLOW}View server logs:${NC}"
echo -e "${GRAY}  docker compose -f docker-compose.typing-mind.yml logs -f${NC}\n"

echo -e "${YELLOW}Stop servers when done:${NC}"
echo -e "${GRAY}  docker compose -f docker-compose.typing-mind.yml down${NC}\n"

echo -e "${GREEN}Done! 🎉${NC}\n"

# Ask if they want URLs copied (Mac only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    read -p "Copy all URLs to clipboard now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for port in {3501..3512}; do echo "http://localhost:$port"; done | pbcopy
        echo -e "\n${GREEN}URLs copied! Paste into Typing Mind.${NC}\n"
    fi
fi
