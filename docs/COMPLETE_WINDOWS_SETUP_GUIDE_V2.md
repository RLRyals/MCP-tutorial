# Complete Windows Setup Guide for MCP Tutorial

This comprehensive guide will help Windows users set up their environment to run the MCP Tutorial successfully with both Claude Desktop and Typing Mind.

## Prerequisites

Before starting, install these required tools:

[Detailed installation instructions: https://htmlpreview.github.io/?https://github.com/RLRyals/MCP-tutorial/blob/main/docs/mcp-installation-guide.html]

Required installations:
1. **Claude Desktop** - AI assistant application (download from claude.ai)
2. **Visual Studio Code** - Code editor (download from code.visualstudio.com)
3. **GitHub Account** - Version control (create at github.com)
4. **Docker Desktop** - Container platform (download from docker.com)
5. **Docker Account** - Required for Docker Desktop
6. **Node.js** - JavaScript runtime (download from nodejs.org - LTS version recommended)
7. **Git** - Version control (download from git-scm.com)

---

## Step 1: Clone Repository and Install Dependencies

Open VS Code's terminal (Terminal → New Terminal) and run these commands **one at a time**, pressing Enter after each:

```powershell
# Create GitHub directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\Documents\GitHub"
cd "$env:USERPROFILE\Documents\GitHub"

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
```powershell
Copy-Item template.env .env
```

**2.2** Open the .env file in VS Code:
```powershell
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
   - Press **Ctrl + S** in VS Code

**2.5** Verify your .env file was saved correctly:
```powershell
Get-Content .env
```

---

## Step 3: Start Database and Run Initial Migration

**3.1** Start the PostgreSQL database:
```powershell
docker compose up -d
```

**3.2** Verify the database is running:
```powershell
docker ps
```

Look for a container named `mcp-series-db` with status "Up".

**3.3** Run the initial core schema migration:
```powershell
node src/shared/run-migration.js 001_create_core_schema.sql
```

**3.4** Verify the database connection works:
```powershell
node tests/test-db.js
```

---

## Step 4: Complete MCP_1 Branch Migration

**4.1** Ensure you're on the MCP_1 branch and run the second migration:
```powershell
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
```powershell
git checkout MCP_6_fixes_genre_expansion
```

**5.2** Run migrations 003-009:
```powershell
node src/shared/run-migration.js 003_add_character_schema.sql
node src/shared/run-migration.js 004_plot_structure_and_universal_framework.sql
node src/shared/run-migration.js 005_update_author_email_constraint.sql
node src/shared/run-migration.js 006_add_book_metadata_plot_thread_and_tropes_tables.sql
node src/shared/run-migration.js 007_add_event_chapter_mapping.sql
node src/shared/run-migration.js 008_add_world_schema.sql
node src/shared/run-migration.js 009_writing_migration.sql
```

**5.3** Run the final MCP_6 migrations:
```powershell
node src/shared/run-migration.js 010_update_table_schema.sql
node src/shared/run-migration.js 011_Universal_Schema_Migrations.sql
```

---

## Step 6: Configure Claude Desktop

⚠️ **IMPORTANT:** Only proceed after completing Step 5 (MCP_6 migrations)!

### Option A: Direct File Copy (Recommended)

**6.1** Create Claude Desktop config directory and generate configuration:
```powershell
# Create directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude"

# Generate the configuration
node scripts/generate-configs.js --claude
```

**6.2** Copy the configuration file:
```powershell
Copy-Item config/claude-desktop.json "$env:APPDATA\Claude\claude_desktop_config.json"
```

**6.3** Restart Claude Desktop to load the new configuration.

### Option B: Manual Configuration (if Option A fails)

**6.1** Generate the configuration:
```powershell
node scripts/generate-configs.js
```

**6.2** Open both files:
```powershell
# Open the generated config
code config/claude-desktop.json

# Open Claude Desktop's config location in File Explorer
explorer "$env:APPDATA\Claude"
```

**6.3** Manually open `claude_desktop_config.json` in the Claude folder (create it if it doesn't exist), then copy the contents from `config/claude-desktop.json` into it.

**6.4** Save and restart Claude Desktop.

---

## Step 7: Verify Configuration

```powershell
# Check if config file exists
Test-Path "$env:APPDATA\Claude\claude_desktop_config.json"

# View the config contents
Get-Content "$env:APPDATA\Claude\claude_desktop_config.json"
```

---

## TROUBLESHOOTING

### Database Authentication Errors

If you encounter authentication errors when running migrations, follow these steps:

**T.1** Ensure Docker Desktop is running and start the database:
```powershell
cd "$env:USERPROFILE\Documents\GitHub\MCP-tutorial"
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
```powershell
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

---

## Windows-Specific Notes

### PowerShell vs Command Prompt
- This guide uses PowerShell commands (recommended)
- If using Command Prompt (cmd), adjust commands accordingly:
  - Use `%USERPROFILE%` instead of `$env:USERPROFILE`
  - Use `%APPDATA%` instead of `$env:APPDATA`
  - Use `copy` instead of `Copy-Item`
  - Use `type` instead of `Get-Content`

### Path Differences
- Windows config location: `%APPDATA%\Claude\claude_desktop_config.json`
- Mac config location: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Docker Desktop Requirements
- Ensure WSL 2 (Windows Subsystem for Linux) is installed and enabled
- Docker Desktop must be running before executing `docker compose` commands
- Check Docker Desktop settings → Resources to ensure adequate memory allocation (4GB+ recommended)
