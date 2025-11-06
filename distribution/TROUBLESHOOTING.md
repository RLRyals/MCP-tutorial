# MCP Writing System - Troubleshooting Guide

## Common Issues

### 1. MCP Connector Health Check Failing

**Symptom:**
```
dependency failed to start: container mcp-connector is unhealthy
ERROR: Failed to start Docker services
```

**Causes:**
- The MCP connector needs time to start up properly (45-60 seconds)
- It must wait for PostgreSQL to be healthy first
- The `/ping` endpoint takes time to become available

**Solutions:**

#### Check Container Status
```powershell
# Check if containers are running
docker ps -a

# Check health status
docker inspect --format='{{.State.Health.Status}}' mcp-connector
docker inspect --format='{{.State.Health.Status}}' mcp-writing-db
```

#### View Container Logs
```powershell
cd distribution/docker

# View MCP connector logs
docker-compose logs mcp-connector

# View PostgreSQL logs
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f
```

#### Manual Health Check
```powershell
# Test the ping endpoint directly
curl http://localhost:50880/ping

# Or using PowerShell
Invoke-WebRequest -Uri "http://localhost:50880/ping" -UseBasicParsing
```

#### Reset and Rebuild
If the issue persists, try a clean restart:

```powershell
cd distribution/docker

# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: This deletes database data)
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

### 2. Container is Running but Health Check Still Fails

**Symptom:**
- Docker logs show no errors
- Services appear to be running
- Health check still reports "unhealthy"

**Solutions:**

#### Verify Health Check Configuration
The health check settings in `docker-compose.yml` and `Dockerfile.mcp-connector`:
- `start_period: 45s` - Grace period before health checks start
- `interval: 10s` - Health check runs every 10 seconds
- `timeout: 5s` - Max time for health check to complete
- `retries: 5` - Number of failures before marking unhealthy

#### Check Port Conflicts
```powershell
# Windows - Check if port 50880 is in use
netstat -ano | findstr :50880

# Linux/Mac
lsof -i :50880
```

#### Verify Environment Variables
Check that `.env` file has all required variables:
```
POSTGRES_PASSWORD=your_secure_password
MCP_AUTH_TOKEN=your_secure_token
MCP_CONNECTOR_PORT=50880
```

### 3. Services Start but Ping Endpoint Returns 404

**Symptom:**
- Container is healthy
- But accessing `http://localhost:50880/ping` returns 404

**Solution:**
The Typing Mind MCP connector (`@typingmind/mcp`) must provide a `/ping` endpoint. Verify:

```powershell
# Check the connector version
docker exec mcp-connector npm list @typingmind/mcp

# Try accessing other endpoints
curl http://localhost:50880/
```

If the endpoint doesn't exist, the connector package may need updating or the health check may need to use a different endpoint.

### 4. PostgreSQL Fails to Start

**Symptom:**
```
PostgreSQL did not become healthy in time
```

**Solutions:**

#### Check Database Logs
```powershell
docker logs mcp-writing-db
```

#### Verify Password is Set
Check `.env` file has `POSTGRES_PASSWORD` set

#### Remove Corrupted Volume
```powershell
cd distribution/docker
docker-compose down -v
docker-compose up -d
```

## Getting Help

If you're still experiencing issues:

1. Run with verbose output:
   ```powershell
   .\setup-all.ps1 -Verbose
   ```

2. Collect diagnostic information:
   ```powershell
   docker ps -a
   docker logs mcp-connector
   docker logs mcp-writing-db
   docker inspect mcp-connector
   ```

3. Check the GitHub repository for known issues

## Recent Changes

### Health Check Fix
Fixed the root cause of health check failures when services were actually running:

**Problem:**
- Users saw "container mcp-connector is unhealthy" errors even when services were running
- Docker logs showed no errors, but health checks failed
- The health check command itself wasn't working properly

**Solution:**
1. **Replaced wget with curl** - More reliable HTTP client
   - Old: `wget --no-verbose --tries=1 --spider http://localhost:50880/ping`
   - New: `curl -f http://127.0.0.1:50880/ping`
   - The `-f` flag makes curl fail on HTTP errors (4xx/5xx)

2. **Changed localhost to 127.0.0.1** - Avoids DNS/hostname resolution issues
   - In some container configurations, `localhost` may not resolve correctly
   - `127.0.0.1` is direct and always works

3. **Removed strict health dependency** - Prevents cascade failures
   - `typing-mind-web` no longer requires `mcp-connector` to be "healthy" before starting
   - Services start independently, improving reliability

4. **Kept reasonable timing:**
   - `start_period`: 30s (grace period before checks begin)
   - `interval`: 10s (check every 10 seconds)
   - `retries`: 3 (standard retry count)
   - `timeout`: 5s (adequate for HTTP request)

The issue was NOT timing - it was that the health check command failed due to wget/localhost incompatibility.
