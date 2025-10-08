# MCP Tutorial - Student Quick Start

**Choose your path:**
- [Claude Desktop (Mac)](#claude-desktop-mac)
- [Claude Desktop (Windows)](#claude-desktop-windows)
- [Typing Mind (Any Platform)](#typing-mind)

---

## Claude Desktop (Mac)

### 1. Install Docker Desktop
- Download: https://www.docker.com/products/docker-desktop
- Install and start it

### 2. Run installer
```bash
cd path/to/distribution
chmod +x student-install.sh
./student-install.sh
```

### 3. Auto-configure Claude
```bash
chmod +x auto-configure-claude.sh
./auto-configure-claude.sh
```

### 4. Restart Claude Desktop
- Completely quit (Cmd+Q)
- Reopen

### 5. Test
Ask: "Can you list all authors?"

---

## Claude Desktop (Windows)

### 1. Install Docker Desktop
- Download: https://www.docker.com/products/docker-desktop
- Install and start it

### 2. Run installer
```powershell
cd path\to\distribution
.\student-install.ps1
```

### 3. Auto-configure Claude
```powershell
.\auto-configure-claude.ps1
```

### 4. Restart Claude Desktop
- Completely quit (not just close)
- Reopen

### 5. Test
Ask: "Can you list all authors?"

---

## Typing Mind

> **Note:** Typing Mind setup requires Node.js and an auth token. See [TYPING_MIND_CORRECT_SETUP.md](docs/TYPING_MIND_CORRECT_SETUP.md) for full details.

### Prerequisites

1. Install Node.js from https://nodejs.org
2. Get your Typing Mind auth token:
   - Typing Mind → Settings → MCP Servers → Auth Token

### Mac

```bash
cd path/to/distribution
chmod +x setup-typing-mind.sh
./setup-typing-mind.sh YOUR_AUTH_TOKEN
```

### Windows

```powershell
cd path\to\distribution
.\setup-typing-mind.ps1 -AuthToken YOUR_AUTH_TOKEN
```

### What the script does:

- ✅ Installs TypingMind MCP Connector
- ✅ Starts all MCP servers
- ✅ Shows connector command to run
- ✅ Copies connector command to clipboard

### Next steps:

1. **Start connector** (in new terminal):
   ```bash
   npx @typingmind/mcp YOUR_TOKEN --config mcp-config.json
   ```
   (Keep this terminal running!)

2. **Configure Typing Mind:**
   - Settings → MCP Servers
   - Add URL: `http://localhost:3000`

3. **Test:**
   Ask: "Can you list all authors?"

---

## Troubleshooting

### "Docker not running"
→ Start Docker Desktop and wait for green icon

### "Image not found"
→ Run: `docker load -i mcp-tutorial-image.tar`

### "No tools in Claude"
→ Completely quit and restart Claude Desktop

### "Can't connect in Typing Mind"
→ Make sure connector is running: `npx @typingmind/mcp YOUR_TOKEN --config mcp-config.json`
→ Check Docker: `docker compose -f docker-compose.mcp.yml ps`

---

## Daily Usage

### Start Services

**Claude Desktop:**
```bash
docker compose -f docker-compose.mcp.yml up -d
```

**Typing Mind:**
```bash
# Start Docker containers
docker compose -f docker-compose.mcp.yml up -d

# Start connector (in separate terminal, keep running)
npx @typingmind/mcp YOUR_TOKEN --config mcp-config.json
```

### Stop Services

**Claude Desktop:**
```bash
docker compose -f docker-compose.mcp.yml down
```

**Typing Mind:**
```bash
# Stop connector (Ctrl+C in its terminal)
# Then stop Docker
docker compose -f docker-compose.mcp.yml down
```

---

**That's it! Happy writing! 📚✨**
