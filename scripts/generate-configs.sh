#!/bin/bash
# Shell script to generate MCP configurations for Mac/Linux users
# Usage: ./scripts/generate-configs.sh [options]

# Default settings
GENERATE_CLAUDE=true
GENERATE_TYPINGMIND=true
SHOW_CONFIG=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --claude)
            GENERATE_CLAUDE=true
            GENERATE_TYPINGMIND=false
            ;;
        --typing-mind)
            GENERATE_CLAUDE=false
            GENERATE_TYPINGMIND=true
            ;;
        --show-config)
            SHOW_CONFIG=true
            ;;
        --help)
            echo "🔧 MCP Configuration Generator"
            echo ""
            echo "Usage: ./scripts/generate-configs.sh [options]"
            echo ""
            echo "Options:"
            echo "  --claude        Generate Claude Desktop configuration only"
            echo "  --typing-mind   Generate Typing Mind configuration only"
            echo "  --show-config   Show current configuration values"
            echo "  --help          Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./scripts/generate-configs.sh                  # Generate both configs"
            echo "  ./scripts/generate-configs.sh --claude         # Generate Claude config only"
            echo "  ./scripts/generate-configs.sh --typing-mind    # Generate Typing Mind config only"
            echo "  ./scripts/generate-configs.sh --show-config    # Show current settings"
            echo ""
            echo "Environment Variables:"
            echo "  MCP_TUTORIAL_PATH    Path to the MCP tutorial project (default: current directory)"
            exit 0
            ;;
    esac
done

# Make sure we're in the project root
SCRIPT_DIR=$(dirname "$0")
cd "$SCRIPT_DIR/.." || exit 1

# Check node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js and make sure it's available in your PATH"
    exit 1
fi

# Run the generator
if [ "$SHOW_CONFIG" = true ]; then
    node scripts/generate-configs.js --show-config
elif [ "$GENERATE_CLAUDE" = true ] && [ "$GENERATE_TYPINGMIND" = true ]; then
    node scripts/generate-configs.js
elif [ "$GENERATE_CLAUDE" = true ]; then
    node scripts/generate-configs.js --claude
elif [ "$GENERATE_TYPINGMIND" = true ]; then
    node scripts/generate-configs.js --typing-mind
fi

# Set execute permissions
chmod +x scripts/generate-configs.sh

echo "✅ Configuration generation complete"