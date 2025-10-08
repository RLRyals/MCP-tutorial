# Typing Mind MCP Setup (Correct Method)

## Important: Typing Mind Uses MCP Connector

Typing Mind doesn't connect directly to MCP servers. Instead, it uses **TypingMind MCP Connector** as a bridge.

## Architecture

```
Typing Mind (Web/App)
    ↓ (with auth token)
TypingMind MCP Connector (Node.js)
    ↓ (stdio)
Your MCP Servers (Docker containers)
    ↓
Database
```

## Prerequisites

- Node.js (for TypingMind MCP Connector)
- Docker Desktop (for MCP servers + database)
- Typing Mind account

---

## Setup Steps

### 1. Get Your Typing Mind Auth Token

**From Typing Mind:**
1. Go to Typing Mind Settings → MCP Servers
2. Look for "Auth Token" or connection instructions
3. Copy the token (looks like: `tm_xxxxxxxxxxxxx`)

> **Note:** If you don't see MCP settings, you may need TypingMind Pro.

### 2. Install TypingMind MCP Connector

```bash
# Install globally
npm install -g @typingmind/mcp

# Or use npx (doesn't require install)
npx @typingmind/mcp@latest
```

### 3. Start MCP Tutorial Docker Services

**Windows:**
```powershell
cd path\to\distribution
docker load -i mcp-tutorial-image.tar
docker compose -f docker-compose.mcp.yml up -d
```

**Mac/Linux:**
```bash
cd path/to/distribution
docker load -i mcp-tutorial-image.tar
docker compose -f docker-compose.mcp.yml up -d
```

> **Note:** Use the **stdio** compose file (docker-compose.mcp.yml), NOT the HTTP one!

### 4. Use MCP Connector Config

The distribution includes `mcp-config.json` which tells the connector how to connect to your Docker containers.

**Config file location:** `mcp-config.json` (in the distribution folder)

**Sample content:**
```json
{
  "mcpServers": {
    "author-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-author", "node", "src/mcps/author-server/index.js"]
    },
    "series-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-series", "node", "src/mcps/series-server/index.js"]
    },
    "book-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-book", "node", "src/mcps/book-server/index.js"]
    },
    "character-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-character", "node", "src/mcps/character-server/index.js"]
    },
    "timeline-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-timeline", "node", "src/mcps/timeline-server/index.js"]
    },
    "metadata-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-metadata", "node", "src/mcps/metadata-server/index.js"]
    },
    "trope-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-trope", "node", "src/mcps/trope-server/index.js"]
    },
    "plot-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-plot", "node", "src/mcps/plot-server/index.js"]
    },
    "relationship-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-relationship", "node", "src/mcps/relationship-server/index.js"]
    },
    "story-analysis": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-story-analysis", "node", "src/mcps/story-analysis-server/index.js"]
    },
    "world-builder": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-world", "node", "src/mcps/world-server/index.js"]
    },
    "writing-manager": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-tutorial-writing", "node", "src/mcps/writing-server/index.js"]
    }
  }
}
```

### 5. Start TypingMind MCP Connector

**With Auth Token:**
```bash
# Option 1: Pass token directly
npx @typingmind/mcp YOUR_AUTH_TOKEN

# Option 2: Use environment variable
export MCP_AUTH_TOKEN=YOUR_AUTH_TOKEN
npx @typingmind/mcp

# Windows PowerShell
$env:MCP_AUTH_TOKEN="YOUR_AUTH_TOKEN"
npx @typingmind/mcp
```

**With Config File:**
```bash
npx @typingmind/mcp YOUR_AUTH_TOKEN --config mcp-config.json
```

The connector will start on `http://localhost:3000` (default).

### 6. Configure Typing Mind

1. Go to Typing Mind → Settings → MCP Servers
2. Enter the connector URL: `http://localhost:3000`
3. The auth token should already be configured

### 7. Test

In Typing Mind, ask:
```
"Can you list all authors?"
```

---

## Automated Setup Script

Let me create an automated script for this:

**`setup-typingmind-connector.ps1` (Windows):**
```powershell
# setup-typingmind-connector.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$AuthToken
)

Write-Host "Setting up TypingMind MCP Connector..." -ForegroundColor Cyan

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check Docker
if (-not (docker info 2>$null)) {
    Write-Host "ERROR: Docker not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Start Docker services
Write-Host "Starting MCP servers..." -ForegroundColor Yellow
docker compose -f docker-compose.mcp.yml up -d

Start-Sleep -Seconds 10

# Create config if doesn't exist
if (-not (Test-Path "typingmind-mcp-config.json")) {
    Write-Host "Creating MCP config..." -ForegroundColor Yellow

    # Generate config (same as above)
    $config = @{
        mcpServers = @{
            "author-manager" = @{
                command = "docker"
                args = @("exec", "-i", "mcp-tutorial-author", "node", "src/mcps/author-server/index.js")
            }
            # ... (rest of servers)
        }
    }

    $config | ConvertTo-Json -Depth 10 | Out-File "typingmind-mcp-config.json"
}

# Start connector
Write-Host "`nStarting TypingMind MCP Connector..." -ForegroundColor Yellow
Write-Host "Auth Token: $AuthToken" -ForegroundColor Gray
Write-Host "`nConnector URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop`n" -ForegroundColor Yellow

$env:MCP_AUTH_TOKEN = $AuthToken
npx @typingmind/mcp@latest --config typingmind-mcp-config.json
```

**`setup-typingmind-connector.sh` (Mac/Linux):**
```bash
#!/bin/bash
# setup-typingmind-connector.sh

if [ -z "$1" ]; then
    echo "Usage: ./setup-typingmind-connector.sh YOUR_AUTH_TOKEN"
    exit 1
fi

AUTH_TOKEN="$1"

echo "Setting up TypingMind MCP Connector..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Install from https://nodejs.org"
    exit 1
fi

# Check Docker
if ! docker info &> /dev/null; then
    echo "ERROR: Docker not running. Start Docker Desktop."
    exit 1
fi

# Start Docker services
echo "Starting MCP servers..."
docker compose -f docker-compose.mcp.yml up -d
sleep 10

# Start connector
echo ""
echo "Starting TypingMind MCP Connector..."
echo "Connector URL: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

export MCP_AUTH_TOKEN="$AUTH_TOKEN"
npx @typingmind/mcp@latest --config mcp-config.json
```

---

## Usage

**Windows:**
```powershell
.\setup-typingmind-connector.ps1 -AuthToken "tm_your_token_here"
```

**Mac/Linux:**
```bash
chmod +x setup-typingmind-connector.sh
./setup-typingmind-connector.sh tm_your_token_here
```

Then in Typing Mind:
1. Settings → MCP Servers
2. URL: `http://localhost:3000`
3. Test: "Can you list all authors?"

---

## Important Notes

1. **The connector must keep running** while you use Typing Mind
2. **Use stdio mode** (docker-compose.mcp.yml), not HTTP mode
3. **Auth token is required** - get it from Typing Mind settings
4. **Node.js is required** for the connector
5. **Different from Claude Desktop** - requires the connector bridge

---

## Comparison

| Client | Needs Connector? | Node.js Required? | Setup |
|--------|-----------------|-------------------|-------|
| **Claude Desktop** | No | No | Direct docker exec |
| **Typing Mind** | Yes | Yes | Via MCP Connector |

---

## Troubleshooting

### "Auth token invalid"
→ Get fresh token from Typing Mind settings

### "Cannot connect to Docker containers"
→ Ensure containers are running: `docker compose -f docker-compose.mcp.yml ps`

### "Connector won't start"
→ Check Node.js installed: `node --version`

### "Port 3000 already in use"
→ Stop other services or use: `npx @typingmind/mcp --port 3001`

---

## Summary

**Typing Mind Setup = 3 Components:**
1. ✅ Docker containers (MCP servers + database)
2. ✅ TypingMind MCP Connector (Node.js bridge)
3. ✅ Auth token (from Typing Mind)

All three must be running for it to work!
