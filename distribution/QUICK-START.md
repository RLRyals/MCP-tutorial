# Quick Start - MCP Connector with Existing Database

This distribution connects the MCP Connector to your **existing database** (`mcp-series-db-2`).

## ✅ What This Does

- Builds and runs **MCP Connector only** (no new PostgreSQL container)
- Connects to your existing `mcp-series-db-2` database
- Runs all 9 MCP servers on port 50880
- Uses your existing data and migrations

## 🚀 Quick Start (3 Steps)

### Step 1: Make sure your existing database is running

```powershell
# Check if your database container is running
docker ps | findstr mcp-series-db-2

# If not running, start it with your existing script
.\scripts\start-database.ps1
```

### Step 2: Copy your existing .env file

```powershell
cd distribution

# Copy your current .env (which has the right credentials)
copy ..\.env .env

# Or use the example
copy .env.example .env
# Then edit to match your existing database password
```

### Step 3: Start the MCP Connector

```powershell
cd docker
docker-compose --env-file ../.env up -d --build

# Watch the logs
docker-compose --env-file ../.env logs -f mcp-connector
```

## 🧪 Test It

```powershell
# From the distribution folder
.\test-docker-stack.ps1 -Build -Verbose
```

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

## 📋 Connection Info for Typing Mind

After successful start:

**MCP Connector Endpoint:**
- URL: `http://localhost:50880`
- Auth Token: (from your `.env` file - look for `MCP_AUTH_TOKEN`)

**To configure Typing Mind:**
1. Open Typing Mind in browser
2. Go to Settings → Advanced → Model Context Protocol
3. Click "Add MCP Connector"
4. Enter:
   - URL: `http://localhost:50880`
   - Token: (your `MCP_AUTH_TOKEN`)
5. Click Connect

## 🔍 Troubleshooting

### Container won't start?

```powershell
# Check if existing database is running
docker ps | findstr mcp-series-db-2

# Check logs
docker logs mcp-connector

# Common fix: Restart database first
docker restart mcp-series-db-2
```

### Can't connect to database?

```powershell
# Test database connection from MCP Connector
docker exec mcp-connector psql -h mcp-series-db-2 -U writer -d mcp_series -c "SELECT 1;"

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
│  Existing Database (already running)│
│  Container: mcp-series-db-2         │
│  Port: 5432                         │
│  Database: mcp_series               │
└──────────────┬──────────────────────┘
               │
               │ (connects to)
               │
┌──────────────▼──────────────────────┐
│  NEW: MCP Connector                 │
│  Container: mcp-connector           │
│  Port: 50880                        │
│  9 MCP Servers inside               │
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
1. ✅ Test with Typing Mind
2. ✅ Verify all 9 MCP servers work
3. ✅ Ready to build Electron app wrapper!

---

**Need the full setup with standalone PostgreSQL?**
See `README-distribution.md` for the full 2-container stack.
