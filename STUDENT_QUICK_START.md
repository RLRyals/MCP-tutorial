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

### Mac

```bash
cd path/to/distribution
chmod +x setup-typing-mind.sh
./setup-typing-mind.sh
```

The script will:
- ✅ Start all MCP servers
- ✅ Show you the 12 URLs
- ✅ Copy URLs to clipboard

Then in Typing Mind:
1. Settings → MCP Servers
2. Paste the 12 URLs

### Windows

```powershell
cd path\to\distribution
.\setup-typing-mind.ps1
```

The script will:
- ✅ Start all MCP servers
- ✅ Show you the 12 URLs
- ✅ Copy URLs to clipboard

Then in Typing Mind:
1. Settings → MCP Servers
2. Paste the 12 URLs

### URLs Reference

```
http://localhost:3501  (Author Manager)
http://localhost:3502  (Series Manager)
http://localhost:3503  (Book Manager)
http://localhost:3504  (Character Manager)
http://localhost:3505  (Timeline Manager)
http://localhost:3506  (Metadata Manager)
http://localhost:3507  (Trope Manager)
http://localhost:3508  (Plot Manager)
http://localhost:3509  (Relationship Manager)
http://localhost:3510  (Story Analysis)
http://localhost:3511  (World Builder)
http://localhost:3512  (Writing Manager)
```

---

## Troubleshooting

### "Docker not running"
→ Start Docker Desktop and wait for green icon

### "Image not found"
→ Run: `docker load -i mcp-tutorial-image.tar`

### "No tools in Claude"
→ Completely quit and restart Claude Desktop

### "Can't connect in Typing Mind"
→ Check: `docker compose -f docker-compose.typing-mind.yml ps`

---

## Daily Usage

### Start Services

**Claude Desktop:**
```bash
docker compose -f docker-compose.mcp.yml up -d
```

**Typing Mind:**
```bash
docker compose -f docker-compose.typing-mind.yml up -d
```

### Stop Services

```bash
docker compose -f docker-compose.mcp.yml down
# or
docker compose -f docker-compose.typing-mind.yml down
```

---

**That's it! Happy writing! 📚✨**
