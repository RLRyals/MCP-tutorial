# Updating Docker MCP Distribution Without Data Loss

This guide explains how to update MCP servers for students while preserving their database and work.

## Table of Contents
- [Update Strategy Overview](#update-strategy-overview)
- [For Instructors: Building Updates](#for-instructors-building-updates)
- [For Students: Applying Updates](#for-students-applying-updates)
- [Database Migration Strategy](#database-migration-strategy)
- [Rollback Procedures](#rollback-procedures)

---

## Update Strategy Overview

### What Gets Updated
✅ **Application Code** (MCP servers)
✅ **Database Schema** (via migrations)
✅ **Dependencies** (Node packages)

### What Gets Preserved
🔒 **Student Data** (database contents)
🔒 **Environment Config** (.env file)
🔒 **Database Volume** (PostgreSQL data)

### Key Principle
**Docker volumes persist independently of containers.** When you update the image and restart containers, the database volume remains untouched, preserving all student data.

---

## For Instructors: Building Updates

### 1. Version Your Updates

Create a versioning scheme for tracking changes:

```bash
# Tag your releases
git tag -a v1.1.0 -m "Added plot analysis features"
git push origin v1.1.0

# Build with version tag
docker build -t mcp-tutorial:v1.1.0 -t mcp-tutorial:latest .
```

### 2. Create Database Migrations (If Needed)

If you're adding new database features:

**Create Migration File:**
```sql
-- migrations/003_add_plot_features.sql
-- Migration: Add plot analysis tables
-- Version: 1.1.0
-- Safe to run multiple times: YES

-- Add new table
CREATE TABLE IF NOT EXISTS plot_analysis (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    analysis_type VARCHAR(100),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add new column to existing table
ALTER TABLE books
ADD COLUMN IF NOT EXISTS plot_complexity_score INTEGER DEFAULT 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_plot_analysis_book
ON plot_analysis(book_id);
```

**Key Migration Best Practices:**
- Use `IF NOT EXISTS` for tables/columns
- Use `CREATE OR REPLACE` for functions
- Make migrations idempotent (safe to run multiple times)
- Include rollback SQL in comments
- Test on a copy of student database first

### 3. Build Update Package

**Option A: Full Distribution (Recommended for Major Updates)**
```bash
# Build everything
./scripts/build-for-distribution.sh -o distribution-v1.1.0

# Contents will include:
# - Updated Docker image
# - New migration files
# - Update instructions
```

**Option B: Image-Only Update (Minor Updates)**
```bash
# Just build and export the new image
docker build -t mcp-tutorial:latest .
docker save mcp-tutorial:latest -o mcp-tutorial-v1.1.0.tar

# Manually create update package:
# distribution-update-v1.1.0/
# ├── mcp-tutorial-v1.1.0.tar
# ├── migrations/ (new migration files only)
# ├── UPDATE_INSTRUCTIONS.md
# └── update-scripts/ (optional helper scripts)
```

### 4. Create Update Instructions for Students

**Example: `UPDATE_INSTRUCTIONS.md`**
```markdown
# Update to Version 1.1.0 - Plot Analysis Features

## What's New
- New plot analysis tools
- Enhanced character relationship tracking
- Performance improvements

## Prerequisites
- Existing MCP Tutorial installation
- Docker Desktop running
- 5 minutes

## Update Steps

### 1. Backup Your Data (Recommended)
\`\`\`bash
# Create backup of your database
docker exec mcp-tutorial-db pg_dump -U postgres book_series_db > backup-$(date +%Y%m%d).sql
\`\`\`

### 2. Stop Current Services
\`\`\`bash
docker-compose -f docker-compose.mcp.yml down
\`\`\`
**Note:** This stops containers but preserves your data!

### 3. Load New Image
\`\`\`bash
docker load -i mcp-tutorial-v1.1.0.tar
\`\`\`

### 4. Run Database Migrations
\`\`\`bash
# Start just the database
docker-compose -f docker-compose.mcp.yml up -d postgres

# Wait for it to be ready
sleep 10

# Run migration (copy from update package)
docker exec -i mcp-tutorial-db psql -U postgres -d book_series_db < migrations/003_add_plot_features.sql
\`\`\`

### 5. Start All Services
\`\`\`bash
docker-compose -f docker-compose.mcp.yml up -d
\`\`\`

### 6. Verify Update
\`\`\`bash
# Check all containers are running
docker-compose -f docker-compose.mcp.yml ps

# Test in Claude Desktop
# Ask: "What new plot analysis features are available?"
\`\`\`

## Troubleshooting
See ROLLBACK_INSTRUCTIONS.md if needed.
```

### 5. Test Update Process

**Before distributing, test on a clone of student environment:**

```bash
# 1. Set up test environment mimicking student setup
docker-compose -f docker-compose.mcp.yml up -d

# 2. Add test data
# (simulate student work)

# 3. Follow your own update instructions
docker-compose down
docker load -i mcp-tutorial-v1.1.0.tar
# ... etc

# 4. Verify data persists
# Check test data is still there

# 5. Verify new features work
```

---

## For Students: Applying Updates

### Safe Update Process

#### 1. Backup First (Always!)

**Quick Backup:**
```bash
# Backup database to file
docker exec mcp-tutorial-db pg_dump -U postgres book_series_db > my-backup-$(date +%Y%m%d).sql
```

**What this backs up:**
- All your authors, series, books
- All characters and relationships
- All timelines and plot data
- Everything in the database

**What this doesn't backup:**
- Environment settings (.env) - but you rarely change these
- Docker config - you can re-download

#### 2. Stop Services (Data Stays Safe!)

```bash
# Stop containers (data volume remains)
docker-compose -f docker-compose.mcp.yml down
```

**Important:** This command:
- ✅ Stops all containers
- ✅ Removes containers
- ✅ **KEEPS database volume** (your data)
- ✅ **KEEPS .env file**
- ❌ Does NOT delete your data

**Don't use:**
```bash
# DON'T USE THIS - it deletes data!
docker-compose -f docker-compose.mcp.yml down -v  # ❌ -v flag removes volumes
```

#### 3. Load Updated Image

```bash
# Load new image from instructor
docker load -i mcp-tutorial-v1.1.0.tar
```

This replaces the application code but doesn't touch data.

#### 4. Run Migrations (If Provided)

If your instructor includes migration files:

```bash
# Start database only
docker-compose -f docker-compose.mcp.yml up -d postgres

# Wait for database to be ready
sleep 10

# Run migration
docker exec -i mcp-tutorial-db psql -U postgres -d book_series_db < migrations/003_add_plot_features.sql
```

#### 5. Start Updated Services

```bash
# Start all services with new image
docker-compose -f docker-compose.mcp.yml up -d
```

The containers now run new code, but connect to your existing database volume.

#### 6. Verify Everything Works

```bash
# Check services
docker-compose -f docker-compose.mcp.yml ps

# Check logs for errors
docker-compose -f docker-compose.mcp.yml logs | grep -i error

# Test in Claude Desktop
# Verify your data is still there
# Try: "List all my series" or "Show my characters"
```

---

## Database Migration Strategy

### For Instructors: Writing Safe Migrations

**Template for Safe Migrations:**
```sql
-- Migration: [Description]
-- Version: [Version Number]
-- Date: [YYYY-MM-DD]
-- Author: [Your Name]

-- ============================================
-- FORWARD MIGRATION (Applied during update)
-- ============================================

BEGIN;

-- Add new table
CREATE TABLE IF NOT EXISTS new_feature (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add column to existing table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='existing_table' AND column_name='new_column'
    ) THEN
        ALTER TABLE existing_table ADD COLUMN new_column TEXT;
    END IF;
END $$;

-- Add index
CREATE INDEX IF NOT EXISTS idx_new_feature_name ON new_feature(name);

-- Add constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name='fk_new_feature_ref'
    ) THEN
        ALTER TABLE new_feature
        ADD CONSTRAINT fk_new_feature_ref
        FOREIGN KEY (ref_id) REFERENCES other_table(id);
    END IF;
END $$;

COMMIT;

-- ============================================
-- ROLLBACK (Copy to separate file if needed)
-- ============================================
-- DROP TABLE IF EXISTS new_feature;
-- ALTER TABLE existing_table DROP COLUMN IF EXISTS new_column;
```

### Migration Testing Checklist

Before distributing migrations:

- [ ] Test on fresh database
- [ ] Test on database with existing data
- [ ] Test running migration twice (idempotency)
- [ ] Test rollback procedure
- [ ] Document any breaking changes
- [ ] Include data transformation if needed

### Handling Breaking Changes

**If you MUST make breaking changes:**

**Option 1: Gradual Deprecation (Recommended)**
```sql
-- Keep old column, add new one
ALTER TABLE books ADD COLUMN status_new VARCHAR(50);

-- Migrate data
UPDATE books SET status_new =
    CASE status_old
        WHEN 1 THEN 'draft'
        WHEN 2 THEN 'published'
        ELSE 'unknown'
    END;

-- Don't drop old column yet - give students time
-- In NEXT version, drop old column after warning
```

**Option 2: Clear Migration Path**
```sql
-- Create backup table automatically
CREATE TABLE books_backup_v1 AS SELECT * FROM books;

-- Make breaking change
ALTER TABLE books DROP COLUMN old_field;
ALTER TABLE books ADD COLUMN new_field VARCHAR(100);

-- Provide data migration script
-- (Students run this to transform their data)
```

**Include in update notes:**
```markdown
## BREAKING CHANGES

### Status Field Change
The `status` field has changed from integer to text.

**Action Required:**
Your existing status codes will be automatically migrated.

**If you have custom queries:**
- Old: `WHERE status = 1`
- New: `WHERE status = 'draft'`

Mapping: 1=draft, 2=published, 3=archived
```

---

## Automated Update Scripts

### For Students: Simple Update Script

**`update.sh`** (include in update packages):
```bash
#!/bin/bash
set -e

echo "🚀 MCP Tutorial Update Script"
echo "=============================="
echo ""

# Check if backup exists
BACKUP_FILE="backup-$(date +%Y%m%d).sql"
if [ ! -f "$BACKUP_FILE" ]; then
    echo "⚠️  Creating backup first..."
    docker exec mcp-tutorial-db pg_dump -U postgres book_series_db > "$BACKUP_FILE"
    echo "✅ Backup created: $BACKUP_FILE"
else
    echo "✅ Backup found: $BACKUP_FILE"
fi

# Stop services
echo ""
echo "⏸️  Stopping services..."
docker-compose -f docker-compose.mcp.yml down

# Load new image
echo ""
echo "📦 Loading new image..."
if [ -f "mcp-tutorial-v*.tar" ]; then
    docker load -i mcp-tutorial-v*.tar
else
    echo "❌ Image file not found!"
    exit 1
fi

# Start database
echo ""
echo "🔄 Starting database..."
docker-compose -f docker-compose.mcp.yml up -d postgres
sleep 15

# Run migrations
echo ""
echo "🔧 Running migrations..."
if [ -d "migrations" ]; then
    for migration in migrations/*.sql; do
        echo "  Running: $(basename $migration)"
        docker exec -i mcp-tutorial-db psql -U postgres -d book_series_db < "$migration"
    done
else
    echo "  No migrations to run"
fi

# Start all services
echo ""
echo "▶️  Starting all services..."
docker-compose -f docker-compose.mcp.yml up -d

# Verify
echo ""
echo "✅ Update complete!"
echo ""
echo "Next steps:"
echo "1. Verify services: docker-compose -f docker-compose.mcp.yml ps"
echo "2. Check logs: docker-compose -f docker-compose.mcp.yml logs"
echo "3. Test in Claude Desktop"
echo ""
echo "If you have issues, see ROLLBACK_INSTRUCTIONS.md"
```

---

## Rollback Procedures

### For Students: How to Rollback

**If update causes issues:**

#### Option 1: Rollback to Previous Image

```bash
# Stop current services
docker-compose -f docker-compose.mcp.yml down

# Load previous image (keep the old tar file!)
docker load -i mcp-tutorial-v1.0.0.tar

# Start services
docker-compose -f docker-compose.mcp.yml up -d
```

**Note:** Database changes from migrations remain. Usually OK if migrations were additive.

#### Option 2: Restore Database Backup

```bash
# Stop services
docker-compose -f docker-compose.mcp.yml down

# Start database only
docker-compose -f docker-compose.mcp.yml up -d postgres
sleep 10

# Drop and recreate database
docker exec -i mcp-tutorial-db psql -U postgres -c "DROP DATABASE book_series_db;"
docker exec -i mcp-tutorial-db psql -U postgres -c "CREATE DATABASE book_series_db;"

# Restore from backup
cat backup-20241007.sql | docker exec -i mcp-tutorial-db psql -U postgres -d book_series_db

# Start all services
docker-compose -f docker-compose.mcp.yml up -d
```

#### Option 3: Nuclear Option (Start Fresh)

```bash
# Stop and remove everything INCLUDING volumes
docker-compose -f docker-compose.mcp.yml down -v

# Restore from backup
docker-compose -f docker-compose.mcp.yml up -d postgres
sleep 15
cat backup-20241007.sql | docker exec -i mcp-tutorial-db psql -U postgres -d book_series_db

# Start all services
docker-compose -f docker-compose.mcp.yml up -d
```

---

## Version Control Best Practices

### Semantic Versioning for MCP Updates

**Version Format: MAJOR.MINOR.PATCH**

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes, major features
  - Requires migration
  - May need student action
  - Example: Complete database schema redesign

- **MINOR** (1.0.0 → 1.1.0): New features, additive changes
  - May include migrations
  - Backward compatible
  - Example: New MCP server added

- **PATCH** (1.0.0 → 1.0.1): Bug fixes, performance improvements
  - No migrations
  - Just reload image
  - Example: Fixed character search bug

### Change Log Example

**CHANGELOG.md**
```markdown
# MCP Tutorial Changelog

## [1.1.0] - 2024-10-15

### Added
- New plot analysis MCP server
- Character relationship visualization
- Timeline conflict detection

### Changed
- Improved book search performance
- Updated database indexes

### Migration Required
- Yes: Run `migrations/003_add_plot_features.sql`

### Breaking Changes
- None

## [1.0.1] - 2024-10-10

### Fixed
- Character age calculation bug
- Timeline event sorting

### Migration Required
- No

### Breaking Changes
- None
```

---

## Testing Updates

### Instructor Testing Checklist

Before releasing an update:

```bash
# 1. Create test environment
docker-compose -f docker-compose.mcp.yml up -d

# 2. Add realistic test data
# (Use Claude to create sample authors, series, books, etc.)

# 3. Create backup
docker exec mcp-tutorial-db pg_dump -U postgres book_series_db > test-backup.sql

# 4. Stop and apply update
docker-compose down
docker load -i mcp-tutorial-v1.1.0.tar
docker-compose up -d postgres
# Run migrations
docker-compose up -d

# 5. Verify
# - All services running?
# - Test data still there?
# - New features work?
# - Old features still work?

# 6. Test rollback
docker-compose down
docker load -i mcp-tutorial-v1.0.0.tar
# Restore backup if needed
# Verify rollback works

# 7. Document any issues found
```

---

## Communication Template for Updates

**Email/Announcement Template:**

```
Subject: MCP Tutorial Update Available - Version 1.1.0

Hi Students!

A new update for the MCP Tutorial is now available with exciting new features.

📦 What's New:
- Plot analysis tools for story structure
- Enhanced character relationship tracking
- Performance improvements

⏱️ Time Required: ~10 minutes
📚 Difficulty: Easy (automated script provided)

⚠️ IMPORTANT:
Your data will be preserved, but please backup first (instructions included).

📥 Download: [Link to update package]

📖 Instructions:
1. Download the update package
2. Follow UPDATE_INSTRUCTIONS.md (included)
3. Or run the automated update.sh script

❓ Need Help?
- Detailed guide: UPDATE_INSTRUCTIONS.md
- Rollback guide: ROLLBACK_INSTRUCTIONS.md
- Contact me if you have issues

✅ Optional but Recommended:
Test the update this weekend. New features will be used in next week's assignments.

Happy writing!
[Your Name]
```

---

## Summary

### Key Points to Remember

**For Instructors:**
1. ✅ Use semantic versioning
2. ✅ Write idempotent migrations
3. ✅ Test updates thoroughly
4. ✅ Provide clear instructions
5. ✅ Include rollback procedures

**For Students:**
1. ✅ Always backup before updating
2. ✅ Use `docker-compose down` (not `down -v`)
3. ✅ Follow instructor's update instructions
4. ✅ Keep old image tar files for rollback
5. ✅ Verify data after update

**The Magic:**
Docker volumes persist independently of containers. This means:
- Update code ≠ lose data
- Migrations add features without destroying work
- Rollback is always possible with backups

---

## Quick Reference

### Student Update Commands
```bash
# Backup
docker exec mcp-tutorial-db pg_dump -U postgres book_series_db > backup.sql

# Update
docker-compose -f docker-compose.mcp.yml down
docker load -i mcp-tutorial-vX.X.X.tar
docker-compose -f docker-compose.mcp.yml up -d

# Verify
docker-compose -f docker-compose.mcp.yml ps
```

### Instructor Build Commands
```bash
# Build versioned image
docker build -t mcp-tutorial:vX.X.X -t mcp-tutorial:latest .

# Export
docker save mcp-tutorial:latest -o mcp-tutorial-vX.X.X.tar

# Create package
./scripts/build-for-distribution.sh -o distribution-vX.X.X
```

---

**Remember:** Docker makes updates safe by design. Trust the process, backup anyway! 🚀
