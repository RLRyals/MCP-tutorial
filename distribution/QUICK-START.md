# Quick Start - MCP Writing System

This distribution provides a **complete standalone setup** with PostgreSQL database and MCP Connector.

## ✅ What This Does

- Builds and runs **PostgreSQL database** (`mcp-writing-db`)
- Builds and runs **MCP Connector** with all 9 MCP servers
- Runs MCP Connector on port 50880
- Automatically applies all database migrations
- Ready for Typing Mind integration

## 🚀 Quick Start (3 Steps)

### Step 1: Generate environment configuration

```powershell
cd distribution

# Generate .env file with secure random credentials
.\generate-env.ps1

# This creates .env with auto-generated secure passwords
```

### Step 2: Start the complete stack

```powershell
cd docker
docker-compose --env-file ../.env up -d --build

# Watch the logs
docker-compose --env-file ../.env logs -f
```

### Step 3: Verify it's working

```powershell
# From the distribution folder
cd ..
.\test-docker-stack.ps1 -Verbose

# Or check manually
docker ps
# You should see: mcp-writing-db and mcp-connector
```

## 🧪 Test It

```powershell
# From the distribution folder
.\test-docker-stack.ps1 -Verbose
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
