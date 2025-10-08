# Docker MCP Toolkit Setup Guide

This guide explains how to use the Docker-based distribution of MCP Tutorial, which simplifies installation and eliminates common setup issues.

## Table of Contents
- [Why Docker MCP Toolkit?](#why-docker-mcp-toolkit)
- [For Students: Installation](#for-students-installation)
- [For Instructors: Building Distribution](#for-instructors-building-distribution)
- [Architecture Overview](#architecture-overview)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

---

## Why Docker MCP Toolkit?

### Traditional Installation Pain Points
- Node.js version conflicts
- PATH configuration issues
- Platform-specific bugs (Windows vs Mac vs Linux)
- Manual JSON config editing (error-prone)
- Dependency management

### Docker MCP Toolkit Benefits
- ✅ **One-Click Installation** - Load image and run
- ✅ **Cross-Platform** - Works identically on Windows, Mac, Linux
- ✅ **Isolated Environment** - No Node.js installation needed
- ✅ **Consistent** - Everyone runs the exact same environment
- ✅ **Secure** - Containers run with resource limits and isolation
- ✅ **Easy Updates** - Just distribute new image file

---

## For Students: Installation

### Prerequisites
1. **Docker Desktop 4.42.0 or later**
   - Download: https://www.docker.com/products/docker-desktop
   - Install and ensure it's running (green icon in system tray)

2. **Claude Desktop** (or compatible MCP client)
   - Download: https://claude.ai/download

### Quick Start (Automated)

1. **Extract the distribution package** you received from your instructor

2. **Run the installation script**:
   ```powershell
   .\student-install.ps1
   ```

3. **Follow the prompts** - the script will:
   - Check Docker Desktop is running
   - Load the MCP Tutorial image
   - Start all services
   - Help configure Claude Desktop

4. **Restart Claude Desktop** completely (quit, don't just close)

5. **Test it!** Ask Claude:
   ```
   "Can you list all authors in my database?"
   ```

### Manual Installation

If you prefer manual steps or the script doesn't work:

#### 1. Load Docker Image
```powershell
docker load -i mcp-tutorial-image.tar
```

#### 2. Create Environment File
Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```

#### 3. Start Services
```powershell
docker-compose -f docker-compose.mcp.yml up -d
```

#### 4. Configure Claude Desktop

**Option A: Using Docker Desktop UI** (Easiest)
1. Open Docker Desktop
2. Go to Containers section
3. Find `mcp-tutorial-*` containers
4. Click "Connect to Claude Desktop" for each
5. Restart Claude Desktop

**Option B: Manual Config**
1. Generate config file:
   ```powershell
   .\scripts\generate-docker-mcp-config.ps1 -AllServers
   ```

2. Copy to Claude Desktop:
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

3. Restart Claude Desktop

### Verify Installation

Check services are running:
```powershell
docker-compose -f docker-compose.mcp.yml ps
```

You should see:
- `mcp-tutorial-db` (postgres) - healthy
- 12 MCP server containers - running

View logs:
```powershell
docker-compose -f docker-compose.mcp.yml logs -f
```

---

## For Instructors: Building Distribution

### Building the Distribution Package

1. **Ensure your code is ready**:
   ```bash
   git checkout MCP_8_Docker
   git pull origin MCP_8_Docker
   ```

2. **Run the build script**:
   ```powershell
   .\scripts\build-for-distribution.ps1
   ```

3. **Wait for completion** (2-5 minutes):
   - Builds Docker image (~200MB)
   - Exports to tar file
   - Creates student documentation
   - Packages everything in `./distribution` folder

4. **Test on a clean machine** (recommended):
   - Copy `distribution` folder to test machine
   - Run `student-install.ps1`
   - Verify everything works

5. **Distribute to students**:
   - Upload `distribution` folder to LMS/Google Drive/etc.
   - Share the `student-setup-instructions.md`
   - File size: ~200-300MB

### Build Options

```powershell
# Custom output directory
.\scripts\build-for-distribution.ps1 -OutputDir "C:\course-materials"

# Skip rebuild (use existing image)
.\scripts\build-for-distribution.ps1 -SkipBuild

# Show help
.\scripts\build-for-distribution.ps1 -Help
```

### Distribution Contents

The `distribution` folder contains:
- `mcp-tutorial-image.tar` - Docker image with all MCP servers
- `docker-compose.mcp.yml` - Service orchestration
- `.env.example` - Environment template
- `student-setup-instructions.md` - Complete installation guide
- `README.md` - Quick reference
- `student-install.ps1` - Automated installer

---

## Architecture Overview

### Container Structure

```
┌─────────────────────────────────────────┐
│         Docker Host Machine              │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  PostgreSQL Container              │ │
│  │  (mcp-tutorial-db)                 │ │
│  │  Port: 5432                        │ │
│  └────────────────────────────────────┘ │
│           ▲                              │
│           │ Database Connection          │
│           │                              │
│  ┌────────┴───────────────────────────┐ │
│  │  MCP Server Containers (12)        │ │
│  │                                    │ │
│  │  • mcp-tutorial-author             │ │
│  │  • mcp-tutorial-series             │ │
│  │  • mcp-tutorial-book               │ │
│  │  • mcp-tutorial-character          │ │
│  │  • mcp-tutorial-timeline           │ │
│  │  • mcp-tutorial-metadata           │ │
│  │  • mcp-tutorial-trope              │ │
│  │  • mcp-tutorial-plot               │ │
│  │  • mcp-tutorial-relationship       │ │
│  │  • mcp-tutorial-story-analysis     │ │
│  │  • mcp-tutorial-world              │ │
│  │  • mcp-tutorial-writing            │ │
│  │                                    │ │
│  │  Each runs: Node.js MCP Server     │ │
│  │  Transport: stdio                  │ │
│  └────────────────────────────────────┘ │
│           ▲                              │
└───────────┼──────────────────────────────┘
            │ docker exec -i
            │
    ┌───────┴─────────┐
    │ Claude Desktop  │
    │                 │
    │ MCP Client      │
    └─────────────────┘
```

### How It Works

1. **Image Building**:
   - Single Dockerfile creates one image
   - Contains all MCP server code
   - Entry point configurable via `MCP_SERVER` env var

2. **Container Startup**:
   - docker-compose starts 13 containers (1 DB + 12 MCP servers)
   - Each MCP server container runs different entry point
   - All share same network for database access

3. **Claude Desktop Connection**:
   - Uses `docker exec -i` to communicate with containers
   - stdio transport over Docker exec
   - No network ports needed for MCP (only DB uses 5432)

4. **Security**:
   - Containers run as non-root user (`mcp`)
   - Isolated from host filesystem
   - Resource limits (1 CPU, 2GB RAM per container)

---

## Troubleshooting

### Docker Desktop Not Running

**Symptoms:**
- `docker load` fails with "Cannot connect to Docker daemon"
- `docker-compose up` fails

**Solution:**
1. Start Docker Desktop
2. Wait for green icon in system tray
3. Verify: `docker info`

### Image Load Fails

**Symptoms:**
- "No space left on device"
- "Error loading image"

**Solution:**
```powershell
# Free up space
docker system prune -a

# Check available space
docker system df

# Retry load
docker load -i mcp-tutorial-image.tar
```

### Services Won't Start

**Symptoms:**
- Containers exit immediately
- "port already allocated"

**Solution:**
```powershell
# View logs
docker-compose -f docker-compose.mcp.yml logs

# Check what's using port 5432
netstat -ano | findstr :5432

# Stop conflicting services or change port in .env
```

### Database Connection Errors

**Symptoms:**
- MCP tools fail with "connection refused"
- "database does not exist"

**Solution:**
```powershell
# Check database is healthy
docker-compose -f docker-compose.mcp.yml ps

# View database logs
docker-compose -f docker-compose.mcp.yml logs postgres

# Restart database
docker-compose -f docker-compose.mcp.yml restart postgres

# Wait 30 seconds for initialization
```

### Claude Desktop Shows No Tools

**Symptoms:**
- No 🔨 icon in Claude
- Claude doesn't acknowledge MCP servers

**Solution:**
1. **Verify config file location**:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. **Validate JSON syntax**:
   - Use a JSON validator
   - No trailing commas
   - Proper quotes

3. **Check containers are running**:
   ```powershell
   docker ps | findstr mcp-tutorial
   ```

4. **Completely restart Claude**:
   - Quit Claude (not just close window)
   - Check Task Manager/Activity Monitor (no Claude processes)
   - Restart Claude Desktop

5. **Test docker exec manually**:
   ```powershell
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | docker exec -i mcp-tutorial-author node src/mcps/author-server/index.js
   ```

### Permission Errors

**Symptoms:**
- "permission denied" errors
- Container won't start

**Solution:**
- Ensure Docker Desktop has necessary permissions
- On Windows: Run Docker Desktop as Administrator (if needed)
- Check file ownership in container logs

---

## Advanced Usage

### Running Individual Servers

Start just the database and one MCP server:

```powershell
# Start database only
docker-compose -f docker-compose.mcp.yml up -d postgres

# Start specific MCP server
docker-compose -f docker-compose.mcp.yml up -d mcp-author
```

### Custom Configuration

Edit `docker-compose.mcp.yml` to:
- Change database credentials
- Modify resource limits
- Add environment variables

### Development Mode

Mount local source code for live changes:

```yaml
# Add to docker-compose.mcp.yml under mcp-author service
volumes:
  - ./src:/app/src:ro
```

### Accessing Database Directly

```powershell
# Connect with psql
docker exec -it mcp-tutorial-db psql -U postgres -d book_series_db

# Or use a GUI tool connecting to:
# Host: localhost
# Port: 5432
# User: postgres
# Password: postgres
# Database: book_series_db
```

### Viewing Real-Time Logs

```powershell
# All services
docker-compose -f docker-compose.mcp.yml logs -f

# Specific service
docker-compose -f docker-compose.mcp.yml logs -f mcp-author

# Last 50 lines
docker-compose -f docker-compose.mcp.yml logs --tail=50
```

### Stopping and Cleanup

```powershell
# Stop all services (keeps data)
docker-compose -f docker-compose.mcp.yml down

# Stop and remove volumes (deletes data!)
docker-compose -f docker-compose.mcp.yml down -v

# Remove just the containers
docker-compose -f docker-compose.mcp.yml rm -f
```

### Backup and Restore

**Backup Database:**
```powershell
docker exec mcp-tutorial-db pg_dump -U postgres book_series_db > backup.sql
```

**Restore Database:**
```powershell
cat backup.sql | docker exec -i mcp-tutorial-db psql -U postgres book_series_db
```

### Resource Monitoring

```powershell
# View resource usage
docker stats

# View disk usage
docker system df

# View network info
docker network inspect mcp-tutorial-network
```

---

## Comparison: Traditional vs Docker Setup

| Aspect | Traditional Setup | Docker MCP Toolkit |
|--------|------------------|-------------------|
| **Installation Time** | 30-60 minutes | 5-10 minutes |
| **Prerequisites** | Node.js, Git, npm | Docker Desktop only |
| **Config Complexity** | Manual JSON editing with absolute paths | Auto-generated or one-click |
| **Platform Issues** | Common (Windows PATH, Mac permissions) | Rare (Docker handles it) |
| **Updates** | `git pull && npm install` | Load new tar file |
| **Troubleshooting** | Complex (multiple tools) | Standardized (Docker logs) |
| **Student Support** | High (many variables) | Low (consistent environment) |
| **Disk Space** | ~500MB (Node modules) | ~300MB (compressed image) |
| **Portability** | Requires same Node version | Runs anywhere Docker runs |

---

## FAQ

**Q: Do students need to know Docker?**
A: No. The installation script handles everything. They just need Docker Desktop installed.

**Q: Can students use Typing Mind instead of Claude Desktop?**
A: Yes, but Typing Mind requires HTTP mode. Update docker-compose to expose ports for the servers students need.

**Q: How do I update the tutorial for students?**
A: Build a new distribution package and share it. Students can `docker-compose down`, load new image, and `docker-compose up`.

**Q: What if a student has Docker Desktop but an older version?**
A: The MCP servers will still work, but Docker MCP Toolkit UI features require 4.42+. Manual config always works.

**Q: Can I customize which MCP servers are included?**
A: Yes. Edit `docker-compose.mcp.yml` to remove services you don't want. Or use `generate-docker-mcp-config.ps1 -Servers author,series,book` to only configure specific ones.

**Q: How much disk space does this use?**
A: Image: ~250MB, Running containers: ~50MB, Database: varies with data (usually <100MB for tutorial data).

**Q: Is this secure for production?**
A: This setup is designed for local development/learning. For production, add TLS, authentication, and follow Docker security best practices.

---

## Support

If you encounter issues not covered here:

1. Check container logs: `docker-compose -f docker-compose.mcp.yml logs`
2. Verify services: `docker-compose -f docker-compose.mcp.yml ps`
3. Test database: `docker exec mcp-tutorial-db pg_isready -U postgres`
4. Contact your instructor with:
   - Error messages
   - Output of `docker version`
   - Output of `docker-compose ps`
   - Relevant logs

---

**Happy Writing! 📚✨**
