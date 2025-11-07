#!/bin/bash
# Update Typing Mind Files for Electron App
# This script is designed to be called by an Electron app to update Typing Mind
# It handles backup, download, and rollback on failure

set -e

# Parse arguments
TARGET_DIR=""
DOCKER_COMPOSE_DIR=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --target-dir)
            TARGET_DIR="$2"
            shift 2
            ;;
        --docker-compose-dir)
            DOCKER_COMPOSE_DIR="$2"
            shift 2
            ;;
        *)
            echo "ERROR|Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate required arguments
if [ -z "$TARGET_DIR" ]; then
    echo "ERROR|--target-dir is required"
    exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
    echo "ERROR|Target directory does not exist: $TARGET_DIR"
    exit 1
fi

BACKUP_DIR="$TARGET_DIR-backup-$(date +%Y%m%d-%H%M%S)"
TEMP_DIR="$(dirname "$TARGET_DIR")/.tmp-typingmind-update"

cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}

trap cleanup EXIT

restore_backup() {
    if [ -d "$BACKUP_DIR" ]; then
        echo "INFO|Restoring from backup"
        rm -rf "$TARGET_DIR"
        cp -r "$BACKUP_DIR" "$TARGET_DIR"
        echo "INFO|Backup restored successfully"
    fi
}

trap 'restore_backup; exit 1' ERR

# Start update process
echo "INFO|Starting Typing Mind update"
echo "INFO|Target: $TARGET_DIR"

# Create temp directory
echo "INFO|Creating temporary directory"
mkdir -p "$TEMP_DIR"

# Clone repository
echo "INFO|Downloading latest Typing Mind from GitHub"
if ! git clone --depth 1 https://github.com/TypingMind/typingmind.git "$TEMP_DIR" 2>&1; then
    echo "ERROR|Git clone failed"
    exit 1
fi

# Check for src folder
SRC_PATH="$TEMP_DIR/src"
if [ ! -d "$SRC_PATH" ]; then
    echo "ERROR|Repository structure has changed - src folder not found"
    echo "INFO|Available folders:"
    find "$TEMP_DIR" -maxdepth 1 -type d | while read dir; do
        echo "INFO|  - $(basename "$dir")"
    done
    exit 1
fi

# Backup current installation
echo "INFO|Backing up current installation"
if [ -d "$TARGET_DIR" ]; then
    cp -r "$TARGET_DIR" "$BACKUP_DIR"
    echo "INFO|Backup created: $BACKUP_DIR"
fi

# Remove old files
echo "INFO|Removing old files"
find "$TARGET_DIR" -mindepth 1 -delete

# Copy new files
echo "INFO|Installing new files"
cp -r "$SRC_PATH/"* "$TARGET_DIR/"

# Verify installation
if [ ! -f "$TARGET_DIR/index.html" ]; then
    echo "ERROR|Installation verification failed - index.html not found"
    restore_backup
    exit 1
fi

# Count files
FILE_COUNT=$(find "$TARGET_DIR" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$TARGET_DIR" | cut -f1)

echo "SUCCESS|Update complete"
echo "INFO|Files: $FILE_COUNT"
echo "INFO|Size: $TOTAL_SIZE"

# Restart Docker container if docker-compose directory provided
if [ -n "$DOCKER_COMPOSE_DIR" ] && [ -d "$DOCKER_COMPOSE_DIR" ]; then
    echo "INFO|Restarting Typing Mind container"

    if (cd "$DOCKER_COMPOSE_DIR" && docker-compose restart typing-mind-web > /dev/null 2>&1); then
        echo "INFO|Container restarted successfully"
    else
        echo "WARN|Failed to restart container - please restart manually"
    fi
fi

# Cleanup backup after success
echo "INFO|Cleaning up backup"
rm -rf "$BACKUP_DIR"

echo "SUCCESS|Typing Mind updated successfully"
exit 0
