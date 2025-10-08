#!/bin/bash
# MCP Tutorial Update Script Template
# This script should be included with each update distribution package

set -e

# Configuration - Update these for each release
VERSION="1.1.0"
IMAGE_FILE="mcp-tutorial-v${VERSION}.tar"
MIGRATIONS_DIR="migrations"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════╗
║   MCP Tutorial Update Script      ║
╚═══════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${CYAN}Updating to version: ${VERSION}${NC}\n"

# Step 1: Check if image file exists
echo -e "${YELLOW}[1/7]${NC} Checking update package..."
if [ ! -f "$IMAGE_FILE" ]; then
    echo -e "${RED}❌ Error: Image file not found: $IMAGE_FILE${NC}"
    echo "Make sure you're running this script from the update package folder"
    exit 1
fi
echo -e "${GREEN}✓${NC} Update package found"

# Step 2: Create backup
echo -e "\n${YELLOW}[2/7]${NC} Creating database backup..."
BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"

if docker exec mcp-tutorial-db pg_dump -U postgres book_series_db > "$BACKUP_FILE" 2>/dev/null; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓${NC} Backup created: $BACKUP_FILE ($BACKUP_SIZE)"
else
    echo -e "${YELLOW}⚠${NC} Could not create backup (database may not be running)"
    read -p "Continue without backup? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Update cancelled"
        exit 1
    fi
fi

# Step 3: Stop services
echo -e "\n${YELLOW}[3/7]${NC} Stopping current services..."
if docker-compose -f docker-compose.mcp.yml down 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Services stopped (data volume preserved)"
else
    echo -e "${YELLOW}⚠${NC} Services may not be running, continuing..."
fi

# Step 4: Load new image
echo -e "\n${YELLOW}[4/7]${NC} Loading new Docker image..."
echo "This may take a minute..."
if docker load -i "$IMAGE_FILE"; then
    echo -e "${GREEN}✓${NC} New image loaded successfully"
else
    echo -e "${RED}❌ Failed to load image${NC}"
    exit 1
fi

# Step 5: Start database
echo -e "\n${YELLOW}[5/7]${NC} Starting database..."
if docker-compose -f docker-compose.mcp.yml up -d postgres; then
    echo "Waiting for database to be ready..."
    sleep 15

    # Wait for database to be actually ready
    TRIES=0
    MAX_TRIES=10
    while [ $TRIES -lt $MAX_TRIES ]; do
        if docker exec mcp-tutorial-db pg_isready -U postgres &>/dev/null; then
            echo -e "${GREEN}✓${NC} Database is ready"
            break
        fi
        sleep 2
        TRIES=$((TRIES + 1))
    done

    if [ $TRIES -eq $MAX_TRIES ]; then
        echo -e "${YELLOW}⚠${NC} Database may not be fully ready, but continuing..."
    fi
else
    echo -e "${RED}❌ Failed to start database${NC}"
    exit 1
fi

# Step 6: Run migrations
echo -e "\n${YELLOW}[6/7]${NC} Running database migrations..."
if [ -d "$MIGRATIONS_DIR" ] && [ "$(ls -A $MIGRATIONS_DIR/*.sql 2>/dev/null)" ]; then
    MIGRATION_COUNT=0
    for migration in $MIGRATIONS_DIR/*.sql; do
        if [ -f "$migration" ]; then
            MIGRATION_NAME=$(basename "$migration")
            echo "  Running: $MIGRATION_NAME"

            if docker exec -i mcp-tutorial-db psql -U postgres -d book_series_db < "$migration" &>/dev/null; then
                echo -e "  ${GREEN}✓${NC} $MIGRATION_NAME completed"
                MIGRATION_COUNT=$((MIGRATION_COUNT + 1))
            else
                echo -e "  ${RED}❌${NC} $MIGRATION_NAME failed"
                echo "  Check migration file for errors"
                read -p "Continue anyway? (y/N) " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    echo "Update cancelled. Database may be in inconsistent state."
                    echo "You can restore from: $BACKUP_FILE"
                    exit 1
                fi
            fi
        fi
    done

    if [ $MIGRATION_COUNT -gt 0 ]; then
        echo -e "${GREEN}✓${NC} Ran $MIGRATION_COUNT migration(s)"
    else
        echo "  No migrations found to run"
    fi
else
    echo "  No migrations directory or files found"
    echo -e "${GREEN}✓${NC} No migrations to run"
fi

# Step 7: Start all services
echo -e "\n${YELLOW}[7/7]${NC} Starting all services..."
if docker-compose -f docker-compose.mcp.yml up -d; then
    echo -e "${GREEN}✓${NC} All services started"
else
    echo -e "${RED}❌ Failed to start services${NC}"
    exit 1
fi

# Wait a moment for services to stabilize
sleep 5

# Verification
echo -e "\n${CYAN}═══════════════════════════════════${NC}"
echo -e "${GREEN}Update Complete! 🎉${NC}"
echo -e "${CYAN}═══════════════════════════════════${NC}\n"

echo "Updated to version: ${VERSION}"
echo "Backup saved as: $BACKUP_FILE"
echo ""

echo "Next steps:"
echo "1. Check service status:"
echo -e "   ${CYAN}docker-compose -f docker-compose.mcp.yml ps${NC}"
echo ""
echo "2. View logs if needed:"
echo -e "   ${CYAN}docker-compose -f docker-compose.mcp.yml logs${NC}"
echo ""
echo "3. Test in Claude Desktop:"
echo "   - Verify your existing data is still there"
echo "   - Try the new features"
echo ""

echo -e "${YELLOW}If you experience issues:${NC}"
echo "1. Check the logs for error messages"
echo "2. Restore from backup: $BACKUP_FILE"
echo "3. See ROLLBACK_INSTRUCTIONS.md (if provided)"
echo "4. Contact your instructor"
echo ""

echo -e "${GREEN}Happy writing! 📚✨${NC}\n"
