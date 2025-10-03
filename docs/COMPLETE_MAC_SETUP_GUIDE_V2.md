# Complete Mac Setup Guide for MCP Tutorial

This comprehensive guide will help Mac users set up their environment to run the MCP Tutorial successfully with both Claude Desktop and Typing Mind.

## 1. Install Prerequisites

[Working on these. Please see https://htmlpreview.github.io/?https://github.com/RLRyals/MCP-tutorial/blob/main/docs/mcp-installation-guide.html ]

Everyone has been using HomeBrew to install some of these
1. Claude Desktop
2. Visual Studio Code
3. GitHub Account
4. Docker Desktop
5. Docker account
6. Node.js
7. Git (Some Macs already have this)

## 2. Repository Setup and Database Configuration

### 2.1 Clone and Initialize the Repository
These commands go in your terminal in VS code one line at a a time and then enter before pasting the next one.

```zhs
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

### 2.2 Environment Configuration (CRITICAL STEP)

1. First, copy the template environment file:
```zhs
cp template.env .env
```

2. Open the .env file in a text editor:
```zhs
# Using VS Code (recommended)
code .env

```

3. Review and update these critical settings:
```env
DATABASE_URL=postgresql://writer:your_secure_password@localhost:5432/mcp_series
#use this string to connect to your db
#postgresql://writer:@localhost:5432/mcp_series
NODE_ENV=development
```
## Add this new line to the .env file
```env
POSTGRES_CONTAINER_NAME=mcp-series-db
```

4. IMPORTANT: Save your changes!
   - For VS Code: Press Cmd + S

5. Verify your .env file was saved correctly:
```zhs
cat .env
```

### 2.3 Run Initial Database Migrations

1. Start the PostgreSQL database:
```zhs
docker compose up -d
```

2. Verify the database is running:
```zhs
docker ps | grep postgres
```

3. Run the initial migrations:
```zhs
node src/shared/run-migration.js 001_create_core_schema.sql
```

4. Verify the database connection:
```zhs
node tests/test-db.js
```

## 3. Tutorial Branch Progression

Complete each MCP tutorial branch in order:

1. MCP_1_Series_Management (current)
```zhs
git checkout [branch_name]
npm install
node src/shared/run-migration.js 002_update_series_schema.sql
```
## Optional 
for branches MCP_2 through MCP_5

## Mandatory
6. MCP_6_fixes_genre_expansion (latest completed)

```zhs
git checkout [branch_name]
node src/shared/run-migration.js [additional_migrations].sql 
node src/shared/run-migration.js 003_add_character_schema.sql
node src/shared/run-migration.js 004_plot_structure_and_universal_framework.sql
node src/shared/run-migration.js 005_update_author_email_constraint.sql
node src/shared/run-migration.js 006_add_book_metadata_plot_thread_and_tropes_tables.sql
node src/shared/run-migration.js 007_add_event_chapter_mapping.sql
node src/shared/run-migration.js 008_add_world_schema.sql
node src/shared/run-migration.js 009_add_writing_process_tables.sql
```

```zhs
git checkout MCP_6_fixes_genre_expansion
node src/shared/run-migration.js 010_update_table_schema.sql
node src/shared/run-migration.js 011_Universal_Schema_Migrations.sql
```

## 4. Claude Desktop Configuration (After completing MCP_6)

IMPORTANT: Only proceed with this step after completing through MCP_6_fixes_genre_expansion!

### Option A: Direct File Copy (Recommended)

1. First, find your Claude Desktop configuration directory:
```zhs
# Create directory if it doesn't exist
mkdir -p ~/Library/Application\ Support/Claude

# Generate the configuration
node scripts/generate-configs.js --claude
```

2. Copy the configuration file directly (RECOMMENDED METHOD):
```zhs
cp config/claude-desktop.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

3. Restart Claude Desktop to load the new configuration.

### Option B: Manual Configuration (Alternative)

If the direct copy doesn't work:

1. Generate the configuration:
```zhs
node scripts/generate-configs.js
```

2. Open both files:
```zhs
# Open the generated config
open config/claude-desktop.json

# Open Claude Desktop's config
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

3. Copy the contents from the generated file to Claude Desktop's config file.

4. Save and restart Claude Desktop.

## 5. Verify Configuration

```zhs
# Check if config file exists in Claude Desktop directory
ls -l ~/Library/Application\ Support/Claude/claude_desktop_config.json

# View the config contents
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
```


## TROUBLESHOOTING
To reset your password and make sure it is what it is supposed to be:
Make certain your terminal is in the MCP-tutorial dirctory and run these commands in the terminal.

docker compose up -d

#assuming these are your values in the .env  (not the template.env file):
# Database Configuration
POSTGRES_CONTAINER_NAME=mcp-series-db
POSTGRES_DB=mcp_series
POSTGRES_USER=writer
POSTGRES_PASSWORD=your_secure_password

#Connection URL for the application (must match the database settings above)
DATABASE_URL=postgresql://writer:your_secure_password@localhost:5432/mcp_series
#use this string to connect to your db
#postgresql://writer:@localhost:5432/mcp_series

### in the terminal in VS Code
docker exec -it mcp-series-db psql -U writer -d mcp_series

### when that works. you should see something like 
### mcp_series=#

### then reset that password 
ALTER USER "writer" WITH PASSWORD 'your_secure_password';

### then exit with..
\q

### If you see an error message that User Writer doesn't exist then create it with

CREATE USER writer WITH SUPERUSER PASSWORD 'your_secure_password__goes_here_in_these_single_quotes';
\q