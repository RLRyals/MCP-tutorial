# Electron App Deployment Strategy

This document outlines the recommended approach for deploying the MCP Writing System through your Electron installer.

## Architecture Overview

```
Electron App
├── Embedded Files
│   ├── docker-compose.yml
│   ├── .env.example
│   ├── nginx.conf
│   ├── init.sql
│   └── typing-mind-static/        ← Bundled with app
│       ├── index.html
│       ├── _next/
│       └── ... (730 files, ~63MB)
│
└── Docker Images (loaded on install)
    ├── postgres:15                 (~150MB)
    ├── mcp-writing-connector:latest (~200MB)
    └── nginx:alpine                (~10MB)
```

## Key Design Decisions

### ✅ DO: Bundle Typing Mind Files with Electron App

**Why:**
- Easy updates without rebuilding Docker images
- Users can update Typing Mind independently
- Simpler deployment
- Faster Docker startup (no image rebuild)

**How:**
1. Download Typing Mind files during your build process
2. Include `typing-mind-static/` folder in Electron app resources
3. On install, copy to user's data directory
4. Mount via Docker volume

### ✅ DO: Use Volume Mounts in Production

**docker-compose.yml:**
```yaml
typing-mind-web:
  image: nginx:alpine
  volumes:
    - /path/to/electron/app-data/typing-mind-static:/usr/share/nginx/html:ro
    - /path/to/electron/app-data/nginx.conf:/etc/nginx/nginx.conf:ro
```

### ❌ DON'T: Build Custom Docker Images for End Users

**Why Not:**
- Requires rebuilding for every Typing Mind update
- Larger distribution size
- Slower updates
- More complex update process

---

## Electron App Structure

### Installation Flow

```javascript
// 1. On first install
async function install() {
  const appDataPath = app.getPath('userData');
  const mcpPath = path.join(appDataPath, 'mcp-writing-system');

  // Extract bundled files
  await extractResource('typing-mind-static', path.join(mcpPath, 'typing-mind-static'));
  await extractResource('docker', path.join(mcpPath, 'docker'));

  // Generate .env with random passwords
  await generateEnvFile(path.join(mcpPath, '.env'));

  // Load Docker images (bundled or download)
  await loadDockerImages(path.join(mcpPath, 'docker-images.tar.gz'));

  // Start Docker containers
  await execAsync('docker-compose up -d', { cwd: path.join(mcpPath, 'docker') });
}
```

### Update Typing Mind Flow

```javascript
// In your Electron app menu: "Update Typing Mind"
async function updateTypingMind() {
  const mcpPath = path.join(app.getPath('userData'), 'mcp-writing-system');
  const tmpDir = path.join(app.getPath('temp'), 'typingmind-update');

  try {
    // Clone repository
    await execAsync(`git clone --depth 1 https://github.com/TypingMind/typingmind.git "${tmpDir}"`);

    // Check for src folder
    const srcPath = path.join(tmpDir, 'src');
    if (!fs.existsSync(srcPath)) {
      throw new Error('Repository structure has changed - src folder not found');
    }

    // Backup current files
    const backupPath = path.join(mcpPath, 'typing-mind-static-backup');
    if (fs.existsSync(path.join(mcpPath, 'typing-mind-static'))) {
      await fs.promises.rename(
        path.join(mcpPath, 'typing-mind-static'),
        backupPath
      );
    }

    // Copy new files
    await fs.promises.cp(srcPath, path.join(mcpPath, 'typing-mind-static'), { recursive: true });

    // Restart container
    await execAsync('docker-compose restart typing-mind-web', {
      cwd: path.join(mcpPath, 'docker')
    });

    // Cleanup
    await fs.promises.rm(tmpDir, { recursive: true, force: true });
    await fs.promises.rm(backupPath, { recursive: true, force: true });

    return { success: true, message: 'Typing Mind updated successfully!' };

  } catch (error) {
    // Restore backup if update failed
    if (fs.existsSync(backupPath)) {
      await fs.promises.rename(backupPath, path.join(mcpPath, 'typing-mind-static'));
    }
    throw error;
  }
}
```

### Check for Updates

```javascript
async function checkTypingMindVersion() {
  try {
    // Get current version from local files
    const mcpPath = path.join(app.getPath('userData'), 'mcp-writing-system');
    const localStats = await fs.promises.stat(
      path.join(mcpPath, 'typing-mind-static', 'index.html')
    );

    // Get remote version from GitHub
    const response = await fetch('https://api.github.com/repos/TypingMind/typingmind/commits/HEAD');
    const data = await response.json();

    return {
      currentDate: localStats.mtime,
      latestCommit: data.commit.author.date,
      updateAvailable: new Date(data.commit.author.date) > localStats.mtime
    };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return { error: error.message };
  }
}
```

---

## File Locations

### In Electron App Bundle

```
YourElectronApp.app/
├── Contents/
│   └── Resources/
│       └── mcp-resources/
│           ├── docker-compose.yml
│           ├── nginx.conf
│           ├── init.sql
│           ├── Dockerfile.mcp-connector
│           ├── docker-images.tar.gz         (~360MB compressed)
│           └── typing-mind-static/          (~63MB uncompressed)
│               ├── index.html
│               └── ...
```

### In User's System

**macOS:**
```
~/Library/Application Support/YourApp/mcp-writing-system/
├── .env
├── docker/
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── init.sql
└── typing-mind-static/
    └── ...
```

**Windows:**
```
C:\Users\<User>\AppData\Roaming\YourApp\mcp-writing-system\
├── .env
├── docker\
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── init.sql
└── typing-mind-static\
    └── ...
```

**Linux:**
```
~/.config/YourApp/mcp-writing-system/
├── .env
├── docker/
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── init.sql
└── typing-mind-static/
    └── ...
```

---

## Docker Compose Configuration

Update the volume paths to use the user's data directory:

```yaml
typing-mind-web:
  image: nginx:alpine
  container_name: typing-mind-web
  restart: unless-stopped
  ports:
    - "3000:80"
  volumes:
    # Mount from user's app data directory
    - ${TYPING_MIND_DIR}:/usr/share/nginx/html:ro
    - ${NGINX_CONF_PATH}:/etc/nginx/nginx.conf:ro
  networks:
    - mcp-network
```

### Environment Variables in .env

```bash
# Paths (set by Electron app)
TYPING_MIND_DIR=/Users/username/Library/Application Support/YourApp/mcp-writing-system/typing-mind-static
NGINX_CONF_PATH=/Users/username/Library/Application Support/YourApp/mcp-writing-system/docker/nginx.conf

# Ports
TYPING_MIND_PORT=3000
MCP_CONNECTOR_PORT=50880
POSTGRES_PORT=5432

# Credentials (generated on install)
POSTGRES_PASSWORD=randomly-generated
MCP_AUTH_TOKEN=randomly-generated
```

---

## Build Process for Electron App

### 1. Download Typing Mind Files (Build Time)

```bash
# In your Electron build script
cd distribution
./download-typingmind.sh

# Files are now in: distribution/typing-mind-static/
```

### 2. Export Docker Images (Build Time)

```bash
# Build MCP Connector image
cd distribution/docker
docker-compose build mcp-connector

# Export images for bundling
docker save mcp-writing-connector:latest postgres:15 nginx:alpine | \
  gzip > ../docker-images.tar.gz
```

### 3. Package with Electron

```javascript
// electron-builder.json
{
  "files": [
    "dist/**/*",
    "resources/**/*"
  ],
  "extraResources": [
    {
      "from": "distribution/typing-mind-static",
      "to": "mcp-resources/typing-mind-static"
    },
    {
      "from": "distribution/docker",
      "to": "mcp-resources/docker",
      "filter": ["**/*", "!typing-mind-static"]
    },
    {
      "from": "distribution/docker-images.tar.gz",
      "to": "mcp-resources/docker-images.tar.gz"
    }
  ]
}
```

---

## Installation Process

### Step 1: Check Prerequisites

```javascript
async function checkPrerequisites() {
  const checks = {
    docker: await checkDockerInstalled(),
    dockerRunning: await checkDockerRunning(),
    dockerCompose: await checkDockerComposeInstalled()
  };

  return checks;
}

async function checkDockerInstalled() {
  try {
    await execAsync('docker --version');
    return true;
  } catch {
    return false;
  }
}
```

### Step 2: Extract Resources

```javascript
async function extractResources() {
  const resourcePath = process.resourcesPath;
  const appDataPath = path.join(app.getPath('userData'), 'mcp-writing-system');

  // Create directory structure
  await fs.promises.mkdir(appDataPath, { recursive: true });
  await fs.promises.mkdir(path.join(appDataPath, 'docker'), { recursive: true });

  // Copy typing-mind-static
  await fs.promises.cp(
    path.join(resourcePath, 'mcp-resources', 'typing-mind-static'),
    path.join(appDataPath, 'typing-mind-static'),
    { recursive: true }
  );

  // Copy docker files
  await fs.promises.copyFile(
    path.join(resourcePath, 'mcp-resources', 'docker', 'docker-compose.yml'),
    path.join(appDataPath, 'docker', 'docker-compose.yml')
  );

  await fs.promises.copyFile(
    path.join(resourcePath, 'mcp-resources', 'docker', 'nginx.conf'),
    path.join(appDataPath, 'docker', 'nginx.conf')
  );

  await fs.promises.copyFile(
    path.join(resourcePath, 'mcp-resources', 'docker', 'init.sql'),
    path.join(appDataPath, 'docker', 'init.sql')
  );
}
```

### Step 3: Generate Configuration

```javascript
const crypto = require('crypto');

async function generateEnvFile(envPath) {
  const appDataPath = path.join(app.getPath('userData'), 'mcp-writing-system');

  const envContent = `# Generated by Electron Installer
# Database Configuration
POSTGRES_DB=mcp_writing_db
POSTGRES_USER=writer
POSTGRES_PASSWORD=${crypto.randomBytes(32).toString('hex')}
POSTGRES_PORT=5432
POSTGRES_CONTAINER_NAME=mcp-writing-db

# MCP Connector Configuration
MCP_CONNECTOR_PORT=50880
MCP_CONNECTOR_CONTAINER_NAME=mcp-connector
MCP_AUTH_TOKEN=${crypto.randomBytes(32).toString('hex')}

# Typing Mind Configuration
TYPING_MIND_PORT=3000
TYPING_MIND_CONTAINER_NAME=typing-mind-web
TYPING_MIND_DIR=${path.join(appDataPath, 'typing-mind-static')}
NGINX_CONF_PATH=${path.join(appDataPath, 'docker', 'nginx.conf')}

# Network Configuration
MCP_NETWORK_NAME=mcp-network
POSTGRES_VOLUME_NAME=mcp-writing-data
`;

  await fs.promises.writeFile(path.join(appDataPath, '.env'), envContent);
}
```

### Step 4: Load Docker Images

```javascript
async function loadDockerImages() {
  const resourcePath = process.resourcesPath;
  const imagePath = path.join(resourcePath, 'mcp-resources', 'docker-images.tar.gz');

  // Load images
  await execAsync(`docker load < "${imagePath}"`);
}
```

### Step 5: Start Services

```javascript
async function startServices() {
  const appDataPath = path.join(app.getPath('userData'), 'mcp-writing-system');
  const dockerPath = path.join(appDataPath, 'docker');

  // Start containers
  await execAsync('docker-compose up -d', {
    cwd: dockerPath,
    env: {
      ...process.env,
      ENV_FILE: path.join(appDataPath, '.env')
    }
  });

  // Wait for services to be healthy
  await waitForServices();
}

async function waitForServices(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const result = await execAsync('docker-compose ps --format json');
      const services = JSON.parse(result.stdout);

      const allHealthy = services.every(s =>
        s.Health === 'healthy' || s.State === 'running'
      );

      if (allHealthy) return true;
    } catch (error) {
      console.log(`Waiting for services... (${i + 1}/${maxAttempts})`);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Services failed to start within timeout period');
}
```

---

## UI Components for Electron App

### Main Menu

```javascript
const menu = Menu.buildFromTemplate([
  {
    label: 'MCP Writing System',
    submenu: [
      {
        label: 'Open Typing Mind',
        click: () => {
          shell.openExternal('http://localhost:3000');
        }
      },
      { type: 'separator' },
      {
        label: 'Check for Typing Mind Updates',
        click: async () => {
          const result = await checkTypingMindVersion();
          // Show dialog with results
        }
      },
      {
        label: 'Update Typing Mind',
        click: async () => {
          // Show progress dialog
          await updateTypingMind();
        }
      },
      { type: 'separator' },
      {
        label: 'View Logs',
        click: () => {
          // Open logs window
        }
      },
      {
        label: 'Restart Services',
        click: async () => {
          await restartServices();
        }
      }
    ]
  }
]);
```

### Update Dialog

```javascript
async function showUpdateDialog() {
  const result = await checkTypingMindVersion();

  if (result.updateAvailable) {
    const choice = await dialog.showMessageBox({
      type: 'info',
      title: 'Typing Mind Update Available',
      message: 'A new version of Typing Mind is available.',
      detail: `Current: ${result.currentDate}\nLatest: ${result.latestCommit}`,
      buttons: ['Update Now', 'Later'],
      defaultId: 0
    });

    if (choice.response === 0) {
      await updateTypingMind();
    }
  } else {
    await dialog.showMessageBox({
      type: 'info',
      title: 'No Updates',
      message: 'Typing Mind is up to date.'
    });
  }
}
```

---

## Distribution Size Estimates

### Electron App Bundle

| Component | Size | Compressed |
|-----------|------|------------|
| Electron App | ~150MB | ~50MB |
| Docker Images (tar.gz) | ~360MB | ~360MB |
| Typing Mind Files | ~63MB | ~20MB |
| **Total** | **~573MB** | **~430MB** |

### After Installation

| Component | Location | Size |
|-----------|----------|------|
| App Data | User directory | ~63MB |
| Docker Images | Docker storage | ~360MB |
| Docker Volumes | Docker storage | ~100MB (grows with data) |
| **Total** | | **~523MB** |

---

## Benefits of This Approach

✅ **Easy Updates**: Users can update Typing Mind with one click
✅ **No Docker Rebuilds**: Just replace files and restart container
✅ **Smaller App Size**: Don't need multiple image versions
✅ **Faster Updates**: Download ~63MB instead of rebuilding ~360MB image
✅ **User Control**: Users can update when they want
✅ **Rollback Support**: Easy to backup/restore files
✅ **Standard Docker**: Use standard nginx:alpine image

---

## Next Steps

1. **Implement Electron installer** using the code above
2. **Test update flow** with actual Typing Mind updates
3. **Add error handling** for failed updates with rollback
4. **Create update UI** with progress indicators
5. **Add auto-update check** on app startup (optional)

---

## Related Files

- [download-typingmind.ps1](download-typingmind.ps1) - Can be adapted for Electron
- [docker-compose.yml](docker/docker-compose.yml) - Already configured for volume mounts
- [TYPING-MIND-SETUP.md](TYPING-MIND-SETUP.md) - Development setup guide
