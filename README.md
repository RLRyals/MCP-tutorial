# MCP-tutorial
This is a tutorial project that demonstrates how to build a Model Context Protocol (MCP) server system for managing a book series database. The tutorial is structured in steps, each building upon the previous to create a complete system.

## Prerequisites
- Node.js (Latest LTS version recommended)
- Docker Desktop
- Git
- A code editor (VS Code recommended)

## 🚀 START HERE: Interactive Tutorial Guide

**📖 CLICK TO START:** **[VS Code MCP Writing Tools Setup Guide](https://htmlpreview.github.io/?https://github.com/RLRyals/MCP-tutorial/blob/main/docs/vs_code_mcp_tutorial.html)** 

👆 **Students: Click this link first!** This opens an interactive, step-by-step tutorial that guides you through the entire setup process. It has copy buttons for all commands and works in any browser - no cloning required!

**After cloning the repo:** You can also double-click `open-tutorial.bat` in the project folder to open the same tutorial locally.

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

## Tutorial Steps

The tutorial is organized into branches, each representing a different stage of development:

1. `main` - Basic setup and project structure
2. `character-server` - Implementing the character management server
3. `world-server` - Adding world-building functionality
4. `plot-server` - Creating the plot management system
5. `writing-server` - Implementing writing progress tracking
6. `research-server` - Adding research management capabilities

Each branch builds upon the previous one, gradually introducing new concepts and functionality.

## Documentation

For detailed information about the project, please refer to the following documentation:

- [Core Series Schema](docs/core-series-schema.md)
- [Project Structure Guide](docs/mcp-tutorial-structure.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
