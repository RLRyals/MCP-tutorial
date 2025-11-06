# Quick Start - MCP Writing System

This distribution provides a **complete automated setup** with PostgreSQL database, MCP Connector, and Typing Mind.

## ✅ What This Does

- Builds and runs **PostgreSQL database** (`mcp-writing-db`)
- Builds and runs **MCP Connector** with all 9 MCP servers
- Runs MCP Connector on port 50880
- Runs **Typing Mind web server** on port 3000
- Automatically applies all database migrations
- Ready for Typing Mind integration

## 🚀 Automated Setup

### First Time Setup (Run Once)

```powershell
cd distribution
.\setup-all.ps1
```

**What this does:**
1. Downloads Typing Mind static files (730 files, ~63MB) from https://github.com/TypingMind/typingmind
2. Generates secure `.env` file with random passwords (persists between runs)
3. Builds Docker images
4. Starts all containers
5. Waits for services to be healthy
6. Runs health checks
7. Displays connection information

**Total time:** ~2-3 minutes

### Every Subsequent Run

```powershell
cd distribution
.\run.ps1
```

**What this does:**
1. Checks Docker is running
2. Uses existing `.env` file (does NOT regenerate)
3. Starts containers (if not already running)
4. Returns connection info

**Total time:** ~10-30 seconds

## ✅ Success Looks Like

```
========================================
MCP Writing System - Docker Stack Test
========================================

 Docker is running
 .env file found

Cleaning up existing containers...
 Cleanup complete

Starting Docker stack...
Building images...
Starting containers...
 Containers started

Waiting for services to be healthy...
  Attempt 1/30... MCP Connector: starting
  Attempt 2/30... MCP Connector: healthy [OK]

Testing database connection...
 Database is accessible
  Migrations table exists

Testing MCP Connector...
 MCP Connector is responding
  Endpoint: http://localhost:50880

========================================
SUCCESS: All tests passed!
========================================
```

## 📋 Accessing Typing Mind

After setup completes, Typing Mind is automatically running on port 3000.

**Access:** http://localhost:3000

**MCP Connector Configuration:**
1. Open Typing Mind at http://localhost:3000
2. Go to Settings → Advanced → Model Context Protocol
3. Click "Add MCP Connector"
4. Enter:
   - URL: `http://localhost:50880`
   - Token: (displayed in setup output, or check `.env` file for `MCP_AUTH_TOKEN`)
5. Click Connect

All 9 MCP servers will now be available in Typing Mind!

## 🔍 Troubleshooting

### Container won't start?

```powershell
# Check if database is running
docker ps | findstr mcp-writing-db

# Check logs
docker logs mcp-writing-db
docker logs mcp-connector

# Restart both containers
cd docker
docker-compose --env-file ../.env restart
```

### Can't connect to database?

```powershell
# Test database connection from MCP Connector
docker exec mcp-connector psql -h mcp-writing-db -U writer -d mcp_writing_db -c "SELECT 1;"

# Test directly from database container
docker exec mcp-writing-db psql -U writer -d mcp_writing_db -c "SELECT 1;"

# If fails, check .env has correct password
cat ../.env | findstr POSTGRES_PASSWORD
```

### Port 50880 already in use?

```powershell
# Check what's using the port
netstat -ano | findstr 50880

# Change port in .env
# Add: MCP_CONNECTOR_PORT=50881
# Then restart
docker-compose --env-file ../.env down
docker-compose --env-file ../.env up -d
```

## 📊 What's Running

After start:

```
┌─────────────────────────────────────┐
│  PostgreSQL Database                │
│  Container: mcp-writing-db          │
│  Port: 5432                         │
│  Database: mcp_writing_db           │
│  User: writer                       │
└──────────────┬──────────────────────┘
               │
               │ (connects to)
               │
┌──────────────▼──────────────────────┐
│  MCP Connector                      │
│  Container: mcp-connector           │
│  Port: 50880                        │
│  9 MCP Servers inside               │
│  - book-planning-server             │
│  - chapter-planning-server          │
│  - character-planning-server        │
│  - and 6 more...                    │
└─────────────────────────────────────┘
```

## 🛑 Stop

```powershell
cd distribution/docker
docker-compose --env-file ../.env down
```

## 🔄 Restart

```powershell
cd distribution/docker
docker-compose --env-file ../.env restart
```

## 📝 View Logs

```powershell
cd distribution/docker
docker-compose --env-file ../.env logs -f mcp-connector
```

## 🎯 Next Steps

Once working:
1. ✅ Test with Typing Mind (see connection info above)
2. ✅ Verify all 9 MCP servers work
3. ✅ Create some test data (books, chapters, characters)
4. ✅ Ready to build Electron app wrapper!

---

**For detailed documentation and advanced configuration:**
See `README-distribution.md` for comprehensive setup guide.
