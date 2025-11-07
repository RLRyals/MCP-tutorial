# Modular Docker Compose Setup

The MCP Writing System uses a modular architecture that separates the core system from optional clients.

## Quick Start

### Option 1: All-in-One (Existing Behavior)

```bash
# Starts everything: Core + MCP Connector + Typing Mind
docker-compose up -d
```

**Requires:** Typing Mind files downloaded in `../typing-mind-static/`

### Option 2: Core Only

```bash
# Start just the database and MCP servers
docker-compose -f docker-compose.core.yml up -d
```

**Use with:** Claude Desktop, custom clients

### Option 3: Core + MCP Connector (No Typing Mind)

```bash
# Start core + HTTP bridge
docker-compose -f docker-compose.core.yml \
               -f docker-compose.mcp-connector.yml up -d
```

**Use with:** Custom web clients, API access

### Option 4: Everything (Modular)

```bash
# Start all components using modular files
docker-compose -f docker-compose.core.yml \
               -f docker-compose.mcp-connector.yml \
               -f docker-compose.typing-mind.yml up -d
```

**Requires:** Typing Mind files downloaded

---

## File Structure

```
docker/
├── docker-compose.yml                # All-in-one (convenience)
├── docker-compose.core.yml           # Core: Database + MCP Servers
├── docker-compose.mcp-connector.yml  # Client: HTTP bridge
├── docker-compose.typing-mind.yml    # Client: Typing Mind web UI
├── Dockerfile.mcp-connector
├── nginx.conf
└── init.sql
```

---

## What's Included in Each File

### `docker-compose.core.yml` (Required)

**Services:**
- `postgres` - PostgreSQL database
- `mcp-servers` - All 9 MCP servers

**Networks:**
- `mcp-network`

**Volumes:**
- `postgres-data`

**Ports:**
- 5432 (PostgreSQL)

### `docker-compose.mcp-connector.yml` (Optional)

**Services:**
- `mcp-connector` - HTTP API bridge

**Depends On:**
- Core system running

**Ports:**
- 50880 (MCP Connector API)

**Use When:**
- Using web-based clients
- Building custom web apps
- Need HTTP API access

### `docker-compose.typing-mind.yml` (Optional)

**Services:**
- `typing-mind-web` - nginx serving Typing Mind

**Depends On:**
- Core system running
- MCP Connector running

**Ports:**
- 3000 (Typing Mind web UI)

**Requires:**
- Typing Mind files in `../typing-mind-static/`

**Use When:**
- Want Typing Mind web interface
- Prefer browser-based UI

---

## Client Scenarios

### Scenario 1: Claude Desktop User

**What You Need:**
- Core system ✓
- Claude Desktop app (external)

**Setup:**
```bash
# 1. Start core
cd distribution/docker
docker-compose -f docker-compose.core.yml up -d

# 2. Install Claude Desktop (external)

# 3. Configure Claude Desktop
# Edit: ~/.config/Claude/claude_desktop_config.json
# Add MCP server configurations
```

**Benefits:**
- Minimal Docker footprint
- Native desktop app
- No web server needed

### Scenario 2: Typing Mind User

**What You Need:**
- Core system ✓
- MCP Connector ✓
- Typing Mind ✓

**Setup:**
```bash
# 1. Download Typing Mind files
cd distribution
./download-typingmind.sh

# 2. Start all components
cd docker
docker-compose -f docker-compose.core.yml \
               -f docker-compose.mcp-connector.yml \
               -f docker-compose.typing-mind.yml up -d

# 3. Access at http://localhost:3000
```

**Benefits:**
- Beautiful web UI
- Cross-platform (browser)
- Rich features

### Scenario 3: Both Clients

**What You Need:**
- Core system ✓
- MCP Connector ✓
- Typing Mind ✓
- Claude Desktop (external)

**Setup:**
```bash
# 1. Start core + connector + typing-mind
docker-compose -f docker-compose.core.yml \
               -f docker-compose.mcp-connector.yml \
               -f docker-compose.typing-mind.yml up -d

# 2. Configure Claude Desktop
# Use docker exec to access MCP servers via stdio
```

**Benefits:**
- Use whichever client fits the task
- Full flexibility

### Scenario 4: Custom Client Developer

**What You Need:**
- Core system ✓
- MCP Connector ✓ (for HTTP) or direct stdio

**Setup:**
```bash
# Option A: Via HTTP
docker-compose -f docker-compose.core.yml \
               -f docker-compose.mcp-connector.yml up -d

# Your app connects to: http://localhost:50880

# Option B: Via stdio
docker-compose -f docker-compose.core.yml up -d

# Your app executes: docker exec mcp-servers node /app/src/.../index.js
```

---

## Management Commands

### Start Services

```bash
# Core only
docker-compose -f docker-compose.core.yml up -d

# Add MCP Connector
docker-compose -f docker-compose.core.yml \
               -f docker-compose.mcp-connector.yml up -d

# Add Typing Mind
docker-compose -f docker-compose.core.yml \
               -f docker-compose.mcp-connector.yml \
               -f docker-compose.typing-mind.yml up -d
```

### Stop Services

```bash
# Stop specific service
docker-compose -f docker-compose.typing-mind.yml down

# Stop MCP Connector
docker-compose -f docker-compose.mcp-connector.yml down

# Stop core (keeps data)
docker-compose -f docker-compose.core.yml down

# Stop core + remove data
docker-compose -f docker-compose.core.yml down -v
```

### View Logs

```bash
# Core services
docker-compose -f docker-compose.core.yml logs -f

# MCP Connector
docker-compose -f docker-compose.mcp-connector.yml logs -f mcp-connector

# Typing Mind
docker-compose -f docker-compose.typing-mind.yml logs -f typing-mind-web
```

### Restart Services

```bash
# Restart core
docker-compose -f docker-compose.core.yml restart

# Restart just MCP Connector
docker-compose -f docker-compose.mcp-connector.yml restart mcp-connector

# Restart Typing Mind web server
docker-compose -f docker-compose.typing-mind.yml restart typing-mind-web
```

---

## Environment Variables

All compose files use the same `.env` file:

```bash
# Core System
POSTGRES_DB=mcp_writing_db
POSTGRES_USER=writer
POSTGRES_PASSWORD=your-secure-password
POSTGRES_PORT=5432
POSTGRES_CONTAINER_NAME=mcp-writing-db

# MCP Connector (only needed if using web clients)
MCP_CONNECTOR_PORT=50880
MCP_CONNECTOR_CONTAINER_NAME=mcp-connector
MCP_AUTH_TOKEN=your-auth-token

# Typing Mind (only needed if using Typing Mind)
TYPING_MIND_PORT=3000
TYPING_MIND_CONTAINER_NAME=typing-mind-web
TYPING_MIND_DIR=../typing-mind-static
NGINX_CONF_PATH=./nginx.conf

# Network & Volumes
MCP_NETWORK_NAME=mcp-network
POSTGRES_VOLUME_NAME=mcp-writing-data
```

---

## Benefits of Modular Approach

### For End Users

✅ **Choose Your Client**: Don't want Typing Mind? Don't install it
✅ **Smaller Install**: Core system without unnecessary clients
✅ **Flexibility**: Add/remove clients without affecting core
✅ **Multiple Clients**: Use Claude Desktop AND Typing Mind
✅ **Easier Updates**: Update Typing Mind without touching core

### For Developers

✅ **Separation of Concerns**: Core logic separate from clients
✅ **Easier Testing**: Test core without client dependencies
✅ **Client-Agnostic**: Core doesn't know about clients
✅ **Easy to Extend**: Add new clients without modifying core
✅ **Smaller Codebase**: Each file has clear purpose

---

## Migration Guide

### From All-in-One to Modular

If you're currently using `docker-compose up -d`:

```bash
# Your current command (still works!)
docker-compose up -d

# Equivalent modular command
docker-compose -f docker-compose.core.yml \
               -f docker-compose.mcp-connector.yml \
               -f docker-compose.typing-mind.yml up -d

# Both do the same thing!
```

**No migration needed** - the all-in-one file still works.

### To Use Only Core

```bash
# Stop everything
docker-compose down

# Start only core
docker-compose -f docker-compose.core.yml up -d

# Now configure Claude Desktop to connect
```

---

## Troubleshooting

### "Network mcp-network not found"

**Problem:** Starting a client compose file without core running

**Solution:**
```bash
# Always start core first
docker-compose -f docker-compose.core.yml up -d

# Then start clients
docker-compose -f docker-compose.mcp-connector.yml up -d
```

### "typing-mind-static folder not found"

**Problem:** Starting Typing Mind without downloading files

**Solution:**
```bash
# Download files first
cd distribution
./download-typingmind.sh

# Then start
cd docker
docker-compose -f docker-compose.typing-mind.yml up -d
```

### Services won't connect

**Problem:** Services can't find each other

**Solution:**
```bash
# Make sure all services use the same network
docker network ls | grep mcp-network

# If network doesn't exist, start core first
docker-compose -f docker-compose.core.yml up -d
```

---

## Related Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture overview
- [ELECTRON-DEPLOYMENT.md](../ELECTRON-DEPLOYMENT.md) - Electron app integration
- [README-distribution.md](../README-distribution.md) - General Docker setup
- [TYPING-MIND-SETUP.md](../TYPING-MIND-SETUP.md) - Typing Mind client setup

---

**Questions?** See [ARCHITECTURE.md](../ARCHITECTURE.md) for detailed architecture information.
