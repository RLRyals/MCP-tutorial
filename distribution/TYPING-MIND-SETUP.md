# Typing Mind Community Edition - Setup Guide

## 📥 Download Typing Mind Static Files First!

The Typing Mind static files are **NOT included** in the repository (due to size - 63MB). You need to download them first using the provided script.

**Source:** https://github.com/TypingMind/typingmind (Official self-hosted version)

## Quick Start (Just 4 Steps!)

### Step 1: Download Typing Mind Files

```bash
cd distribution

# Windows PowerShell:
.\download-typingmind.ps1

# Mac/Linux:
./download-typingmind.sh
```

This will automatically:
- Clone the official Typing Mind repository
- Copy static files to `typing-mind-static/` folder
- Report statistics (730 files, ~63MB)
- Clean up temporary files

### Step 1b: Verify Files Are Present

```bash
# Check if Typing Mind files exist
ls typing-mind-static/index.html
# Should show: typing-mind-static/index.html
```

✅ If you see the file, you're ready to go!

### Step 2: Generate Environment Configuration

```bash
cd distribution

# Generate .env file with secure random credentials
.\generate-env.ps1  # Windows
# Script creates .env with secure passwords
```

### Step 3: Start Docker

```bash
cd docker
docker-compose up -d

# Watch the logs
docker-compose logs -f
```

You should see **3 containers** starting:
- `mcp-writing-db` (PostgreSQL)
- `mcp-connector` (MCP Connector)
- `typing-mind-web` (Typing Mind) ⭐

### Step 4: Access Typing Mind

1. **Open your browser to:** http://localhost:3000

2. **First-time setup in Typing Mind:**
   - Enter your AI provider API keys (OpenAI, Anthropic, etc.)
   - Enter your Typing Mind license key (optional - trial available)

3. **Configure MCP Connector:**
   - Go to **Settings → Advanced Settings → Model Context Protocol**
   - Click **"Add MCP Connector"**
   - Enter:
     - **URL:** `http://localhost:50880`
     - **Auth Token:** (from `.env` file - look for `MCP_AUTH_TOKEN`)
   - Click **"Connect"**

4. **Start using your 9 MCP servers!** 🎉

---

## What's Included

The `typing-mind-static/` folder contains:

- **729 files** (~63MB)
- Self-hosted Typing Mind from official GitHub repository
- Pre-configured to work with the MCP Connector
- No additional downloads needed!

**License:** Proprietary - You may use and deploy the compiled code per Typing Mind's license terms.

---

## Re-downloading Files

If you need to update or re-download the Typing Mind files:

### Windows (PowerShell):
```powershell
cd distribution
.\download-typingmind.ps1 -Force
```

### Mac/Linux (Bash):
```bash
cd distribution
./download-typingmind.sh
# Answer 'y' when prompted to overwrite
```

These scripts will automatically:
- Clone the latest version from GitHub
- Replace existing files while preserving README.md
- Clean up temporary files

---

## Updating Typing Mind

To update to the latest version:

### Option 1: Use the Download Script
```bash
cd distribution
./download-typingmind.sh  # Mac/Linux
# or
.\download-typingmind.ps1  # Windows
```

### Option 2: Manual Update
```bash
cd /tmp
git clone https://github.com/TypingMind/typingmind.git
cp -r typingmind/src/* /path/to/distribution/typing-mind-static/
cd /path/to/distribution/docker
docker-compose restart typing-mind-web
```

---

## Configuration

### Environment Variables

You can customize these in your `.env` file:

```bash
# Typing Mind web server settings
TYPING_MIND_PORT=3000                      # Port to access Typing Mind
TYPING_MIND_DIR=./typing-mind-static       # Path to static files
TYPING_MIND_CONTAINER_NAME=typing-mind-web # Container name
```

### Getting Your Auth Token

Your MCP auth token is in the `.env` file:

```bash
# View your token
cat .env | grep MCP_AUTH_TOKEN

# Or on Windows PowerShell
Get-Content .env | Select-String "MCP_AUTH_TOKEN"
```

---

## Verifying Setup

### Check All Containers Are Running

```bash
docker ps

# Should show 3 containers:
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

---

## Troubleshooting

### "Cannot GET /" or blank page at localhost:3000

**Problem:** Typing Mind files aren't in the right place or are missing

**Solution:**
```bash
# Check if files exist
ls -la typing-mind-static/index.html

# If missing, run download script
./download-typingmind.sh  # Mac/Linux
# or
.\download-typingmind.ps1  # Windows
```

### "Connection Failed" in Typing Mind

**Problem:** MCP Connector isn't running or wrong auth token

**Solution:**
```bash
# Check if connector is healthy
docker ps

# Check connector logs
docker-compose logs mcp-connector

# Verify auth token matches
cat .env | grep MCP_AUTH_TOKEN

# Test health endpoint
curl http://localhost:50880/ping
```

### typing-mind-web Container Keeps Restarting

**Problem:** Missing index.html or nginx configuration issue

**Solution:**
```bash
# Check nginx logs
docker-compose logs typing-mind-web

# Verify folder structure
ls -la typing-mind-static/

# Verify index.html exists
ls typing-mind-static/index.html

# If files are corrupted, re-download
./download-typingmind.sh
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

### "License key required" Error

**Problem:** Typing Mind requires a license for full features

**Solution:**
- **Trial mode:** Typing Mind includes a trial period
- **Purchase license:** Visit https://www.typingmind.com/pricing
- **Community License:** One-time payment for self-hosted version
- You can still test MCPs in trial mode!

---

## License Information

### Typing Mind License

**Source:** https://github.com/TypingMind/typingmind

**License Type:** Proprietary
- ✅ You may use and deploy the compiled code
- ❌ You may not modify the code
- ❌ You may not redistribute the code

**Usage:** Requires a Typing Mind license key for full features. Trial mode available.

### Your MCP Servers

Your custom MCP servers in this repository are separate from Typing Mind and follow your own license terms.

---

## What's Pre-Configured

The docker setup includes:

✅ **Nginx configuration** - Optimized for Typing Mind SPA
✅ **Gzip compression** - Faster load times
✅ **Cache headers** - Better performance
✅ **Health checks** - Monitors container status
✅ **Auto-restart** - Restarts if crashes
✅ **MCP Connector dependency** - Waits for connector to be healthy
✅ **Static files included** - No download needed!

---

## Available MCP Servers

Once connected, you'll have access to:

1. **book-planning-server** - Plan and structure books
2. **chapter-planning-server** - Chapter organization
3. **character-planning-server** - Character development
4. **core-continuity-server** - Series continuity management
5. **reporting-server** - Analytics and reports
6. **review-server** - Review and revision tools
7. **scene-server** - Scene management
8. **series-planning-server** - Multi-book series planning
9. **author-server** - Author information

---

## Alternative: Browser-Based Access

If you prefer NOT to host locally, you can use Typing Mind in your browser:

1. Go to https://custom.typingmind.com (or your Typing Mind URL)
2. Configure MCP Connector:
   - URL: `http://localhost:50880`
   - Token: (from `.env`)
3. Use online without local hosting

**Note:** Local hosting gives you more control and privacy.

---

## Next Steps

Once Typing Mind is accessible:

1. ✅ Configure your AI provider API keys
2. ✅ Connect to MCP Connector
3. ✅ Test each MCP server tool
4. ✅ Create sample data (books, characters, scenes)
5. ✅ Verify database persistence
6. ✅ Ready for Electron app development!

---

**Need Help?**
- Check `README-distribution.md` for full Docker documentation
- Check `TYPING-MIND-ACCESS.md` for connection options
- Check `QUICK-START.md` for basic setup steps
- Visit: https://github.com/TypingMind/typingmind for Typing Mind documentation
