# Electron App - Bundle Checklist

## What to Bundle in Your Electron App

Your Electron app should bundle these files from the MCP Writing System repository:

### Core Docker Files

```
app-resources/
├── docker/
│   ├── docker-compose.core.yml          # Core: DB + MCP Servers
│   ├── docker-compose.mcp-connector.yml # Client: HTTP bridge
│   ├── docker-compose.typing-mind.yml   # Client: Typing Mind
│   ├── Dockerfile.mcp-connector         # Build file for MCP servers
│   ├── nginx.conf                       # Nginx config for Typing Mind
│   └── init.sql                         # Database initialization
```

### Scripts (Cross-Platform)

```
app-resources/
├── scripts/
│   ├── download-typingmind.ps1          # Windows Typing Mind download
│   ├── download-typingmind.sh           # Mac/Linux Typing Mind download
│   ├── update-typingmind-for-electron.ps1  # Windows update
│   ├── update-typingmind-for-electron.sh   # Mac/Linux update
│   └── generate-env.ps1                 # Environment config generator
```

### Pre-built Docker Images (Optional but Recommended)

Instead of building on user's machine, pre-build and bundle:

```
app-resources/
├── docker-images/
│   ├── postgres-15.tar.gz              # ~150MB compressed
│   └── mcp-servers.tar.gz              # ~200MB compressed
```

**How to create these:**
```bash
# Build MCP servers image
cd distribution/docker
docker-compose -f docker-compose.core.yml build

# Save images
docker save postgres:15 | gzip > postgres-15.tar.gz
docker save mcp-writing-servers:latest | gzip > mcp-servers.tar.gz
```

**Load on user's machine:**
```javascript
// In your Electron app
await execAsync('docker load < postgres-15.tar.gz');
await execAsync('docker load < mcp-servers.tar.gz');
```

### Source Code (Optional)

If you want users to be able to update MCP servers:

```
app-resources/
├── src/                                 # Full MCP server source
│   ├── config-mcps/
│   ├── mcps/
│   ├── shared/
│   └── package.json
```

**Alternative:** Clone from GitHub on updates instead.

---

## What NOT to Bundle

### ❌ Don't Bundle These:

- `typing-mind-static/` - Users download this only if they choose Typing Mind client
- `.env` - Generated per-installation with unique passwords
- `node_modules/` - Built into Docker image
- `.git/` - Not needed
- Any temporary files or build artifacts

---

## Electron App Structure

### Recommended Directory Layout

```
YourElectronApp/
├── main.js                              # Electron main process
├── renderer/                            # UI code
│   ├── index.html
│   ├── setup-wizard.html
│   ├── client-selector.html
│   └── main-interface.html
├── resources/                           # Bundled resources
│   ├── docker/
│   ├── scripts/
│   └── docker-images/
└── package.json
```

### At Runtime (User's System)

**Windows:**
```
C:\Users\<User>\AppData\Roaming\YourApp\
├── mcp-writing-system/
│   ├── .env                             # Generated on install
│   ├── docker/
│   │   ├── docker-compose.core.yml
│   │   ├── docker-compose.mcp-connector.yml
│   │   ├── docker-compose.typing-mind.yml
│   │   ├── nginx.conf
│   │   └── init.sql
│   ├── typing-mind-static/              # Only if user chose this client
│   │   └── ...
│   └── .metadata.json                   # App-specific metadata
```

**macOS:**
```
~/Library/Application Support/YourApp/
├── mcp-writing-system/
│   ├── .env
│   ├── docker/
│   ├── typing-mind-static/              # Optional
│   └── .metadata.json
```

**Linux:**
```
~/.config/YourApp/
├── mcp-writing-system/
│   ├── .env
│   ├── docker/
│   ├── typing-mind-static/              # Optional
│   └── .metadata.json
```

---

## Installation Flow

### 1. First Launch

```javascript
async function firstLaunch() {
  // Create app data directory
  const appDataPath = getAppDataPath();
  await fs.promises.mkdir(path.join(appDataPath, 'mcp-writing-system'), { recursive: true });

  // Copy bundled resources to app data
  await copyBundledResources(appDataPath);

  // Generate .env file
  await generateEnvFile(appDataPath);

  // Load Docker images (if bundled)
  await loadDockerImages(appDataPath);

  // Show client selection
  const selectedClients = await showClientSelection();

  // Install selected clients
  await installClients(selectedClients, appDataPath);

  // Start core system
  await startCoreSystem(appDataPath);
}
```

### 2. Copy Bundled Resources

```javascript
async function copyBundledResources(appDataPath) {
  const resourcePath = process.resourcesPath; // Electron's resource path
  const mcpPath = path.join(appDataPath, 'mcp-writing-system');

  // Copy docker files
  await fs.promises.cp(
    path.join(resourcePath, 'docker'),
    path.join(mcpPath, 'docker'),
    { recursive: true }
  );

  // Copy scripts
  await fs.promises.cp(
    path.join(resourcePath, 'scripts'),
    path.join(mcpPath, 'scripts'),
    { recursive: true }
  );
}
```

### 3. Load Docker Images

```javascript
async function loadDockerImages(appDataPath) {
  const resourcePath = process.resourcesPath;
  const imagesPath = path.join(resourcePath, 'docker-images');

  // Show progress dialog
  const progress = new BrowserWindow({ /* ... */ });

  // Load PostgreSQL
  progress.webContents.send('status', 'Loading PostgreSQL image...');
  await execAsync(`docker load < "${path.join(imagesPath, 'postgres-15.tar.gz')}"`);

  // Load MCP Servers
  progress.webContents.send('status', 'Loading MCP Servers image...');
  await execAsync(`docker load < "${path.join(imagesPath, 'mcp-servers.tar.gz')}"`);

  progress.close();
}
```

### 4. Generate Environment Config

```javascript
const crypto = require('crypto');

async function generateEnvFile(appDataPath) {
  const mcpPath = path.join(appDataPath, 'mcp-writing-system');
  const envPath = path.join(mcpPath, '.env');

  const envContent = `# MCP Writing System Configuration
# Generated: ${new Date().toISOString()}

# Database
POSTGRES_DB=mcp_writing_db
POSTGRES_USER=writer
POSTGRES_PASSWORD=${crypto.randomBytes(32).toString('hex')}
POSTGRES_PORT=5432
POSTGRES_CONTAINER_NAME=mcp-writing-db

# MCP Connector
MCP_CONNECTOR_PORT=50880
MCP_CONNECTOR_CONTAINER_NAME=mcp-connector
MCP_AUTH_TOKEN=${crypto.randomBytes(32).toString('hex')}

# Typing Mind
TYPING_MIND_PORT=3000
TYPING_MIND_CONTAINER_NAME=typing-mind-web
TYPING_MIND_DIR=${path.join(mcpPath, 'typing-mind-static')}
NGINX_CONF_PATH=${path.join(mcpPath, 'docker', 'nginx.conf')}

# Network
MCP_NETWORK_NAME=mcp-network
POSTGRES_VOLUME_NAME=mcp-writing-data
`;

  await fs.promises.writeFile(envPath, envContent);
}
```

### 5. Install Typing Mind Client

```javascript
async function installTypingMindClient(appDataPath) {
  const mcpPath = path.join(appDataPath, 'mcp-writing-system');
  const scriptsPath = path.join(mcpPath, 'scripts');

  // Show progress window
  const progress = new BrowserWindow({
    width: 500,
    height: 200,
    title: 'Downloading Typing Mind...',
    modal: true
  });

  // Call download script
  const platform = process.platform;
  const scriptFile = platform === 'win32'
    ? 'download-typingmind.ps1'
    : 'download-typingmind.sh';

  const scriptPath = path.join(scriptsPath, scriptFile);

  let command;
  if (platform === 'win32') {
    command = `powershell.exe -ExecutionPolicy Bypass -File "${scriptPath}"`;
  } else {
    command = `bash "${scriptPath}"`;
  }

  // Run in mcp-writing-system directory
  const result = await execAsync(command, { cwd: mcpPath });

  progress.close();

  return result;
}
```

### 6. Start Core System

```javascript
async function startCoreSystem(appDataPath) {
  const dockerPath = path.join(appDataPath, 'mcp-writing-system', 'docker');

  // Start core (always)
  await execAsync('docker-compose -f docker-compose.core.yml up -d', {
    cwd: dockerPath
  });

  // Wait for health checks
  await waitForServicesHealthy(dockerPath);
}
```

---

## Subsequent Launches

```javascript
async function subsequentLaunch() {
  const appDataPath = getAppDataPath();

  // Check prerequisites
  const prereqs = await checkAllPrerequisites();

  if (!prereqs.ready) {
    // Guide user through fixing issues
    await handlePrerequisiteIssues(prereqs);
    return;
  }

  // Check if services are running
  const servicesRunning = await checkServicesRunning(appDataPath);

  if (!servicesRunning) {
    // Ask user if they want to start
    const dialog = await showDialog({
      type: 'question',
      title: 'Start MCP System?',
      message: 'The MCP Writing System is not currently running.',
      buttons: ['Start Now', 'Exit'],
      defaultId: 0
    });

    if (dialog.response === 0) {
      await startCoreSystem(appDataPath);
    } else {
      app.quit();
      return;
    }
  }

  // Check for updates
  const updates = await checkForUpdates();

  if (hasAvailableUpdates(updates)) {
    await showUpdateDialog(updates);
  }

  // Show main interface
  showMainInterface();
}
```

---

## Metadata File

Store installation metadata in `.metadata.json`:

```json
{
  "version": "1.0.0",
  "installedAt": "2025-01-06T12:00:00Z",
  "lastUpdated": "2025-01-06T12:00:00Z",
  "installedClients": ["typing-mind"],
  "mcpServersVersion": "abc123",
  "typingMindVersion": "2025-01-06T10:00:00Z",
  "dockerImagesLoaded": true
}
```

Use this to track what's installed and check for updates.

---

## Build Configuration

### electron-builder Configuration

```json
{
  "appId": "com.yourcompany.mcp-writing-system",
  "productName": "MCP Writing System",
  "files": [
    "dist/**/*",
    "main.js",
    "package.json"
  ],
  "extraResources": [
    {
      "from": "distribution/docker",
      "to": "docker"
    },
    {
      "from": "distribution/download-typingmind.ps1",
      "to": "scripts/download-typingmind.ps1"
    },
    {
      "from": "distribution/download-typingmind.sh",
      "to": "scripts/download-typingmind.sh"
    },
    {
      "from": "distribution/update-typingmind-for-electron.ps1",
      "to": "scripts/update-typingmind-for-electron.ps1"
    },
    {
      "from": "distribution/update-typingmind-for-electron.sh",
      "to": "scripts/update-typingmind-for-electron.sh"
    },
    {
      "from": "docker-images",
      "to": "docker-images"
    }
  ],
  "win": {
    "target": ["nsis"],
    "icon": "assets/icon.ico"
  },
  "mac": {
    "target": ["dmg"],
    "icon": "assets/icon.icns"
  },
  "linux": {
    "target": ["AppImage", "deb"],
    "icon": "assets/icon.png"
  }
}
```

---

## Size Estimates

### Bundled App Size

| Component | Size |
|-----------|------|
| Electron Runtime | ~150MB |
| Docker Images (compressed) | ~350MB |
| Docker Compose Files | <1MB |
| Scripts | <1MB |
| App Code | ~10MB |
| **Total** | **~511MB** |

### After Installation

| Component | Location | Size |
|-----------|----------|------|
| App Files | Program Files | ~161MB |
| Docker Images | Docker | ~360MB |
| MCP Data | App Data | ~1MB |
| Typing Mind (optional) | App Data | ~63MB |
| Database (grows) | Docker Volume | ~100MB+ |

---

This gives you a complete blueprint for bundling and deploying your Electron app!
