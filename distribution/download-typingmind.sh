#!/bin/bash
# Download Typing Mind static files from GitHub
# This script fetches the latest self-hosted version of Typing Mind

set -e

echo "=========================================="
echo "Typing Mind Downloader"
echo "=========================================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$SCRIPT_DIR/typing-mind-static"
TEMP_DIR="$SCRIPT_DIR/.tmp-typingmind-download"

# Check if files already exist
if [ -f "$TARGET_DIR/index.html" ]; then
    echo "⚠️  Typing Mind files already exist in $TARGET_DIR"
    echo ""
    read -p "Do you want to re-download and overwrite? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Download cancelled"
        exit 0
    fi
    echo ""
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Error: git is not installed"
    echo "   Please install git first:"
    echo "   - Ubuntu/Debian: sudo apt-get install git"
    echo "   - MacOS: brew install git"
    echo "   - Windows: https://git-scm.com/download/win"
    exit 1
fi

echo "📥 Downloading Typing Mind from GitHub..."
echo "   Repository: https://github.com/TypingMind/typingmind"
echo ""

# Remove temp directory if it exists from previous failed run
if [ -d "$TEMP_DIR" ]; then
    echo "   Cleaning up previous temp directory..."
    rm -rf "$TEMP_DIR"
fi

# Create fresh temp directory
mkdir -p "$TEMP_DIR"

# Clone the repository
git clone --depth 1 https://github.com/TypingMind/typingmind.git "$TEMP_DIR" 2>&1 | sed 's/^/   /'

if [ ! -d "$TEMP_DIR/src" ]; then
    echo "❌ Error: Failed to download Typing Mind files"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo ""
echo "✅ Download complete!"
echo ""
echo "📦 Installing files to $TARGET_DIR..."

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy files (preserve README.md if it exists)
if [ -f "$TARGET_DIR/README.md" ]; then
    cp "$TARGET_DIR/README.md" "$TEMP_DIR/README.md.backup"
fi

# Remove old files (except README.md)
find "$TARGET_DIR" -mindepth 1 ! -name "README.md" -delete

# Copy new files
cp -r "$TEMP_DIR/src/"* "$TARGET_DIR/"

# Restore README.md if it was backed up
if [ -f "$TEMP_DIR/README.md.backup" ]; then
    cp "$TEMP_DIR/README.md.backup" "$TARGET_DIR/README.md"
fi

# Cleanup
rm -rf "$TEMP_DIR"

# Count files
FILE_COUNT=$(find "$TARGET_DIR" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$TARGET_DIR" | cut -f1)

echo "✅ Installation complete!"
echo ""
echo "📊 Statistics:"
echo "   Files installed: $FILE_COUNT"
echo "   Total size: $TOTAL_SIZE"
echo "   Location: $TARGET_DIR"
echo ""
echo "🎯 Next Steps:"
echo "   1. Start Docker: cd docker && docker-compose up -d"
echo "   2. Access Typing Mind: http://localhost:3000"
echo "   3. Configure MCP Connector in Typing Mind settings"
echo ""
echo "📖 For detailed instructions, see TYPING-MIND-SETUP.md"
echo ""
echo "=========================================="
echo "✅ Done!"
echo "=========================================="
