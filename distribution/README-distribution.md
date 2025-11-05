# MCP Writing System - Distribution Package

This directory contains everything needed to run the MCP Writing System with Docker and Typing Mind integration.

## Contents

```
distribution/
├── docker/
│   ├── docker-compose.yml           # Container orchestration
│   ├── Dockerfile.mcp-connector     # MCP Connector image definition
│   ├── docker-entrypoint.sh         # Startup script
│   ├── init.sql                     # Database initialization
│   └── nginx.conf                   # Typing Mind web server config
│
├── .env.example                     # Configuration template
├── .dockerignore                    # Docker build exclusions
├── test-docker-stack.ps1            # Testing script
└── README-distribution.md           # This file
```

## Prerequisites

1. **Docker Desktop** installed and running
   - Windows: https://www.docker.com/products/docker-desktop/
   - Mac: https://www.docker.com/products/docker-desktop/
   - Linux: Docker Engine + Docker Compose

2. **Typing Mind Personal License** (optional, for web UI)
   - Purchase from: https://www.typingmind.com
   - Download static files after purchase

## Quick Start

### Step 1: Configure Environment

```powershell
# Use the automated script to generate secure credentials
.\generate-env.ps1

# This creates .env with auto-generated secure passwords
# - POSTGRES_PASSWORD (database password)
# - MCP_AUTH_TOKEN (random secure token)
```

**Or generate manually:**
```powershell
# PowerShell - generate secure token
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Copy example and edit
cp .env.example .env
notepad .env
```

### Step 2: Start Docker Stack

```powershell
# Change to docker directory
cd docker

# Start containers (builds on first run)
docker-compose up -d

# Watch logs
docker-compose logs -f
```

### Step 3: Verify Services

```powershell
# Run test script (from distribution directory)
cd ..
.\test-docker-stack.ps1

# Or check manually
docker ps

# Should see:
# - mcp-writing-db (PostgreSQL)
# - mcp-connector (MCP servers)
```

### Step 4: Connect Typing Mind

1. **Open Typing Mind** in your browser (or place static files in `typing-mind-static/`)

2. **Go to Settings → Advanced Settings → Model Context Protocol**

3. **Add MCP Connector:**
   - URL: `http://localhost:50880`
   - Auth Token: (from your `.env` file)

4. **Click Connect** - You should now see all 9 MCP servers available!

## What's Running?

### Container 1: PostgreSQL Database
- **Container Name:** mcp-writing-db
- **Port:** 5432
- **Database:** mcp_writing_db
- **User:** writer
- **Purpose:** Stores all your writing data
- **Migrations:** 21 SQL migrations applied automatically on first run

### Container 2: MCP Connector
- **Container Name:** mcp-connector
- **Port:** 50880
- **Purpose:** Runs all MCP servers and exposes REST API
- **Servers:** 9 MCP servers for writing (book planning, character planning, etc.)
- **Auth:** Bearer token authentication
- **Health Check:** http://localhost:50880/health

## Available MCP Servers

1. **book-planning-server** - Plan and structure books
2. **chapter-planning-server** - Chapter organization
3. **charater-planning-server** - Character development
4. **core-continuity-server** - Series continuity management
5. **reporting-server** - Analytics and reports
6. **review-server** - Review and revision tools
7. **scene-server** - Scene management
8. **series-planning-server** - Multi-book series planning
9. **author-server** - Author information (optional)

## Common Commands

### Start/Stop
```bash
cd docker
docker-compose up -d      # Start in background
docker-compose down       # Stop containers
docker-compose restart    # Restart all
```

### View Logs
```bash
docker-compose logs -f                  # All containers
docker-compose logs -f mcp-connector   # MCP Connector only
docker-compose logs -f postgres        # Database only
```

### Database Operations
```bash
# Connect to database
docker exec -it mcp-writing-db psql -U writer -d mcp_writing_db

# Backup database
docker exec mcp-writing-db pg_dump -U writer mcp_writing_db > backup.sql

# Restore database
cat backup.sql | docker exec -i mcp-writing-db psql -U writer -d mcp_writing_db
```

### Rebuild Containers
```bash
cd docker
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### Docker not starting?
```powershell
# Check Docker Desktop is running
docker ps

# If not running, start Docker Desktop
# Windows: Start Docker Desktop from Start Menu
# Mac: Open Docker.app
# Linux: sudo systemctl start docker
```

### Containers not healthy?
```bash
# Check container status
docker ps

# View detailed logs
docker-compose logs mcp-connector
docker-compose logs postgres

# Restart services
docker-compose restart
```

### Can't connect to MCP Connector?
```bash
# Test health endpoint
curl http://localhost:50880/health

# Check if port is in use
netstat -an | findstr 50880  # Windows
lsof -i :50880               # Mac/Linux

# Verify auth token matches
cat .env | grep MCP_AUTH_TOKEN
```

### Database connection failed?
```bash
# Test database connection
docker exec mcp-writing-db psql -U writer -d mcp_writing_db -c "SELECT 1;"

# Check password is set correctly
cat .env | grep POSTGRES_PASSWORD
```

### Migrations not applied?
```bash
# Check migrations table
docker exec mcp-writing-db psql -U writer -d mcp_writing_db -c "SELECT * FROM migrations;"

# Manually run migrations
docker exec mcp-writing-db psql -U writer -d mcp_writing_db -f /migrations/001_create_core_schema.sql
```

## Advanced Configuration

### Custom Ports

Edit `.env` file:
```bash
POSTGRES_PORT=5433              # Change PostgreSQL port
MCP_CONNECTOR_PORT=50881        # Change MCP Connector port
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

### Performance Tuning

Edit `.env` file to adjust PostgreSQL performance:
```bash
POSTGRES_SHARED_BUFFERS=512MB           # Increase for more RAM
POSTGRES_EFFECTIVE_CACHE_SIZE=2GB       # Increase for better query planning
POSTGRES_MAINTENANCE_WORK_MEM=256MB     # Faster index operations
```

### Enable Typing Mind Web Server

1. Create `typing-mind-static/` directory
2. Place Typing Mind files inside
3. Uncomment `typing-mind-web` service in `docker-compose.yml`
4. Restart: `docker-compose up -d`
5. Access: http://localhost:3000

## File Structure

The MCP Connector container includes:
```
/app/
├── src/
│   ├── config-mcps/         # 8 phase-specific MCP servers
│   ├── mcps/                # Optional author-server
│   └── shared/              # Shared utilities
├── migrations/              # Database schema migrations
└── node_modules/            # Node.js dependencies
```

## Security Notes

1. **Change default passwords** in `.env` file
2. **Keep `.env` file secure** (never commit to git)
3. **Use strong auth tokens** (32+ random characters)
4. **Don't expose ports** to the internet (use localhost only)
5. **Regular backups** of PostgreSQL data

## Updating

### Update MCP Servers
```bash
cd docker
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Update PostgreSQL
```bash
# Backup first!
docker exec mcp-writing-db pg_dump -U writer mcp_writing_db > backup.sql

# Update image version in docker-compose.yml
# postgres:15 -> postgres:16

docker-compose down
docker-compose up -d
```

## Data Persistence

Your data is stored in Docker volumes:
```bash
# List volumes
docker volume ls | findstr mcp-writing

# Backup volume
docker run --rm -v mcp-writing-data:/data -v ${PWD}:/backup alpine tar czf /backup/data-backup.tar.gz /data

# Restore volume
docker run --rm -v mcp-writing-data:/data -v ${PWD}:/backup alpine tar xzf /backup/data-backup.tar.gz -C /
```

## Support

- **GitHub Issues:** Report bugs and request features
- **Documentation:** Full guides in `/docs` directory
- **Logs:** Always check logs first for error messages

## License

See main repository for license information.
