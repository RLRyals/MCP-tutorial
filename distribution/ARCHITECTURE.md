# MCP Writing System - Modular Architecture

## Overview

The MCP Writing System is designed as a **modular architecture** where the core database and MCP servers are separate from client applications.

```
┌─────────────────────────────────────────────────────────┐
│                    Core System                          │
│  ┌──────────────┐         ┌─────────────────────────┐  │
│  │  PostgreSQL  │◄────────┤    MCP Servers (9)      │  │
│  │   Database   │         │  - book-planning        │  │
│  └──────────────┘         │  - chapter-planning     │  │
│                           │  - character            │  │
│                           │  - series-planning      │  │
│                           │  - scene                │  │
│                           │  - timeline             │  │
│                           │  - world                │  │
│                           │  - relationship         │  │
│                           │  - reporting            │  │
│                           └─────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
                              │ stdio / HTTP
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Client Option 1 │  │ Client Option 2 │  │ Client Option 3 │
│                 │  │                 │  │                 │
│ MCP Connector   │  │ Claude Desktop  │  │    Obsidian     │
│      +          │  │    (native)     │  │   (plugin)      │
│ Typing Mind     │  │                 │  │                 │
│   (web-based)   │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Architecture Principles

### Core System (Required)
- **PostgreSQL Database**: Stores all writing data
- **MCP Servers**: 9 specialized servers for writing/planning
- **Always Running**: Core system runs in Docker
- **Client-Agnostic**: Works with any MCP-compatible client

### Client Layer (User Choice)
- **Optional**: Users choose which client(s) to install
- **Interchangeable**: Can use multiple clients simultaneously
- **Independent Updates**: Clients update without affecting core
- **No Bundling**: Clients are not included in core installation

## Docker Compose Files

### Core System: `docker-compose.core.yml`

**Always Required**

```yaml
services:
  postgres:        # Database
  mcp-servers:     # All 9 MCP servers
```

**Start Core:**
```bash
docker-compose -f docker-compose.core.yml up -d
```

### Client: MCP Connector (HTTP Bridge)

**File:** `docker-compose.mcp-connector.yml`

**Required For:** Web-based clients (Typing Mind, custom web apps)

```yaml
services:
  mcp-connector:   # HTTP API bridge
```

**Start MCP Connector:**
```bash
# Core must be running first
docker-compose -f docker-compose.core.yml -f docker-compose.mcp-connector.yml up -d
```

### Client: Typing Mind Web

**File:** `docker-compose.typing-mind.yml`

**Required For:** Typing Mind web interface

**Prerequisites:**
1. Core system running
2. MCP Connector running
3. Typing Mind files downloaded

```yaml
services:
  typing-mind-web: # nginx serving static files
```

**Start Typing Mind:**
```bash
# Download files first (NOT automatic)
./download-typingmind.sh

# Then start (requires core + connector)
docker-compose -f docker-compose.core.yml \
               -f docker-compose.mcp-connector.yml \
               -f docker-compose.typing-mind.yml up -d
```

## Client Options

### Option 1: Web-Based (MCP Connector + Typing Mind)

**Components:**
- Core System ✓
- MCP Connector ✓
- Typing Mind ✓

**Pros:**
- Beautiful web UI
- Cross-platform (browser)
- No desktop app needed

**Cons:**
- Requires downloading Typing Mind separately
- Needs 3 Docker containers
- License required for full features

**Setup:**
```bash
# 1. Start core
docker-compose -f docker-compose.core.yml up -d

# 2. Start MCP connector
docker-compose -f docker-compose.core.yml \
               -f docker-compose.mcp-connector.yml up -d

# 3. Download Typing Mind (user action)
./download-typingmind.sh

# 4. Start Typing Mind web server
docker-compose -f docker-compose.core.yml \
               -f docker-compose.mcp-connector.yml \
               -f docker-compose.typing-mind.yml up -d

# 5. Access at http://localhost:3000
```

### Option 2: Claude Desktop (Native)

**Components:**
- Core System ✓
- Claude Desktop App (external)

**Pros:**
- Native desktop app
- No additional servers needed
- Direct stdio connection
- Free to use

**Cons:**
- Requires Claude Desktop installation
- macOS/Windows only

**Setup:**
```bash
# 1. Start core only
docker-compose -f docker-compose.core.yml up -d

# 2. Install Claude Desktop (external)

# 3. Configure Claude Desktop to connect to MCP servers
# Edit: ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "book-planning": {
      "command": "docker",
      "args": ["exec", "mcp-servers", "node", "/app/src/config-mcps/book-planning-server/index.js"]
    }
    // ... other servers
  }
}
```

### Option 3: Obsidian (Plugin)

**Components:**
- Core System ✓
- MCP Connector ✓
- Obsidian + MCP Plugin (external)

**Pros:**
- Integration with note-taking
- Local files
- Plugin ecosystem

**Cons:**
- Requires Obsidian
- Plugin may need development

**Setup:**
```bash
# 1. Start core + connector
docker-compose -f docker-compose.core.yml \
               -f docker-compose.mcp-connector.yml up -d

# 2. Install Obsidian (external)

# 3. Install MCP plugin in Obsidian

# 4. Configure plugin to connect to http://localhost:50880
```

### Option 4: Custom Client

**Components:**
- Core System ✓
- MCP Connector (optional, for HTTP access)
- Your custom client

**Pros:**
- Complete control
- Tailored to your needs

**Cons:**
- Development effort

**Access Methods:**
1. **HTTP** (via MCP Connector): `http://localhost:50880`
2. **stdio** (direct): Execute MCP servers as child processes

## Electron App Architecture

### Core Installation

**What Your Electron App Installs:**

```
Electron App Resources:
├── docker-compose.core.yml
├── docker-compose.mcp-connector.yml
├── docker-compose.typing-mind.yml (template)
├── docker/
│   ├── Dockerfile.mcp-connector
│   ├── nginx.conf
│   └── init.sql
└── docker-images/
    ├── postgres-15.tar.gz
    └── mcp-servers.tar.gz
```

**NOT Included:**
- ❌ Typing Mind files (user downloads if they choose this client)
- ❌ Claude Desktop (external app)
- ❌ Obsidian (external app)

### Installation Flow

```javascript
async function installCore() {
  // 1. Extract docker-compose files
  await extractDockerComposeFiles();

  // 2. Generate .env
  await generateEnvFile();

  // 3. Load Docker images
  await loadDockerImage('postgres-15.tar.gz');
  await loadDockerImage('mcp-servers.tar.gz');

  // 4. Start core system
  await execAsync('docker-compose -f docker-compose.core.yml up -d');

  // 5. Show client selection UI
  await showClientSelector();
}
```

### Client Selection UI

```javascript
async function showClientSelector() {
  const choice = await dialog.showMessageBox({
    type: 'question',
    title: 'Choose Your Client',
    message: 'How would you like to access your MCP Writing System?',
    buttons: [
      'Web-Based (Typing Mind)',
      'Claude Desktop',
      'Both',
      'Skip for Now'
    ],
    defaultId: 0,
    detail: 'You can change this later or use multiple clients.'
  });

  switch (choice.response) {
    case 0: // Typing Mind
      await installTypingMindClient();
      break;
    case 1: // Claude Desktop
      await showClaudeDesktopInstructions();
      break;
    case 2: // Both
      await installTypingMindClient();
      await showClaudeDesktopInstructions();
      break;
    case 3: // Skip
      await showSkipMessage();
      break;
  }
}
```

### Client Installation: Typing Mind

```javascript
async function installTypingMindClient() {
  // 1. Ask user to confirm download
  const confirm = await dialog.showMessageBox({
    type: 'info',
    title: 'Download Typing Mind',
    message: 'Typing Mind files need to be downloaded (~63MB).',
    detail: 'This requires an internet connection and may take a few minutes.',
    buttons: ['Download Now', 'Cancel'],
    defaultId: 0
  });

  if (confirm.response !== 0) return;

  // 2. Show progress dialog
  const progressWindow = new BrowserWindow({ /* ... */ });

  // 3. Download Typing Mind
  const mcpPath = path.join(app.getPath('userData'), 'mcp-writing-system');
  const result = await downloadTypingMind(mcpPath);

  if (!result.success) {
    await dialog.showErrorBox('Download Failed', result.error);
    return;
  }

  // 4. Start MCP Connector + Typing Mind
  await execAsync('docker-compose -f docker-compose.core.yml \
                   -f docker-compose.mcp-connector.yml \
                   -f docker-compose.typing-mind.yml up -d');

  // 5. Show success
  await dialog.showMessageBox({
    type: 'info',
    title: 'Setup Complete',
    message: 'Typing Mind is ready!',
    detail: 'Access it at http://localhost:3000'
  });
}
```

### App Menu

```javascript
const menu = Menu.buildFromTemplate([
  {
    label: 'MCP Writing System',
    submenu: [
      {
        label: 'System Status',
        click: () => showSystemStatus()
      },
      { type: 'separator' },
      {
        label: 'Clients',
        submenu: [
          {
            label: 'Add/Remove Clients...',
            click: () => showClientSelector()
          },
          { type: 'separator' },
          {
            label: 'Open Typing Mind',
            click: () => shell.openExternal('http://localhost:3000'),
            enabled: isTypingMindInstalled
          },
          {
            label: 'Update Typing Mind',
            click: () => updateTypingMind(),
            enabled: isTypingMindInstalled
          },
          { type: 'separator' },
          {
            label: 'Claude Desktop Setup...',
            click: () => showClaudeDesktopInstructions()
          }
        ]
      },
      { type: 'separator' },
      {
        label: 'Restart Core System',
        click: () => restartCore()
      },
      {
        label: 'View Logs',
        click: () => showLogs()
      }
    ]
  }
]);
```

## File Structure

### Development

```
distribution/
├── docker/
│   ├── docker-compose.core.yml          # Core system
│   ├── docker-compose.mcp-connector.yml # MCP Connector client
│   ├── docker-compose.typing-mind.yml   # Typing Mind client
│   ├── docker-compose.yml               # All-in-one (convenience)
│   ├── Dockerfile.mcp-connector
│   ├── nginx.conf
│   └── init.sql
├── download-typingmind.ps1              # Optional download script
├── download-typingmind.sh               # Optional download script
└── typing-mind-static/                  # Only if user downloads
    └── ...
```

### Electron App Bundle

```
YourApp.app/
├── Contents/
│   └── Resources/
│       └── mcp-resources/
│           ├── docker-compose.core.yml
│           ├── docker-compose.mcp-connector.yml
│           ├── docker-compose.typing-mind.yml
│           ├── docker/
│           │   ├── Dockerfile.mcp-connector
│           │   ├── nginx.conf
│           │   └── init.sql
│           └── images/
│               ├── postgres-15.tar.gz       (~150MB)
│               └── mcp-servers.tar.gz      (~200MB)
```

**Size: ~350MB** (vs ~430MB with Typing Mind bundled)

### User's System

```
~/Library/Application Support/YourApp/mcp-writing-system/
├── .env
├── docker/
│   ├── docker-compose.core.yml
│   ├── docker-compose.mcp-connector.yml
│   ├── docker-compose.typing-mind.yml
│   ├── nginx.conf
│   └── init.sql
└── typing-mind-static/                  # Only if user chose Typing Mind
    └── ...
```

## Benefits

### For Users

✅ **Choice**: Pick the client that fits their workflow
✅ **Flexibility**: Use multiple clients simultaneously
✅ **Smaller Initial Download**: Core system only (~350MB vs ~430MB)
✅ **Easy Updates**: Update clients without touching core
✅ **Mix and Match**: Try different clients

### For Developers

✅ **Modular**: Easy to add new client options
✅ **Separation of Concerns**: Core vs client logic
✅ **Easier Maintenance**: Update clients independently
✅ **Client-Agnostic**: Core system doesn't know about clients
✅ **Future-Proof**: New clients don't require core changes

## Commands

### Start Core Only

```bash
docker-compose -f docker-compose.core.yml up -d
```

### Start Core + MCP Connector

```bash
docker-compose -f docker-compose.core.yml \
               -f docker-compose.mcp-connector.yml up -d
```

### Start Everything (Typing Mind)

```bash
docker-compose -f docker-compose.core.yml \
               -f docker-compose.mcp-connector.yml \
               -f docker-compose.typing-mind.yml up -d
```

### Convenience: All-in-One

```bash
# Still provided for backward compatibility
docker-compose up -d
```

## Migration from Monolithic

The original `docker-compose.yml` is kept for backward compatibility. It internally references the modular files:

```yaml
# docker-compose.yml (convenience wrapper)
include:
  - docker-compose.core.yml
  - docker-compose.mcp-connector.yml
  - docker-compose.typing-mind.yml
```

Users can continue using `docker-compose up -d` if they want everything.

---

**Next Steps:**
1. Implement client selector in Electron app
2. Make Typing Mind download optional
3. Add Claude Desktop configuration generator
4. Document client APIs
