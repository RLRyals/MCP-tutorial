# MCP Tutorial - Distribution Package

Complete installation guide for the AI Writing Assistant MCP servers.

## 📦 What's Included

- `mcp-tutorial-image.tar` - Docker image with all 12 MCP servers (~250MB)
- `docker-compose.mcp.yml` - Docker Compose configuration
- `mcp-config.json` - MCP server configuration (for Claude Desktop and TypingMind)
- `init.sql` - Database initialization script (auto-runs on first start)
- `.env` - Environment variables (pre-configured)
- This README

## ✅ Prerequisites

**Required:**
- Docker Desktop 4.42 or later ([Download](https://www.docker.com/products/docker-desktop))
- At least one of:
  - Claude Desktop ([Download](https://claude.ai/download))
  - TypingMind account ([typingmind.com](https://typingmind.com))

**System Requirements:**
- 4GB RAM available
- 2GB disk space
- Windows 10/11, macOS 10.15+, or Linux

## 🚀 Installation Steps

### Step 1: Load the Docker Image

Open a terminal in the distribution folder and run:

```bash
docker load -i mcp-tutorial-image.tar
```

You should see:
```
Loaded image: mcp-tutorial:latest
```

### Step 2: Start the MCP Servers

```bash
docker compose -f docker-compose.mcp.yml up -d
```

This will:
- ✅ Create a PostgreSQL database with all tables
- ✅ Start 12 MCP servers (author, series, book, character, timeline, metadata, trope, plot, relationship, story-analysis, world, writing)
- ✅ Configure networking between all services

**Wait 10-15 seconds** for the database to initialize.

### Step 3: Verify Installation

Check that all containers are running:

```bash
docker ps
```

You should see 13 containers running:
- `mcp-tutorial-db` (database)
- `mcp-tutorial-author`
- `mcp-tutorial-series`
- `mcp-tutorial-book`
- ... (9 more MCP servers)

### Step 4: Configure Your AI Client

Choose **ONE** of the following options:

---

## Option A: Claude Desktop (Recommended)

### 1. Locate Claude Desktop Config File

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### 2. Update the Config File

Copy the **absolute path** to `mcp-config.json` in this distribution folder.

Then edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "author-manager": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-tutorial-author",
        "node",
        "src/mcps/author-server/index.js"
      ]
    },
    "series-manager": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-tutorial-series",
        "node",
        "src/mcps/series-server/index.js"
      ]
    },
    "book-manager": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-tutorial-book",
        "node",
        "src/mcps/book-server/index.js"
      ]
    },
    "character-manager": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-tutorial-character",
        "node",
        "src/mcps/character-server/index.js"
      ]
    },
    "timeline-manager": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-tutorial-timeline",
        "node",
        "src/mcps/timeline-server/index.js"
      ]
    },
    "metadata-manager": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-tutorial-metadata",
        "node",
        "src/mcps/metadata-server/index.js"
      ]
    },
    "trope-manager": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-tutorial-trope",
        "node",
        "src/mcps/trope-server/index.js"
      ]
    },
    "plot-manager": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-tutorial-plot",
        "node",
        "src/mcps/plot-server/index.js"
      ]
    },
    "relationship-manager": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-tutorial-relationship",
        "node",
        "src/mcps/relationship-server/index.js"
      ]
    },
    "story-analysis": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-tutorial-story-analysis",
        "node",
        "src/mcps/story-analysis-server/index.js"
      ]
    },
    "world-builder": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-tutorial-world",
        "node",
        "src/mcps/world-server/index.js"
      ]
    },
    "writing-manager": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "mcp-tutorial-writing",
        "node",
        "src/mcps/writing-server/index.js"
      ]
    }
  }
}
```

### 3. Restart Claude Desktop

Quit Claude Desktop completely and reopen it.

### 4. Test the Connection

In Claude Desktop, click the 🔌 (hammer/wrench) icon at the bottom. You should see all 12 MCP servers listed.

Try asking: **"Can you list all authors?"**

---

## Option B: TypingMind

### 1. Install the TypingMind MCP Connector

First, make sure you have Node.js installed ([Download](https://nodejs.org)).

Then install the connector globally:

```bash
npm install -g @typingmind/mcp
```

### 2. Get Your TypingMind Auth Token

1. Open TypingMind in your browser
2. Go to **Settings** → **Model Context Protocol**
3. Click **Setup Connector**
4. Copy your **Authentication Token**

### 3. Start the MCP Connector

In the distribution folder, run:

```bash
npx @typingmind/mcp YOUR_AUTH_TOKEN --config mcp-config.json
```

Replace `YOUR_AUTH_TOKEN` with your actual token.

You should see:
```
MCP Connector running on http://localhost:50880
✓ Loaded 12 MCP servers
```

**Keep this terminal running!**

### 4. Configure TypingMind

1. Go back to TypingMind → **Settings** → **Model Context Protocol**
2. Click **Edit Servers**
3. Replace the config with:

```json
{
  "mcpServers": {
    "mcp-tutorial": {
      "url": "http://localhost:50880"
    }
  }
}
```

4. Click **Save**
5. Click **Refresh** to connect

### 5. Test the Connection

In TypingMind, the MCP tools should now appear in the tools panel.

Try asking: **"Can you list all authors?"**

---

## 🛠️ Using Both Claude Desktop AND TypingMind

You can use both simultaneously! The same Docker containers work for both:

1. Follow **Option A** to configure Claude Desktop
2. Follow **Option B** to configure TypingMind
3. Both will use the same database and servers

---

## 📊 Available MCP Servers

| Server | Description | Example Tools |
|--------|-------------|---------------|
| **author-manager** | Manage authors | `create_author`, `list_authors`, `get_author` |
| **series-manager** | Manage series | `create_series`, `list_series`, `update_series` |
| **book-manager** | Manage books | `create_book`, `list_books`, `get_book_details` |
| **character-manager** | Character development | `create_character`, `track_character_arc` |
| **timeline-manager** | Story timeline | `create_timeline_event`, `get_timeline` |
| **metadata-manager** | Book metadata | `add_metadata`, `get_metadata` |
| **trope-manager** | Literary tropes | `add_trope`, `list_tropes` |
| **plot-manager** | Plot structures | `create_plot_thread`, `track_plot` |
| **relationship-manager** | Character relationships | `create_relationship`, `track_dynamics` |
| **story-analysis** | Story analysis | `analyze_pacing`, `identify_themes` |
| **world-builder** | World building | `create_location`, `define_magic_system` |
| **writing-manager** | Writing progress | `track_word_count`, `set_writing_goals` |

---

## 🧪 Testing Your Setup

### Test 1: List Authors
**Prompt:** "Can you list all authors?"

**Expected:** Empty list (new database)

### Test 2: Create an Author
**Prompt:** "Create an author named Jane Doe with email jane@example.com"

**Expected:** Confirmation that the author was created

### Test 3: Create a Series
**Prompt:** "Create a fantasy series called 'The Dragon Chronicles' by Jane Doe"

**Expected:** Confirmation with series details

### Test 4: List Authors Again
**Prompt:** "List all authors"

**Expected:** Jane Doe should now appear

---

## 🔧 Troubleshooting

### Docker Containers Not Starting

```bash
# Check Docker is running
docker info

# View logs
docker compose -f docker-compose.mcp.yml logs

# Restart services
docker compose -f docker-compose.mcp.yml restart
```

### Database Connection Errors

```bash
# Check database is healthy
docker exec mcp-tutorial-db pg_isready -U writer -d mcp_series

# View database logs
docker logs mcp-tutorial-db
```

### Claude Desktop Not Showing Servers

1. Make sure Docker containers are running
2. Check the config file path is correct
3. Restart Claude Desktop completely
4. Check Docker Desktop has permission to execute commands

### TypingMind Connection Fails

1. Ensure the connector is running (`npx @typingmind/mcp ...`)
2. Check port 50880 is not blocked by firewall
3. Verify your auth token is correct
4. Try using `http://127.0.0.1:50880` instead of `localhost`

### "Relation does not exist" Errors

The database didn't initialize properly. Reset it:

```bash
docker compose -f docker-compose.mcp.yml down -v
docker compose -f docker-compose.mcp.yml up -d
```

Wait 15 seconds, then try again.

---

## 🛑 Stopping the Servers

### Stop but keep data:
```bash
docker compose -f docker-compose.mcp.yml stop
```

### Stop and remove containers (keeps data):
```bash
docker compose -f docker-compose.mcp.yml down
```

### Remove everything including data:
```bash
docker compose -f docker-compose.mcp.yml down -v
```

---

## 🔄 Restarting After Reboot

After restarting your computer:

```bash
docker compose -f docker-compose.mcp.yml up -d
```

Your data will still be there!

---

## 📚 Additional Resources

- MCP Specification: https://modelcontextprotocol.io
- Claude Desktop Docs: https://claude.ai/docs
- TypingMind MCP Guide: https://github.com/TypingMind/typingmind-mcp
- Docker Compose Docs: https://docs.docker.com/compose/

---

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. View Docker logs: `docker compose -f docker-compose.mcp.yml logs`
3. Contact your instructor
4. Include error messages and what you tried

---

## 📝 Notes

- **Database Credentials:** Pre-configured in `.env` (user: `writer`, password: `your_secure_password2025`)
- **Database Name:** `mcp_series`
- **Network:** All containers communicate on `mcp-tutorial-network`
- **Persistence:** Data is stored in Docker volume `mcp-tutorial-db-data`

---

**Happy Writing! 📖✨**
