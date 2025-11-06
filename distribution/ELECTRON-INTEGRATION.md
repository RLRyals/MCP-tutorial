# Electron App Integration Guide

This guide explains how to integrate the MCP Writing System distribution into an Electron desktop application.

## Overview

The Electron app will handle **all automation** - users only interact with a form to set environment variables. Everything else happens automatically.

## Cross-Platform Support

Scripts are provided for both Windows and Mac:

| Script | Windows | Mac/Linux |
|--------|---------|-----------|
| First-time setup | `setup-all.ps1` | `setup-all.sh` |
| Every-time run | `run.ps1` | `run.sh` |
| Download Typing Mind | `download-typingmind.ps1` | `download-typingmind.sh` |
| Test/diagnose | `test-docker-stack.ps1` | (use run.sh) |

## Exit Codes

All scripts use consistent exit codes for error handling:

| Exit Code | Meaning | Action |
|-----------|---------|--------|
| `0` | Success | Continue normally |
| `1` | General error | Show error message |
| `2` | Docker not installed | Show download link |
| `3` | Docker installed but can't start | Show manual start instructions |
| `4` | Docker started but didn't become ready | Retry or show error |
| `5` | Unsupported OS | Show unsupported OS message |

## Docker Handling

### Automatic Docker Detection and Start

The scripts automatically:
1. **Check if Docker is installed** - Exit code 2 if not
2. **Check if Docker is running** - Auto-start if not
3. **Wait for Docker to be ready** - Up to 60 seconds
4. **Exit with error** if Docker can't be started

### Docker Download Links

If Docker is not installed (exit code 2), show these links:

- **Windows**: https://www.docker.com/products/docker-desktop
- **Mac**: https://www.docker.com/products/docker-desktop
- **Linux**: Depends on distribution (Ubuntu/Debian/Fedora/Arch)

## Electron App Workflow

### 1. On First Launch

```javascript
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function firstTimeSetup() {
    const distributionPath = path.join(__dirname, 'distribution');
    const envPath = path.join(distributionPath, '.env');

    // Check if .env exists
    if (fs.existsSync(envPath)) {
        // Not first time
        return await startServices();
    }

    // Show setup wizard - collect environment variables from user
    const userConfig = await showSetupWizard();

    // Write user config to temp file for generate-env.ps1 to use
    // OR generate .env file directly in Node.js
    await generateEnvFile(userConfig);

    // Run complete setup
    const script = process.platform === 'win32'
        ? 'setup-all.ps1'
        : 'setup-all.sh';

    return await runScript(distributionPath, script);
}

async function runScript(cwd, scriptName, args = []) {
    return new Promise((resolve, reject) => {
        const isWindows = process.platform === 'win32';
        const command = isWindows ? 'powershell.exe' : 'bash';
        const scriptArgs = isWindows
            ? ['-ExecutionPolicy', 'Bypass', '-File', scriptName, ...args]
            : [scriptName, ...args];

        const child = spawn(command, scriptArgs, {
            cwd,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
            // Send to UI for progress display
            mainWindow.webContents.send('script-output', data.toString());
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
            mainWindow.webContents.send('script-error', data.toString());
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve({ code, stdout, stderr });
            } else {
                reject({ code, stdout, stderr });
            }
        });
    });
}
```

### 2. On Every Launch

```javascript
async function startServices() {
    const distributionPath = path.join(__dirname, 'distribution');
    const script = process.platform === 'win32'
        ? 'run.ps1'
        : 'run.sh';

    try {
        const result = await runScript(distributionPath, script);

        // Parse auth token from output
        const authToken = extractAuthToken(result.stdout);

        // Open Typing Mind
        openTypingMind(authToken);

        return { success: true, authToken };

    } catch (error) {
        // Handle exit codes
        switch (error.code) {
            case 2:
                // Docker not installed
                showDockerDownloadDialog();
                break;
            case 3:
            case 4:
                // Docker didn't start
                showDockerStartError();
                break;
            default:
                showGenericError(error.stderr);
        }

        return { success: false, error };
    }
}
```

### 3. Setup Wizard (Environment Variables)

The **only user interaction** is filling out this form:

```javascript
async function showSetupWizard() {
    return new Promise((resolve) => {
        // Create wizard window
        const wizard = new BrowserWindow({
            width: 600,
            height: 800,
            webPreferences: {
                nodeIntegration: true
            }
        });

        // Load wizard HTML
        wizard.loadFile('wizard.html');

        // Wizard collects:
        // - Database password (or generate random)
        // - MCP Auth Token (or generate random)
        // - Optional: OpenAI API key
        // - Optional: Anthropic API key
        // - Optional: Other AI provider keys

        ipcMain.once('wizard-complete', (event, config) => {
            wizard.close();
            resolve(config);
        });
    });
}

async function generateEnvFile(config) {
    const envPath = path.join(__dirname, 'distribution', '.env');

    // Generate random values if not provided
    const dbPassword = config.dbPassword || generateRandomString(32);
    const authToken = config.authToken || generateRandomString(48);

    const envContent = `
# MCP Writing System - Configuration
# Generated: ${new Date().toISOString()}

# PostgreSQL Database
POSTGRES_DB=mcp_writing_db
POSTGRES_USER=writer
POSTGRES_PASSWORD=${dbPassword}
POSTGRES_CONTAINER_NAME=mcp-writing-db
POSTGRES_PORT=5432

# Database URL
DATABASE_URL=postgresql://writer:${dbPassword}@localhost:5432/mcp_writing_db

# MCP Connector
MCP_AUTH_TOKEN=${authToken}
MCP_CONNECTOR_PORT=50880

# Typing Mind
TYPING_MIND_PORT=3000

# Optional: AI Provider Keys
${config.openaiKey ? `OPENAI_API_KEY=${config.openaiKey}` : ''}
${config.anthropicKey ? `ANTHROPIC_API_KEY=${config.anthropicKey}` : ''}
`.trim();

    await fs.promises.writeFile(envPath, envContent, 'utf8');
}
```

### 4. Opening Typing Mind

```javascript
function openTypingMind(authToken) {
    // Option 1: Open in default browser
    const { shell } = require('electron');
    shell.openExternal('http://localhost:3000');

    // Option 2: Embed in Electron window
    const typingMindWindow = new BrowserWindow({
        width: 1200,
        height: 800
    });
    typingMindWindow.loadURL('http://localhost:3000');

    // Store auth token for user
    typingMindWindow.webContents.on('did-finish-load', () => {
        // Could inject auth token or show it in UI
        typingMindWindow.webContents.send('mcp-auth-token', authToken);
    });
}
```

### 5. Update Checking

```javascript
async function checkForUpdates() {
    const distributionPath = path.join(__dirname, 'distribution');
    const script = process.platform === 'win32'
        ? 'download-typingmind.ps1'
        : 'download-typingmind.sh';

    try {
        await runScript(distributionPath, script, ['-Force']);

        // Restart typing-mind-web container
        const dockerScript = process.platform === 'win32'
            ? 'powershell.exe'
            : 'bash';
        const dockerCmd = 'docker-compose --env-file ../.env restart typing-mind-web';

        await runCommand(dockerScript, dockerCmd.split(' '), {
            cwd: path.join(distributionPath, 'docker')
        });

        return { success: true, message: 'Typing Mind updated' };
    } catch (error) {
        return { success: false, error };
    }
}

// Schedule update checks
setInterval(async () => {
    const result = await checkForUpdates();
    if (result.success) {
        showNotification('Typing Mind updated to latest version');
    }
}, 7 * 24 * 60 * 60 * 1000); // Weekly
```

### 6. Graceful Shutdown

```javascript
app.on('before-quit', async (event) => {
    event.preventDefault();

    // Stop Docker containers
    const distributionPath = path.join(__dirname, 'distribution');
    const dockerDir = path.join(distributionPath, 'docker');

    const command = 'docker-compose';
    const args = ['--env-file', '../.env', 'down'];

    try {
        await runCommand(command, args, { cwd: dockerDir });
    } catch (error) {
        console.error('Error stopping containers:', error);
    }

    app.exit(0);
});
```

## UI Components to Build

### 1. Setup Wizard
- Welcome screen
- Environment variable form
  - Database password (auto-generate option)
  - MCP Auth Token (auto-generate option)
  - AI API keys (optional)
- Progress screen (downloading Typing Mind, building Docker images)
- Completion screen

### 2. Main App Window
- Service status dashboard
  - PostgreSQL: Running/Stopped
  - MCP Connector: Running/Stopped
  - Typing Mind: Running/Stopped
- "Open Typing Mind" button
- "View Logs" button
- "Check for Updates" button
- Settings (edit .env)

### 3. System Tray
- Icon with status indicator
- Menu:
  - Open Typing Mind
  - Show/Hide Main Window
  - Check for Updates
  - Quit

## Error Handling

### Docker Not Installed (Exit Code 2)

```javascript
function showDockerDownloadDialog() {
    const { dialog, shell } = require('electron');

    const result = dialog.showMessageBoxSync({
        type: 'error',
        title: 'Docker Desktop Required',
        message: 'Docker Desktop is not installed',
        detail: 'MCP Writing System requires Docker Desktop to run. Would you like to download it now?',
        buttons: ['Download Docker', 'Cancel']
    });

    if (result === 0) {
        const downloadUrl = process.platform === 'darwin'
            ? 'https://desktop.docker.com/mac/main/amd64/Docker.dmg'
            : 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe';

        shell.openExternal(downloadUrl);
    }
}
```

### Docker Won't Start (Exit Code 3/4)

```javascript
function showDockerStartError() {
    const { dialog } = require('electron');

    dialog.showMessageBoxSync({
        type: 'warning',
        title: 'Docker Desktop Not Running',
        message: 'Could not start Docker Desktop automatically',
        detail: 'Please start Docker Desktop manually and try again.',
        buttons: ['OK']
    });
}
```

## File Structure in Electron App

```
electron-app/
├── main.js                    # Main process
├── preload.js                 # Preload script
├── renderer/                  # Renderer process
│   ├── wizard.html           # Setup wizard
│   ├── main.html             # Main app window
│   └── styles.css
├── distribution/             # Bundled distribution folder
│   ├── setup-all.ps1
│   ├── setup-all.sh
│   ├── run.ps1
│   ├── run.sh
│   ├── download-typingmind.ps1
│   ├── download-typingmind.sh
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile.mcp-connector
│   │   └── ...
│   ├── src/                  # MCP server code
│   ├── migrations/           # Database migrations
│   └── typing-mind-static/   # Downloaded on first run
└── package.json
```

## Distribution / Packaging

### Using electron-builder

```json
{
  "build": {
    "appId": "com.yourcompany.mcp-writing-system",
    "productName": "MCP Writing System",
    "files": [
      "main.js",
      "preload.js",
      "renderer/**/*",
      "distribution/**/*",
      "!distribution/typing-mind-static/**/*",
      "!distribution/.env",
      "!distribution/credentials-backup.txt"
    ],
    "directories": {
      "output": "dist"
    },
    "mac": {
      "target": "dmg",
      "category": "public.app-category.productivity"
    },
    "win": {
      "target": "nsis"
    }
  }
}
```

**Important:**
- Don't bundle typing-mind-static (downloaded on first run)
- Don't bundle .env (generated per user)
- Don't bundle credentials-backup.txt

## Security Considerations

1. **Never commit .env to version control** - Already in .gitignore
2. **Generate secure random passwords** - Use `crypto.randomBytes(32).toString('hex')`
3. **Store auth tokens securely** - Use electron-store with encryption
4. **Validate user input** - Sanitize environment variables
5. **Keep Docker images updated** - Check for updates regularly

## Performance Tips

1. **Cache Docker images** - Don't rebuild unless necessary
2. **Use Docker volume persistence** - Database survives restarts
3. **Stream script output** - Show progress to user
4. **Background update checks** - Don't block UI
5. **Lazy load Typing Mind** - Only download when needed

## Testing

### Test First-Time Setup
1. Delete `.env` and `typing-mind-static/`
2. Run Electron app
3. Should trigger setup wizard
4. Should download Typing Mind (~2-3 min)
5. Should build Docker images (~1-2 min)
6. Should start all services
7. Should open Typing Mind

### Test Subsequent Runs
1. With .env and services already set up
2. Run Electron app
3. Should start services quickly (~10-30 sec)
4. Should open Typing Mind

### Test Docker Auto-Start
1. Stop Docker Desktop
2. Run Electron app
3. Should automatically start Docker Desktop
4. Should wait for Docker to be ready
5. Should continue with setup

### Test Error Handling
1. Uninstall Docker Desktop
2. Run Electron app
3. Should show "Download Docker" dialog

## Support Matrix

| Platform | Supported | Notes |
|----------|-----------|-------|
| Windows 10/11 | ✅ | PowerShell 5.1+ required |
| macOS Intel | ✅ | Docker Desktop for Mac |
| macOS Apple Silicon | ✅ | Docker Desktop for Mac (ARM) |
| Linux (Ubuntu/Debian) | ⚠️ | Requires sudo for Docker |
| Linux (Other) | ⚠️ | May need manual Docker setup |

## Next Steps

1. Create Electron app project
2. Implement setup wizard UI
3. Integrate script execution
4. Add error handling
5. Test on Windows and Mac
6. Package and distribute

## Resources

- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [electron-builder](https://www.electron.build/)
- [Docker Desktop Documentation](https://docs.docker.com/desktop/)
- [TypingMind Documentation](https://docs.typingmind.com/)
