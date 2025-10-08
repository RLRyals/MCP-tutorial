# Typing Mind Integration with MCP Tutorial

## Overview

**Important Difference:**
- **Claude Desktop**: Uses stdio transport (runs MCP servers as local processes)
- **Typing Mind**: Uses HTTP transport (MCP servers run as web services)

This means Typing Mind requires a different setup than Claude Desktop.

## Table of Contents
- [How Typing Mind MCP Works](#how-typing-mind-mcp-works)
- [Setup Options](#setup-options)
- [Option 1: Docker with HTTP Ports](#option-1-docker-with-http-ports-recommended)
- [Option 2: Traditional Node.js Setup](#option-2-traditional-nodejs-setup)
- [Configuring Typing Mind](#configuring-typing-mind)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

---

## How Typing Mind MCP Works

```
┌─────────────────┐
│  Typing Mind    │
│  (Web Browser)  │
└────────┬────────┘
         │ HTTP Requests
         ↓
┌─────────────────┐
│  MCP Server     │
│  (HTTP Mode)    │
│  Port: 3500     │
└────────┬────────┘
         │ PostgreSQL
         ↓
┌─────────────────┐
│  Database       │
└─────────────────┘
```

**Key Differences from Claude Desktop:**
- Runs as HTTP server (not stdio)
- Requires exposed ports
- Web-based protocol
- Can be accessed remotely (if configured)

---

## Setup Options

### Option 1: Docker with HTTP Ports (Recommended)

Use Docker but expose HTTP ports for Typing Mind.

**Pros:**
- ✅ Easy installation
- ✅ Isolated environment
- ✅ Same as Claude Desktop setup (just different ports)
- ✅ Easy updates

**Cons:**
- ⚠️ Need to expose ports
- ⚠️ Slightly different docker-compose file

### Option 2: Traditional Node.js Setup

Run MCP servers directly via Node.js in HTTP mode.

**Pros:**
- ✅ Direct control
- ✅ Easier debugging

**Cons:**
- ⚠️ Requires Node.js installation
- ⚠️ Manual process management
- ⚠️ Platform-specific issues

---

## Option 1: Docker with HTTP Ports (Recommended)

### 1. Create HTTP-Enabled Docker Compose

Create `docker-compose.typing-mind.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database (same as before)
  postgres:
    image: postgres:15
    container_name: mcp-tutorial-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-book_series_db}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
    volumes:
      - mcp_tutorial_db:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - mcp-tutorial-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d book_series_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Author MCP Server - HTTP Mode
  mcp-author-http:
    image: mcp-tutorial:latest
    container_name: mcp-tutorial-author-http
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      MCP_SERVER: author
      MCP_HTTP_MODE: "true"
      MCP_PORT: "3501"
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/book_series_db
      NODE_ENV: production
    ports:
      - "3501:3501"
    networks:
      - mcp-tutorial-network
    command: node src/mcps/author-server/index.js --http --port 3501

  # Series MCP Server - HTTP Mode
  mcp-series-http:
    image: mcp-tutorial:latest
    container_name: mcp-tutorial-series-http
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      MCP_SERVER: series
      MCP_HTTP_MODE: "true"
      MCP_PORT: "3502"
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/book_series_db
      NODE_ENV: production
    ports:
      - "3502:3502"
    networks:
      - mcp-tutorial-network
    command: node src/mcps/series-server/index.js --http --port 3502

  # Book MCP Server - HTTP Mode
  mcp-book-http:
    image: mcp-tutorial:latest
    container_name: mcp-tutorial-book-http
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      MCP_SERVER: book
      MCP_HTTP_MODE: "true"
      MCP_PORT: "3503"
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/book_series_db
      NODE_ENV: production
    ports:
      - "3503:3503"
    networks:
      - mcp-tutorial-network
    command: node src/mcps/book-server/index.js --http --port 3503

  # Character MCP Server - HTTP Mode
  mcp-character-http:
    image: mcp-tutorial:latest
    container_name: mcp-tutorial-character-http
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      MCP_SERVER: character
      MCP_HTTP_MODE: "true"
      MCP_PORT: "3504"
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/book_series_db
      NODE_ENV: production
    ports:
      - "3504:3504"
    networks:
      - mcp-tutorial-network
    command: node src/mcps/character-server/index.js --http --port 3504

  # Add more servers as needed (timeline, metadata, etc.)
  # Following the same pattern with different ports

networks:
  mcp-tutorial-network:
    driver: bridge

volumes:
  mcp_tutorial_db:
```

### 2. Start Services

**Docker Compose V2:**
```bash
docker compose -f docker-compose.typing-mind.yml up -d
```

**Docker Compose V1:**
```bash
docker-compose -f docker-compose.typing-mind.yml up -d
```

### 3. Verify Services Running

```bash
# Check all containers
docker compose -f docker-compose.typing-mind.yml ps

# Test endpoints
curl http://localhost:3501/health  # Author server
curl http://localhost:3502/health  # Series server
curl http://localhost:3503/health  # Book server
curl http://localhost:3504/health  # Character server
```

---

## Option 2: Traditional Node.js Setup

### 1. Prerequisites

- Node.js (LTS version)
- Git
- PostgreSQL (via Docker or installed)

### 2. Clone and Install

```bash
git clone https://github.com/RLRyals/MCP-tutorial.git
cd MCP-tutorial
npm install
```

### 3. Start Database

```bash
# Using Docker for just the database
docker compose up -d postgres
```

### 4. Configure Environment

Create `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/book_series_db
NODE_ENV=development
```

### 5. Start MCP Servers in HTTP Mode

**In separate terminal windows:**

```bash
# Terminal 1 - Author Server
node src/mcps/author-server/index.js --http --port 3501

# Terminal 2 - Series Server
node src/mcps/series-server/index.js --http --port 3502

# Terminal 3 - Book Server
node src/mcps/book-server/index.js --http --port 3503

# Terminal 4 - Character Server
node src/mcps/character-server/index.js --http --port 3504
```

**Or use a process manager like PM2:**

```bash
# Install PM2
npm install -g pm2

# Start all servers
pm2 start src/mcps/author-server/index.js --name author -- --http --port 3501
pm2 start src/mcps/series-server/index.js --name series -- --http --port 3502
pm2 start src/mcps/book-server/index.js --name book -- --http --port 3503
pm2 start src/mcps/character-server/index.js --name character -- --http --port 3504

# Save configuration
pm2 save
pm2 startup
```

---

## Configuring Typing Mind

### 1. Access MCP Settings in Typing Mind

1. Open Typing Mind (https://www.typingmind.com/)
2. Go to Settings → Plugins/Extensions → MCP Servers
3. Click "Add MCP Server"

### 2. Add Each MCP Server

**For Each Server, Enter:**

**Author Server:**
- **Name**: Author Manager
- **URL**: `http://localhost:3501`
- **Description**: Manage authors in your book series

**Series Server:**
- **Name**: Series Manager
- **URL**: `http://localhost:3502`
- **Description**: Organize book series

**Book Server:**
- **Name**: Book Manager
- **URL**: `http://localhost:3503`
- **Description**: Track individual books and chapters

**Character Server:**
- **Name**: Character Manager
- **URL**: `http://localhost:3504`
- **Description**: Character tracking and development

### 3. Test the Connection

In Typing Mind:
1. Start a new chat
2. Type: "List all authors"
3. Typing Mind should use the Author Manager MCP server
4. You should see it working!

---

## Port Reference

| MCP Server | Port | URL |
|------------|------|-----|
| Author | 3501 | http://localhost:3501 |
| Series | 3502 | http://localhost:3502 |
| Book | 3503 | http://localhost:3503 |
| Character | 3504 | http://localhost:3504 |
| Timeline | 3505 | http://localhost:3505 |
| Metadata | 3506 | http://localhost:3506 |
| Trope | 3507 | http://localhost:3507 |
| Plot | 3508 | http://localhost:3508 |
| Relationship | 3509 | http://localhost:3509 |
| Story Analysis | 3510 | http://localhost:3510 |
| World | 3511 | http://localhost:3511 |
| Writing | 3512 | http://localhost:3512 |
| Database | 5432 | (PostgreSQL) |

---

## Security Considerations

### Local Development (Safe)

If running on `localhost` for personal use:
- ✅ Only accessible from your computer
- ✅ Safe for development
- ✅ No special security needed

### Network Access (Requires Security)

**If you need to access from other devices on your network:**

1. **Use Authentication**:
   Add API key or basic auth to MCP servers

2. **Use Firewall**:
   ```bash
   # macOS - Block external access
   # (Already default on most systems)
   ```

3. **Use HTTPS**:
   Set up reverse proxy with SSL

4. **Bind to localhost only**:
   ```bash
   # In docker-compose, change ports from:
   ports:
     - "3501:3501"  # Accessible from network

   # To:
   ports:
     - "127.0.0.1:3501:3501"  # Localhost only
   ```

### Production / Remote Access (Not Recommended)

**This setup is designed for local use only.**

For remote access:
- Use VPN
- Add authentication
- Use HTTPS/TLS
- Follow security best practices
- Consider cloud-hosted alternatives

---

## Troubleshooting

### "Cannot connect to server"

**Check server is running:**
```bash
# Docker
docker compose -f docker-compose.typing-mind.yml ps

# Check logs
docker compose -f docker-compose.typing-mind.yml logs mcp-author-http

# Direct test
curl http://localhost:3501/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### "Port already in use"

**Find what's using the port:**
```bash
# macOS/Linux
lsof -i :3501

# Windows
netstat -ano | findstr :3501
```

**Change ports in docker-compose or start command**

### CORS Errors in Browser

MCP servers should have CORS enabled. If you see CORS errors:

**Check server logs:**
```bash
docker compose -f docker-compose.typing-mind.yml logs mcp-author-http
```

**Verify CORS is enabled in server code:**
The MCP servers should include CORS middleware when running in HTTP mode.

### Database Connection Errors

**Check database is running:**
```bash
docker compose -f docker-compose.typing-mind.yml ps postgres
```

**Check connection string:**
Verify `DATABASE_URL` in environment is correct

**Test database directly:**
```bash
docker exec -it mcp-tutorial-db psql -U postgres -d book_series_db
```

### Typing Mind Can't Find Tools

**Verify MCP server is returning tools:**
```bash
curl http://localhost:3501/tools
```

**Should return JSON with tool definitions:**
```json
{
  "tools": [
    {
      "name": "list_authors",
      "description": "List all authors",
      ...
    }
  ]
}
```

---

## Daily Usage

### Starting Services

**Docker:**
```bash
docker compose -f docker-compose.typing-mind.yml up -d
```

### Stopping Services

**Docker:**
```bash
docker compose -f docker-compose.typing-mind.yml down
```

### Viewing Logs

**All services:**
```bash
docker compose -f docker-compose.typing-mind.yml logs -f
```

**Specific service:**
```bash
docker compose -f docker-compose.typing-mind.yml logs -f mcp-author-http
```

### Restarting After Changes

**Restart specific server:**
```bash
docker compose -f docker-compose.typing-mind.yml restart mcp-author-http
```

**Restart all:**
```bash
docker compose -f docker-compose.typing-mind.yml restart
```

---

## Differences from Claude Desktop Setup

| Aspect | Claude Desktop | Typing Mind |
|--------|----------------|-------------|
| **Transport** | stdio | HTTP |
| **Port Exposure** | None needed | Required |
| **Configuration** | claude_desktop_config.json | Typing Mind UI |
| **Process Management** | Claude manages | You manage |
| **Security** | Isolated | Exposed ports |
| **Setup Complexity** | Easier | More complex |

---

## Quick Start Checklist

- [ ] Docker Desktop installed and running
- [ ] Load MCP Tutorial image: `docker load -i mcp-tutorial.tar`
- [ ] Create `docker-compose.typing-mind.yml` (see above)
- [ ] Start services: `docker compose -f docker-compose.typing-mind.yml up -d`
- [ ] Verify health: `curl http://localhost:3501/health`
- [ ] Open Typing Mind
- [ ] Add MCP servers (Settings → MCP Servers)
- [ ] Configure each with URL: `http://localhost:3501`, etc.
- [ ] Test: Ask "List all authors"
- [ ] ✅ Working!

---

## For Instructors: Typing Mind Distribution

**If students use Typing Mind instead of Claude Desktop:**

1. Include `docker-compose.typing-mind.yml` in distribution
2. Update installation instructions for HTTP mode
3. Document port configuration
4. Include Typing Mind setup guide
5. Note: Requires different update process (restart services)

**Alternative:** Provide both setups:
- `docker-compose.mcp.yml` - Claude Desktop (stdio)
- `docker-compose.typing-mind.yml` - Typing Mind (HTTP)

Students choose based on their preferred AI client.

---

## Summary

**To use MCP Tutorial with Typing Mind:**

1. Run MCP servers in HTTP mode (not stdio)
2. Expose ports for each server (3501, 3502, etc.)
3. Configure Typing Mind to connect to `http://localhost:PORT`
4. Everything else works the same!

**Recommended:** Use Docker with HTTP-enabled compose file for easiest setup.

For questions or issues, see [main documentation](DOCKER_MCP_SETUP.md) or contact your instructor.
