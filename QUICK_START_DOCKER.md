# MCP Tutorial - Quick Start (Docker Edition)

**⚡ 5-Minute Setup for Students**

## What You Need
- ✅ Docker Desktop 4.42+ ([Download](https://www.docker.com/products/docker-desktop))
- ✅ Claude Desktop ([Download](https://claude.ai/download))
- ✅ This distribution package (provided by your instructor)

## Installation (3 Steps)

### 1️⃣ Install Prerequisites (One-Time)
```powershell
# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop
# After install, ensure Docker Desktop is running (green icon in tray)

# Install Claude Desktop
# Download from: https://claude.ai/download
```

### 2️⃣ Run Setup Script

**Windows (PowerShell):**
```powershell
# Navigate to the distribution folder
cd path\to\mcp-tutorial-distribution

# Run the automated installer
.\student-install.ps1
```

**Mac/Linux (Bash):**
```bash
# Navigate to the distribution folder
cd path/to/mcp-tutorial-distribution

# Make executable and run
chmod +x student-install.sh
./student-install.sh
```

The script will:
- ✅ Check Docker is running
- ✅ Load MCP Tutorial image
- ✅ Start all services
- ✅ Offer to configure Claude Desktop

### 3️⃣ Connect Claude Desktop

**Option A: Docker Desktop UI** (Easiest)
1. Open Docker Desktop
2. Go to Containers tab
3. Find `mcp-tutorial-*` containers
4. Click "Connect to Claude Desktop" for each
5. Restart Claude Desktop

**Option B: Generate Config File**

**Windows:**
```powershell
.\scripts\generate-docker-mcp-config.ps1 -AllServers
```

**Mac/Linux:**
```bash
./scripts/generate-docker-mcp-config.sh --all
```

Then copy to your Claude config location.

### ✅ Test It!
Open Claude Desktop and ask:
```
"Can you list all authors in my database?"
```

You should see Claude use the MCP tools! 🎉

---

## Daily Usage

### Start Services
```powershell
docker-compose -f docker-compose.mcp.yml up -d
```

### Stop Services
```powershell
docker-compose -f docker-compose.mcp.yml down
```

### View Logs
```powershell
docker-compose -f docker-compose.mcp.yml logs -f
```

### Check Status
```powershell
docker-compose -f docker-compose.mcp.yml ps
```

---

## Common Issues

### "Docker Desktop is not running"
**Fix:** Start Docker Desktop and wait for green icon

### "No tools showing in Claude"
**Fix:**
1. Check containers are running: `docker ps`
2. Completely quit Claude Desktop (not just close)
3. Restart Claude Desktop

### "Database connection error"
**Fix:**
```powershell
# Restart database
docker-compose -f docker-compose.mcp.yml restart postgres

# Wait 30 seconds for startup
```

### "Port 5432 already in use"
**Fix:** Stop any existing PostgreSQL instances

---

## What's Running?

After installation, you'll have 13 Docker containers:

**Database:**
- `mcp-tutorial-db` - PostgreSQL database

**MCP Servers (12):**
- `mcp-tutorial-author` - Author management
- `mcp-tutorial-series` - Series management
- `mcp-tutorial-book` - Book management
- `mcp-tutorial-character` - Character tracking
- `mcp-tutorial-timeline` - Timeline management
- `mcp-tutorial-metadata` - Metadata management
- `mcp-tutorial-trope` - Trope tracking
- `mcp-tutorial-plot` - Plot structure
- `mcp-tutorial-relationship` - Character relationships
- `mcp-tutorial-story-analysis` - Story analysis
- `mcp-tutorial-world` - World building
- `mcp-tutorial-writing` - Writing sessions

---

## Available Claude Commands

Once connected, try these in Claude Desktop:

### Author Management
- "List all authors"
- "Create a new author named John Smith"
- "Show me details for author ID 1"

### Series Management
- "List all book series"
- "Create a new series called 'The Magic Chronicles'"
- "Show me series ID 1"

### Book Management
- "List all books in series 1"
- "Create a new book in series 1"
- "Show me book ID 1"

### Character Management
- "List all characters"
- "Create a character named Sarah in book 1"
- "Show character relationships"

### Timeline Management
- "Show me the timeline for series 1"
- "Add a timeline event"

And many more! Explore the tools Claude shows you.

---

## Need Help?

1. **Check the full guide:** [Docker MCP Setup Guide](docs/DOCKER_MCP_SETUP.md)
2. **View logs for errors:**
   ```powershell
   docker-compose -f docker-compose.mcp.yml logs
   ```
3. **Contact your instructor** with:
   - Error messages
   - Output of `docker-compose ps`
   - Screenshots if helpful

---

## Updating

When your instructor provides a new version:

```powershell
# Stop current services
docker-compose -f docker-compose.mcp.yml down

# Load new image
docker load -i mcp-tutorial-image.tar

# Start services
docker-compose -f docker-compose.mcp.yml up -d
```

---

**Happy Writing! 📚✨**

For complete documentation, see: [docs/DOCKER_MCP_SETUP.md](docs/DOCKER_MCP_SETUP.md)
