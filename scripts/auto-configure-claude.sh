#!/bin/bash
# auto-configure-claude.sh
# Automatically configures Claude Desktop for MCP Tutorial

set -e

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GRAY='\033[0;37m'
NC='\033[0m'

show_help() {
    cat << EOF
Auto-Configure Claude Desktop for MCP Tutorial

USAGE:
    ./auto-configure-claude.sh [OPTIONS]

OPTIONS:
    --typing-mind    Show Typing Mind configuration instead
    -h, --help       Show this help

EXAMPLES:
    # Configure Claude Desktop
    ./auto-configure-claude.sh

    # Show Typing Mind instructions
    ./auto-configure-claude.sh --typing-mind
EOF
    exit 0
}

# Parse arguments
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    show_help
fi

if [[ "$1" == "--typing-mind" ]]; then
    cat << 'EOF'

=== Typing Mind Configuration ===

1. Start MCP servers in HTTP mode:
   docker compose -f docker-compose.typing-mind.yml up -d

2. In Typing Mind, go to Settings → MCP Servers

3. Add each server:

   Author Manager:     http://localhost:3501
   Series Manager:     http://localhost:3502
   Book Manager:       http://localhost:3503
   Character Manager:  http://localhost:3504
   Timeline Manager:   http://localhost:3505
   Metadata Manager:   http://localhost:3506
   Trope Manager:      http://localhost:3507
   Plot Manager:       http://localhost:3508
   Relationship Mgr:   http://localhost:3509
   Story Analysis:     http://localhost:3510
   World Builder:      http://localhost:3511
   Writing Manager:    http://localhost:3512

4. Test: Ask "List all authors"

EOF
    exit 0
fi

echo -e "${CYAN}\n=== Claude Desktop Auto-Configuration ===${NC}\n"

# Detect Claude config location
CLAUDE_CONFIG_PATH=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    CLAUDE_CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CLAUDE_CONFIG_PATH="$HOME/.config/Claude/claude_desktop_config.json"
fi

if [ -z "$CLAUDE_CONFIG_PATH" ]; then
    echo -e "${RED}Could not detect Claude Desktop config location${NC}"
    exit 1
fi

echo -e "${GRAY}Claude config location: $CLAUDE_CONFIG_PATH${NC}"

# Check if Claude Desktop is installed
CLAUDE_DIR=$(dirname "$CLAUDE_CONFIG_PATH")
if [ ! -d "$CLAUDE_DIR" ]; then
    echo -e "\n${YELLOW}Claude Desktop not found!${NC}"
    echo -e "${NC}Please install Claude Desktop first: https://claude.ai/download${NC}"
    exit 1
fi

# Create directory if it doesn't exist
mkdir -p "$CLAUDE_DIR"

# Backup existing config
if [ -f "$CLAUDE_CONFIG_PATH" ]; then
    BACKUP_PATH="${CLAUDE_CONFIG_PATH}.backup_$(date +%Y%m%d_%H%M%S)"
    cp "$CLAUDE_CONFIG_PATH" "$BACKUP_PATH"
    echo -e "\n${GREEN}Backed up existing config to:${NC}"
    echo -e "${GRAY}  $BACKUP_PATH${NC}"
fi

# Generate config
cat > "$CLAUDE_CONFIG_PATH" << 'EOF'
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
    },
    "timeline-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-timeline", "node", "src/mcps/timeline-server/index.js"]
    },
    "metadata-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-metadata", "node", "src/mcps/metadata-server/index.js"]
    },
    "trope-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-trope", "node", "src/mcps/trope-server/index.js"]
    },
    "plot-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-plot", "node", "src/mcps/plot-server/index.js"]
    },
    "relationship-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-relationship", "node", "src/mcps/relationship-server/index.js"]
    },
    "story-analysis": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-story-analysis", "node", "src/mcps/story-analysis-server/index.js"]
    },
    "world-builder": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-world", "node", "src/mcps/world-server/index.js"]
    },
    "writing-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-writing", "node", "src/mcps/writing-server/index.js"]
    }
  }
}
EOF

echo -e "\n${GREEN}Configuration saved!${NC}"

# Show what was configured
echo -e "\n${CYAN}Configured 12 MCP servers:${NC}"
echo -e "${NC}  ✓ author-manager"
echo -e "  ✓ series-manager"
echo -e "  ✓ book-manager"
echo -e "  ✓ character-manager"
echo -e "  ✓ timeline-manager"
echo -e "  ✓ metadata-manager"
echo -e "  ✓ trope-manager"
echo -e "  ✓ plot-manager"
echo -e "  ✓ relationship-manager"
echo -e "  ✓ story-analysis"
echo -e "  ✓ world-builder"
echo -e "  ✓ writing-manager${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "${NC}1. Ensure Docker containers are running:${NC}"
echo -e "${GRAY}   docker compose -f docker-compose.mcp.yml ps${NC}"
echo -e ""
echo -e "${NC}2. Completely quit Claude Desktop:${NC}"
echo -e "${GRAY}   (Quit from menu, don't just close window)${NC}"
echo -e ""
echo -e "${NC}3. Restart Claude Desktop${NC}"
echo -e ""
echo -e "${NC}4. Look for 🔨 tool icon${NC}"
echo -e ""
echo -e "${NC}5. Test: Ask 'Can you list all authors?'${NC}"
echo -e ""

echo -e "${GREEN}Done! 🎉${NC}\n"
