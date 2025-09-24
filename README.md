# MCP Tutorial: Building AI Writing Tools for Authors

This project demonstrates how to build Model Context Protocol (MCP) servers that connect Claude Desktop AI with a PostgreSQL database to help authors manage book series, characters, plots, timelines, and continuity across writing projects.

## 📖 Interactive Tutorial Guide

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

## Prerequisites

- **Node.js** (v18+ recommended) - [Download](https://nodejs.org)
- **Docker Desktop** - [Download](https://docs.docker.com/desktop)
- **Git** - [Download](https://git-scm.com)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com)
- **Claude Desktop** - [Download](https://claude.ai/download)

⚠️ **Important**: You need the Claude Desktop application, not the web version. Only Claude Desktop supports local MCP servers.

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

4. **Follow the interactive guide** for detailed instructions on:
   - Setting up your development environment
   - Running database migrations
   - Configuring and testing MCP servers
   - Working through each tutorial branch

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
3. `MCP_2_Character_Management` - Character management system
4. `MCP_3_Plot_Management` - Plot and story structure
5. `MCP_4_Worldbuilding_Management` - World-building and setting management
6. `MCP_5_Writing_Process_Analysis` - Writing production management
7. `MCP_6_fixes_genre_expansion` - Bug fixes and universal genre features

Each branch builds upon the previous one, gradually introducing new concepts and functionality.

## Documentation

For detailed information about the project, please refer to the following documentation:

- [Core Series Schema](docs/core-series-schema.md)
- [MCP Series Management](docs/MCP_1_Series_management.md)
- [Plot Server Guide](docs/corrected_plot_server_guide.md)
- [World Server Guide](docs/corrected_world_server_guide.md)
- [Writing Server Guide](docs/corrected_writing_server_guide.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
