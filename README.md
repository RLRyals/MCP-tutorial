# MCP Tutorial: Building AI Writing Tools for Authors

This project demonstrates how to build Model Context Protocol (MCP) servers that connect Claude Desktop AI with a PostgreSQL database to help authors manage book series, characters, plots, timelines, and continuity across writing projects.

## 📖 Quick Start Guides

### For Students (Using Pre-Built Distribution)
**🐳 Docker MCP Toolkit** - [Complete Setup Guide](docs/DOCKER_MCP_SETUP.md)
1. Install Docker Desktop 4.42+
2. Run `.\student-install.ps1`
3. Connect Claude Desktop
4. Start writing!

### For Developers (Building From Source)
**[VS Code MCP Writing Tools Setup Guide](docs/vs_code_mcp_tutorial.html)** - Our comprehensive, interactive guide with step-by-step instructions, visual aids, code blocks, and troubleshooting tips.

> **Start Here**: We recommend following the interactive guide above for the best learning experience. The README below provides only a high-level overview and reference.

## What You'll Build

This tutorial teaches you how to create specialized AI writing tools that allow authors to:

- Organize book series and their metadata
- Track characters and their attributes 
- Manage plot structures and story arcs
- Build coherent story worlds and settings
- Monitor timelines and continuity
- Implement specialized writing tools

Each component is implemented as an MCP server that extends Claude Desktop's capabilities with database-backed tools.

## Installation Options

### 🚀 Option 1: Docker MCP Toolkit (Recommended for Students)
**Easiest installation - No Node.js required!**
- Just Docker Desktop 4.42+ and Claude Desktop
- One-click setup with pre-built images
- Works identically on Windows, Mac, and Linux
- [See Docker MCP Setup Guide](docs/DOCKER_MCP_SETUP.md)

### 💻 Option 2: Traditional Development Setup
**Best for learning how to build MCP servers**
- Prerequisites: Node.js, Docker Desktop, Git, VS Code
- Full source code access
- Step-by-step tutorial experience
- Continue with Quick Start below

## Platform-Specific Setup Guides
- [Complete Mac Setup Guide](docs/COMPLETE_MAC_SETUP_GUIDE.md) - Comprehensive instructions for Mac users

## Link to html tutorial guide

**📖 CLICK TO START:** <a href="https://htmlpreview.github.io/?https://github.com/RLRyals/MCP-tutorial/blob/main/docs/vs_code_mcp_tutorial.html" target="_blank">**VS Code MCP Writing Tools Setup Guide**</a>

👆 **Students: Click this link first!** This opens an interactive, step-by-step tutorial that guides you through the entire setup process. It has copy buttons for all commands and works in any browser - no cloning required!

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/RLRyals/MCP-tutorial.git
   cd MCP-tutorial
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the database** (using PowerShell):
   ```powershell
   .\scripts\start-database.ps1
   ```
   This script will:
   - Check if Docker Desktop is running
   - Start Docker Desktop if needed (with your permission)
   - Create `.env` from template if needed
   - Start database services and verify they're healthy
   
   **Option B: Quick launcher**
   ```powershell
   .\quick-start.ps1
   ```
   
   **Option C: Manual (if Docker Desktop is already running)**
   ```bash
   docker-compose up -d
   ```

   **Note**: The startup scripts will handle Docker Desktop management automatically. If you prefer to start Docker Desktop manually, you can use Option C after ensuring Docker Desktop is running.

5. Run database migrations:
   ```bash
   node src/shared/run-migration.js 001_create_core_schema.sql
   ```
6. Switch to the Series Management MCP branch:
   ```bash
   git checkout MCP_1_Series_Management
   ```
   This branch implements the first Model Context Protocol for managing book series data.
   Follow the updated instructions in this branch to set up the Series Management functionality.

7. some step I need to jam in here 

8. Run database migrations:
   ```bash
   node src/shared/run-migration.js 002_update_series_schema.sql
   ```

7. **Configure and Test the MCP Servers:**

   **For Claude Desktop Users:**
   
   a. Configure Claude Desktop to use your MCP servers:
   ```bash
   # Generate configuration files
   .\scripts\generate-configs.ps1 -Claude
   ```
   
   b. The script will create a `claude-desktop.json` configuration pointing to your MCP servers.
   Copy the generated configuration to your Claude Desktop config location:
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

   c. Restart Claude Desktop to load the new MCP servers.

   d. Test the Series MCP by asking Claude:
   ```
   "Can you list all the series in my database?"
   "Create a new series called 'The Starfire Chronicles' by author ID 1"
   "Show me details for series ID 1"
   ```

   ### Step 6: continue with the next brances in order
   #### 6.1 switch to next branch
   #### 6.2 run next migration script
   #### 6.3 run generate Claude config
   #### 6.4 Load new Claude Desktop config, Exit Cluade and restart
   #### 6.5 test new MCPs in Claude Desktop


   **For Typing Mind and Web-based Tools:**
   
   a. Start the HTTP server for the Series MCP:
   ```bash
   # Start the series MCP in HTTP mode
   node src/mcps/series-server/index.js --http --port 3500
   ```
   
   b. The MCP server will be available at `http://localhost:3500`
   
   c. Test the HTTP endpoints:
   ```bash
   # Health check
   curl http://localhost:3500/health
   
   # Server info
   curl http://localhost:3500/info
   ```

   d. In Typing Mind, configure the MCP connection to point to `http://localhost:3500`

   
   - **Create Sample Data:** Add some test data to work with
   ```bash
   # You can create sample authors and series using the database directly, or
   # Use Claude Desktop/Typing Mind to test the create_series functionality
   # Example: "Create a new author named 'Marina Blackwood'" (if you have author MCP)
   # Then: "Create a series called 'The Crystal Realm Saga' by that author"
   ```

   **Troubleshooting:**
   - Ensure Docker Desktop is running and the database is healthy
   - Check that your `.env` file has the correct `DATABASE_URL` 
   - Verify Node.js dependencies are installed with `npm install`
   - For Claude Desktop: Ensure the config file path is correct and restart Claude
   - For HTTP mode: Check that the port isn't already in use
   - If you get "Author not found" errors, create some authors first using direct database inserts or author MCP tools

6. Switch to the Series Management MCP branch:
   ```bash
   git checkout MCP_1_Series_Management
   ```
   This branch implements the first Model Context Protocol for managing book series data.
   Follow the updated instructions in this branch to set up the Series Management functionality.

## Project Structure
```
mcp-tutorial/
├── docs/               # Documentation and guides
├── migrations/         # Database migration files
├── scripts/            # Utility scripts
│   ├── start-database.ps1   # Full-featured database startup script
│   └── start-database.bat   # Batch file alternative
├── src/                # Source code
│   └── shared/         # Shared utilities
├── docker-compose.yml  # Docker services configuration
├── Dockerfile          # Application container definition
├── quick-start.ps1     # Quick database launcher
└── template.env        # Environment variable template
```

## Database Setup Scripts

This project includes several scripts to make database setup easier:

### `scripts/start-database.ps1` (Recommended)
A comprehensive PowerShell script that handles all aspects of database setup:
- Automatically detects if Docker Desktop is running
- Can start Docker Desktop if needed (with user permission)  
- Creates `.env` file from template if it doesn't exist
- Starts database services with health checks
- Provides colored output and detailed status information

**Usage:**
```powershell
# Basic startup
.\scripts\start-database.ps1

# Force restart services
.\scripts\start-database.ps1 -Force

# Show help
.\scripts\start-database.ps1 -Help
```

### `quick-start.ps1` 
A simple launcher for quick database startup when Docker Desktop is already running:
```powershell
.\quick-start.ps1
```

### `scripts/start-database.bat`
A batch file alternative for users who prefer .bat files over PowerShell scripts.

## MCP Server Setup

This tutorial demonstrates dual-transport MCP servers that work with both Claude Projects and web-based tools.

### Quick Start Commands

**For Claude Desktop (Recommended):**
- **Database:** `.\scripts\start-database.ps1` 
- **MCP Configuration:** Generate and install config with `.\scripts\generate-configs.ps1`
- **⚠️ Do NOT manually start MCP servers** - Claude Desktop manages them automatically via stdio transport

**For Web Tools (Typing Mind, etc.):**
```bash
.\scripts\start-database.ps1                         # Start database first
node src/mcps/series-server/index.js --http --port 3500  # Start series MCP in HTTP mode
# Test with: curl http://localhost:3500/health
```

**Testing Your MCPs:**
```bash
# Quick database health check
node -e "import('./src/shared/database.js').then(({DatabaseManager}) => { const db = new DatabaseManager(); db.healthCheck().then(console.log).finally(() => db.close()); });"

# Test MCP server stdio mode (simulates Claude Desktop)
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node src/mcps/series-server/index.js
```

### Available MCP Servers

- **Author Management** - Create and manage authors
- **Series Management** - Organize book series 
- **Book Management** - Track individual books
- **Timeline Management** - Series timeline tracking
- **Metadata Management** - Flexible metadata storage

## For Instructors: Building Student Distribution

If you're an instructor wanting to distribute this to students:

### Build Distribution Package
```powershell
# Switch to Docker MCP branch
git checkout MCP_8_Docker

# Build and package everything
.\scripts\build-for-distribution.ps1
```

This creates a `distribution` folder containing:
- Docker image (tar file, ~250MB)
- Student installation script
- Complete setup documentation
- docker-compose configuration

### Distribute to Students
1. Upload `distribution` folder to your LMS/Google Drive
2. Share with students
3. Students run `student-install.ps1`
4. Done! ✅

**Benefits:**
- No Node.js installation needed
- No PATH configuration issues
- Works identically on all platforms
- Easy updates (just share new tar file)
- Reduced support burden

### Updating Student Installations
When you release new features or fixes:
1. Build new distribution package (new version)
2. Share update package with students
3. Students run update script - **their data is preserved automatically!**

See [Updating Docker Distribution Guide](docs/UPDATING_DOCKER_DISTRIBUTION.md) for:
- How to create updates that preserve student data
- Database migration strategies
- Versioning best practices
- Rollback procedures

**Quick Reference:**
- [Docker MCP Setup Guide](docs/DOCKER_MCP_SETUP.md) - Initial installation
- [Updating Guide](docs/UPDATING_DOCKER_DISTRIBUTION.md) - Updates without data loss

---

## Tutorial Steps

The tutorial is organized into branches, each representing a different stage of development:

1. `main` - Basic setup and project structure
2. `MCP_1_Series_Management` - Core series management MCPs
3. `Step_2_MCP_character` - Character management system
4. `Step_3_MCP_plot` - Plot and story structure
5. `Step_4_MCP_research` - Research and continuity tracking
6. `Step_5_MCP_writing` - Writing production management
7. `Step_6_MCP_persona_voice` - AI personas and voice integration
8. `MCP_8_Docker` - Docker MCP Toolkit distribution

Each branch builds upon the previous one, gradually introducing new concepts and functionality.

## Documentation

For detailed information about the project, please refer to the following documentation:

- [Core Series Schema](docs/core-series-schema.md)
- [Project Structure Guide](docs/mcp-tutorial-structure.md)
- [Dual Transport Setup](docs/dual-transport-setup.md)
- [MCP Series Management](docs/MCP_1_Series_management.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
