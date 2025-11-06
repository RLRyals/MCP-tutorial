# Typing Mind Community Edition - Setup Guide

This guide helps you set up Typing Mind Community Edition to work with your MCP servers via the local web interface.

## Overview

Since you have the **Typing Mind Community License** (not Teams), you'll need to:
1. Download the Typing Mind static files
2. Place them in the `typing-mind-static` folder
3. Access Typing Mind at `http://localhost:3000`

The MCP Connector will already be pre-configured to connect!

## Step 1: Download Typing Mind Static Files

### Option A: If You Already Purchased Typing Mind

1. **Log into your Typing Mind account** at https://www.typingmind.com

2. **Download the static files:**
   - Go to your account/downloads page
   - Download the "Self-hosted" or "Static files" package
   - You should get a ZIP file with HTML/CSS/JS files

3. **Extract the files** to a temporary location

### Option B: If You Haven't Purchased Yet

1. **Visit:** https://www.typingmind.com/pricing

2. **Choose Community License:**
   - One-time payment (not subscription)
   - Includes self-hosted option
   - Download link provided after purchase

3. **After purchase, download the static files**

## Step 2: Set Up the Static Files

### Create Directory and Copy Files

```bash
# From the distribution folder
cd distribution

# Create the directory
mkdir typing-mind-static

# Extract your downloaded Typing Mind ZIP into this folder
# The folder should contain:
#   typing-mind-static/
#   ├── index.html
#   ├── assets/
#   │   ├── css/
#   │   ├── js/
#   │   └── images/
#   └── (other files)
```

### On Windows PowerShell:

```powershell
# Create directory
New-Item -ItemType Directory -Path "typing-mind-static" -Force

# Extract ZIP (replace path with your actual download)
Expand-Archive -Path "$env:USERPROFILE\Downloads\typingmind-static.zip" -DestinationPath ".\typing-mind-static"
```

### On Mac/Linux:

```bash
# Create directory
mkdir -p typing-mind-static

# Extract ZIP (replace path with your actual download)
unzip ~/Downloads/typingmind-static.zip -d typing-mind-static/
```

## Step 3: Verify File Structure

Your directory should look like this:

```
distribution/
├── docker/
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── ...
├── typing-mind-static/          ← NEW!
│   ├── index.html              ← Main entry point
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── ...
│   ├── favicon.ico
│   └── (other Typing Mind files)
├── .env
└── ...
```

**Important:** Make sure `index.html` is directly in the `typing-mind-static/` folder!

## Step 4: Start the Docker Stack

The docker-compose.yml is already configured with the Typing Mind web service enabled.

```bash
cd docker
docker-compose down
docker-compose up -d --build

# Watch the logs
docker-compose logs -f
```

You should see **3 containers** starting:
- `mcp-writing-db` (PostgreSQL database)
- `mcp-connector` (MCP Connector with all servers)
- `typing-mind-web` (Nginx serving Typing Mind)

## Step 5: Access Typing Mind

1. **Open your browser** to: http://localhost:3000

2. **Configure MCP Connection:**
   - Go to **Settings → Advanced Settings → Model Context Protocol**
   - Click **"Add MCP Connector"**
   - Enter:
     - **URL:** `http://localhost:50880`
     - **Auth Token:** (from `.env` file - look for `MCP_AUTH_TOKEN`)

3. **Click "Connect"**
   - All 9 MCP servers will become available!

4. **Start using your MCPs!**
   - Create a new chat
   - The MCP tools will be available in your prompts

## Step 6: Verify Everything Works

### Check All Containers Are Running

```bash
docker ps

# Should show:
# - mcp-writing-db
# - mcp-connector
# - typing-mind-web
```

### Test Each Service

```bash
# Test PostgreSQL
docker exec mcp-writing-db psql -U writer -d mcp_writing_db -c "SELECT 1;"

# Test MCP Connector
curl http://localhost:50880/ping
# Should return: {"status":"ok"}

# Test Typing Mind Web
curl http://localhost:3000
# Should return HTML content
```

## Troubleshooting

### "Cannot GET /" or blank page at localhost:3000

**Problem:** Typing Mind files aren't in the right place

**Solution:**
```bash
# Check if files exist
ls -la typing-mind-static/

# Make sure index.html is there
ls typing-mind-static/index.html

# If not, verify extraction path and try again
```

### "Connection Failed" in Typing Mind

**Problem:** MCP Connector isn't running or wrong auth token

**Solution:**
```bash
# Check if connector is healthy
docker ps

# Check connector logs
docker-compose logs mcp-connector

# Verify auth token
cat .env | grep MCP_AUTH_TOKEN

# Test health endpoint
curl http://localhost:50880/ping
```

### Port 3000 Already in Use

**Problem:** Another service is using port 3000

**Solution:**
```bash
# Edit .env file and add:
echo "TYPING_MIND_PORT=3001" >> .env

# Restart
cd docker
docker-compose down
docker-compose up -d

# Access at http://localhost:3001 instead
```

### Container Keeps Restarting

**Problem:** typing-mind-static folder is empty or missing index.html

**Solution:**
```bash
# Check nginx logs
docker-compose logs typing-mind-web

# Verify folder structure
ls -la typing-mind-static/

# If empty, re-extract the Typing Mind files
```

## What's Pre-Configured

The docker setup includes:

✅ **Nginx configuration** - Optimized for Typing Mind SPA
✅ **Gzip compression** - Faster load times
✅ **Cache headers** - Better performance
✅ **Health checks** - Monitors container status
✅ **Auto-restart** - Restarts if crashes
✅ **MCP Connector dependency** - Waits for connector to be healthy

## Environment Variables (Optional)

You can customize these in your `.env` file:

```bash
# Typing Mind web server settings
TYPING_MIND_PORT=3000                                    # Port to access Typing Mind
TYPING_MIND_DIR=./typing-mind-static                     # Path to static files
TYPING_MIND_CONTAINER_NAME=typing-mind-web               # Container name
```

## Updating Typing Mind

When a new version of Typing Mind is released:

```bash
# 1. Stop the web container
cd docker
docker-compose stop typing-mind-web

# 2. Backup current version (optional)
mv ../typing-mind-static ../typing-mind-static.backup

# 3. Extract new version
mkdir ../typing-mind-static
# (extract new files here)

# 4. Restart
docker-compose up -d typing-mind-web
```

## Alternative: Browser-Based Access

If you prefer NOT to host locally, you can still use Typing Mind in your browser:

1. Go to https://custom.typingmind.com (or your Typing Mind URL)
2. Configure MCP Connector:
   - URL: `http://localhost:50880`
   - Token: (from `.env`)
3. Use online without hosting locally

**Note:** The browser-based approach works with Community license too, but local hosting gives you more control.

## Next Steps

Once Typing Mind is accessible:

1. ✅ Test each MCP server tool
2. ✅ Create sample data (books, characters, scenes)
3. ✅ Verify database persistence
4. ✅ Ready for Electron app development!

---

**Need Help?**
- Check `README-distribution.md` for full Docker documentation
- Check `TYPING-MIND-ACCESS.md` for connection troubleshooting
- Check `QUICK-START.md` for basic setup steps
