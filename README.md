# MCP-tutorial
This is a tutorial project that demonstrates how to build a Model Context Protocol (MCP) server system for managing a book series database. The tutorial is structured in steps, each building upon the previous to create a complete system.

## Prerequisites
- Node.js (Latest LTS version recommended)
- Docker Desktop
- Git
- A code editor (VS Code recommended)

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/RLRyals/MCP-tutorial.git
   cd MCP-tutorial
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp template.env .env
   ```
   Then edit `.env` with your preferred settings.

4. Start the database using Docker:

   **Option A: Using the startup script (Recommended)**
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

## Project Structure
```
mcp-tutorial/
├── docs/               # Documentation and guides
├── migrations/         # Database migration files
├── scripts/            # Utility scripts
│   ├── start-database.ps1   # Full-featured database startup script
│   └── start-database.bat   # Batch file alternative
├── src/               # Source code
│   └── shared/        # Shared utilities
├── docker-compose.yml # Docker services configuration
├── Dockerfile        # Application container definition
├── quick-start.ps1    # Quick database launcher
└── template.env      # Environment variable template
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

## Tutorial Steps

The tutorial is organized into branches, each representing a different stage of development:

1. `main` - Basic setup and project structure
2. `MCP_1_Series_Management` - Core series management MCPs
3. `Step_2_MCP_character` - Character management system
4. `Step_3_MCP_plot` - Plot and story structure
5. `Step_4_MCP_research` - Research and continuity tracking
6. `Step_5_MCP_writing` - Writing production management
7. `Step_6_MCP_persona_voice` - AI personas and voice integration

Each branch builds upon the previous one, gradually introducing new concepts and functionality.

## Documentation

For detailed information about the project, please refer to the following documentation:

- [Core Series Schema](docs/core-series-schema.md)
- [Project Structure Guide](docs/mcp-tutorial-structure.md)
- [Dual Transport Setup](docs/dual-transport-setup.md)
- [MCP Series Management](docs/MCP_1_Series_management.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
