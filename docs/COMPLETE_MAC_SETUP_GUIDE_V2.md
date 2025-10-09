# Complete Mac Setup Guide for MCP Tutorial

This comprehensive guide will help Mac users set up their environment to run the MCP Tutorial successfully with both Claude Desktop and Typing Mind.

## Prerequisites

Before starting, install these required tools using Homebrew:

[Detailed installation instructions: https://htmlpreview.github.io/?https://github.com/RLRyals/MCP-tutorial/blob/main/docs/mcp-installation-guide.html]

Required installations:
1. **Claude Desktop** - AI assistant application
2. **Visual Studio Code** - Code editor
3. **GitHub Account** - Version control (create at github.com)
4. **Docker Desktop** - Container platform
5. **Docker Account** - Required for Docker Desktop
6. **Node.js** - JavaScript runtime
7. **Git** - Version control (may already be installed on Mac)

---

## Step 1: Clone Repository and Install Dependencies

Open VS Code's terminal and run these commands **one at a time**, pressing Enter after each:

```zsh
# Create GitHub directory if it doesn't exist
mkdir -p ~/Documents/GitHub
cd ~/Documents/GitHub

# Clone the repository
git clone https://github.com/RLRyals/MCP-tutorial.git
cd MCP-tutorial

# Checkout the first tutorial branch
git checkout MCP_1_Series_Management

# Install dependencies
npm install
```

---

## Step 2: Configure Environment File (CRITICAL)

**2.1** Copy the template environment file:
```zsh
cp template.env .env
```

**2.2** Open the .env file in VS Code:
```zsh
code .env
```

**2.3** Verify these settings exist in your .env file and **customize your username and password**:

⚠️ **IMPORTANT RULES:**
- Replace `writer` with your chosen username (letters, numbers, underscores only)
- Replace `your_secure_password` with your chosen password (letters, numbers, underscores only)
- **NO SPACES** after the `=` sign
- Use the **SAME** username and password in both `POSTGRES_USER`/`POSTGRES_PASSWORD` and in the `DATABASE_URL`

```env
# Database Configuration
POSTGRES_CONTAINER_NAME=mcp-series-db
POSTGRES_DB=mcp_series
POSTGRES_USER=writer
POSTGRES_PASSWORD=your_secure_password

# Connection URL (must match settings above)
DATABASE_URL=postgresql://writer:your_secure_password@localhost:5432/mcp_series

NODE_ENV=development
```

Example with custom credentials:
```env
POSTGRES_USER=john_doe
POSTGRES_PASSWORD=MySecurePass123
DATABASE_URL=postgresql://john_doe:MySecurePass123@localhost:5432/mcp_series
```

**2.4** Save the file:
   - Press **Cmd + S** in VS Code

**2.5** Verify your .env file was saved correctly:
```zsh
cat .env
```

---

## Step 3: Start Database and Run Initial Migration

**3.1** Start the PostgreSQL database:
```zsh
docker compose up -d
```

**3.2** Verify the database is running:
```zsh
docker ps | grep postgres
```

**3.3** Run the initial core schema migration:
```zsh
node src/shared/run-migration.js 001_create_core_schema.sql
```

**3.4** Verify the database connection works:
```zsh
node tests/test-db.js
```

---

## Step 4: Complete MCP_1 Branch Migration

**4.1** Ensure you're on the MCP_1 branch and run the second migration:
```zsh
git checkout MCP_1_Series_Management
npm install
node src/shared/run-migration.js 002_update_series_schema.sql
```

### ✓ CHECKPOINT
- Did you get any errors?
- Did the migration run successfully?
- **If YES:** Continue to Step 5
- **If NO:** Scroll up to find the error message. If you see an authentication error, skip to [Troubleshooting](#troubleshooting) section below.

---

## Step 5: Complete MCP_6 Branch Migrations (MANDATORY)

**5.1** Switch to the MCP_6 branch:
```zsh
git checkout MCP_6_fixes_genre_expansion
```

**5.2** Run migrations 003-009:
```zsh
node src/shared/run-migration.js 003_add_character_schema.sql
node src/shared/run-migration.js 004_plot_structure_and_universal_framework.sql
node src/shared/run-migration.js 005_update_author_email_constraint.sql
node src/shared/run-migration.js 006_add_book_metadata_plot_thread_and_tropes_tables.sql
node src/shared/run-migration.js 007_add_event_chapter_mapping.sql
node src/shared/run-migration.js 008_add_world_schema.sql
node src/shared/run-migration.js 009_writing_migration.sql
```

**5.3** Run the MCP_6 migrations:
```zsh
node src/shared/run-migration.js 010_update_table_schema.sql
node src/shared/run-migration.js 011_Universal_Schema_Migrations.sql
```

---

## Step 6: Complete the MCP_7 Branch
**6.1** Switch to the MCP_7 branch:
```zsh
git checkout MCP_7_BadEvan_Requests
```

**6.2** run the MCP_7_BadEvan_Requests migrations
```zsh
node src/shared/run-migration.js 013_alter_scene_tracking_schema.sql
node src/shared/run-migration.js 014_Scene_Schema_updates.sql
node src/shared/run-migration.js 015_normalize_genre_relationships.sql
node src/shared/run-migration.js 016_fix_world_elements_schema.sql
node src/shared/run-migration.js 017_add_missing_feature_columns.sql
```

## Step 7: Configure Claude Desktop

⚠️ **IMPORTANT:** Only proceed after completing Steps above!

### Option A: Direct File Copy (Recommended)

**6.1** Create Claude Desktop config directory and generate configuration:
```zsh
# Create directory if it doesn't exist
mkdir -p ~/Library/Application\ Support/Claude

# Generate the configuration
node scripts/generate-configs.js --claude
```

**6.2** Copy the configuration file:
```zsh
cp config/claude-desktop.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**6.3** Restart Claude Desktop to load the new configuration.

### Option B: Manual Configuration (if Option A fails)

**6.1** Generate the configuration:
```zsh
node scripts/generate-configs.js
```

**6.2** Open both files:
```zsh
# Open the generated config
open config/claude-desktop.json

# Open Claude Desktop's config
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**6.3** Copy the contents from `config/claude-desktop.json` into `claude_desktop_config.json`

**6.4** Save and restart Claude Desktop.

---

## Step 7: Verify Configuration

```zsh
# Check if config file exists
ls -l ~/Library/Application\ Support/Claude/claude_desktop_config.json

# View the config contents
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

---

## TROUBLESHOOTING

### Database Authentication Errors

If you encounter authentication errors when running migrations, follow these steps:

**T.1** Ensure Docker is running and start the database:
```zsh
cd ~/Documents/GitHub/MCP-tutorial
docker compose up -d
```

**T.2** Verify your .env file has these settings:
```env
POSTGRES_CONTAINER_NAME=mcp-series-db
POSTGRES_DB=mcp_series
POSTGRES_USER=writer
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://writer:your_secure_password@localhost:5432/mcp_series
```

**T.3** Connect to the PostgreSQL database:
```zsh
docker exec -it mcp-series-db psql -U writer -d mcp_series
```

You should see the prompt: `mcp_series=#`

**T.4** Reset the password:
```sql
ALTER USER "writer" WITH PASSWORD 'your_secure_password';
\q
```

**T.5** If you get an error that user "writer" doesn't exist, create it:
```sql
CREATE USER writer WITH SUPERUSER PASSWORD 'your_secure_password';
\q
```

After fixing the password, return to the step where you encountered the error and continue from there.
