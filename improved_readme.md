# MCP Tutorial: Building Writing Tools for Authors

This tutorial demonstrates how to build a Model Context Protocol (MCP) server system for managing book series databases. You'll create specialized AI writing tools that work with Claude Desktop to help track characters, plots, timelines, and continuity across your writing projects.

## Prerequisites

**Required Software (Install First):**
- Node.js (v22+ recommended) - [Download here](https://nodejs.org)
- Docker Desktop - [Download here](https://docs.docker.com/desktop)
- Git - [Download here](https://git-scm.com) (Windows only, Mac includes Git)
- Code editor - VS Code recommended [Download here](https://code.visualstudio.com)
- Claude Desktop - [Download here](https://claude.ai/download) (**Not** Claude web version)

**Important:** You need Claude Desktop (the downloaded app), not Claude Projects in your web browser. Only Claude Desktop can use local MCPs.

## Quick Start Guide

### Step 1: Download the Tutorial Code

1. **Clone this repository:**
   ```bash
   git clone https://github.com/RLRyals/MCP-tutorial.git
   cd MCP-tutorial
   ```

2. **Install the required packages:**
   ```bash
   npm install
   ```

### Step 2: Set Up Your Database

1. **Create your environment file:**
   ```bash
   cp template.env .env
   ```
   
2. **Start the database:**
   
   **Option A: Automatic Setup (Recommended)**
   ```powershell
   .\scripts\start-database.ps1
   ```
   This script will:
   - Check if Docker Desktop is running
   - Start Docker Desktop if needed
   - Create your database
   - Verify everything is working
   
   **Option B: Manual Setup (if you prefer)**
   - Make sure Docker Desktop is running first
   - Then run: `docker-compose up -d`

3. **Set up the database structure:**
   ```bash
   node src/shared/run-migration.js 001_create_core_schema.sql
   ```

### Step 3: Install Your First Writing Tool (Series Manager)

1. **Switch to the Series Management branch:**
   ```bash
   git checkout MCP_1_Series_Management
   ```

2. **Update the database for series management:**
   ```bash
   node src/shared/run-migration.js 002_update_series_schema.sql
   ```

### Step 4: Connect Your Tools to Claude Desktop

1. **Generate the configuration file:**
   ```bash
   .\scripts\generate-configs.ps1 -Claude
   ```

2. **Install the configuration:**
   The script creates a `claude-desktop.json` file. Copy this to:
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

3. **Restart Claude Desktop** to load your new writing tools

### Step 5: Test Your Writing Tools

Open Claude Desktop and try these commands:

```
"Can you list all the series in my database?"
"Create a new series called 'The Starfire Chronicles' by author ID 1"
"Show me details for series ID 1"
```

If you get an "Author not found" error, you'll need to create an author first. You can do this directly in the database or wait for the Author Management tutorial step.

### Step 6: continue with the next brances in order
#### 6.1 switch to next branch
#### 6.2 run migration script
#### 6.3 run generate Claude config
#### 6.4 Load new Cluade Desktop config, Exit Cluade and restart
#### 6.5 test new MCPs in Claude Desktop


## Alternative Setup: For Web-Based Tools (Typing Mind, etc.)

If you're using Typing Mind or other web-based AI tools instead of Claude Desktop:

1. **Complete Steps 1-3 above** (database setup)

2. **Start the MCP server manually:**
   ```bash
   node src/mcps/series-server/index.js --http --port 3500
   ```

3. **Test the connection:**
   ```bash
   curl http://localhost:3500/health
   ```

4. **Configure your web tool** to connect to `http://localhost:3500`

## Project Structure
```
mcp-tutorial/
├── docs/               # Tutorial documentation
├── migrations/         # Database setup files
├── scripts/            # Helper scripts
│   ├── start-database.ps1   # Automatic database setup
│   └── generate-configs.ps1 # Claude Desktop configuration
├── src/               # MCP server code
│   └── shared/        # Database utilities
├── docker-compose.yml # Database configuration
└── template.env      # Environment settings template
```

## Tutorial Progression

This tutorial is organized into branches that build upon each other:

1. **`main`** - Basic setup (you are here)
2. **`MCP_1_Series_Management`** - Track book series ✅
3. **`Step_2_MCP_character`** - Character management 
4. **`Step_3_MCP_plot`** - Plot tracking
5. **`Step_4_MCP_research`** - Research notes
6. **`Step_5_MCP_writing`** - Writing progress
7. **`Step_6_MCP_persona_voice`** - AI writing team personas

Each branch adds new writing tools. Start with Series Management and work your way through.

## Troubleshooting Common Issues

### "Docker Desktop is not running"
- Open Docker Desktop application
- Wait for it to fully start (whale icon in system tray)
- Try the setup commands again

### "Claude Desktop can't find MCPs"
- Verify you copied the config file to the correct location
- Make sure you restarted Claude Desktop
- Check that the file is named `claude_desktop_config.json` (not `.txt`)

### "Author not found" errors
- You need to create authors before creating series
- Either wait for the Author Management tutorial step
- Or create authors directly in your database

### "Command not found" errors
- Make sure Node.js is installed: `node --version`
- Make sure Git is installed: `git --version`
- Restart your terminal after installing software

### Database connection errors
- Verify Docker Desktop is running
- Check that the database started: `docker-compose ps`
- Make sure your `.env` file exists and has the correct settings

## Getting Help

1. **Check the troubleshooting section above**
2. **Look at the detailed docs in the `/docs` folder**
3. **Make sure all prerequisite software is installed correctly**
4. **Try restarting your computer** (fixes many Docker issues)

## What You're Building

By the end of this tutorial, you'll have:
- **Series Management** - Track multiple book series
- **Character Tracking** - Maintain character consistency
- **Plot Management** - Follow story threads across books
- **Timeline Validation** - Prevent chronological errors
- **Research System** - Store and cross-reference notes
- **Writing Progress** - Track your daily progress
- **AI Writing Team** - Specialized personas to help with different aspects

These tools work together to prevent plot holes, maintain continuity, and speed up your writing process.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.