# Electron App - System Requirements & Checks

This document outlines what the Electron app needs to check and how to help users through the setup process.

## Prerequisites Detection

### 1. Docker Desktop Detection

**Windows:**
```javascript
const { exec } = require('child_process');
const os = require('os');

async function checkDockerWindows() {
  // Check if Docker Desktop is installed
  const dockerPath = 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe';

  if (!fs.existsSync(dockerPath)) {
    return {
      installed: false,
      running: false,
      error: 'Docker Desktop not found'
    };
  }

  // Check if Docker daemon is running
  try {
    await execAsync('docker version');
    return {
      installed: true,
      running: true,
      version: await getDockerVersion()
    };
  } catch (error) {
    return {
      installed: true,
      running: false,
      error: 'Docker Desktop is installed but not running'
    };
  }
}
```

**macOS:**
```javascript
async function checkDockerMac() {
  const dockerApp = '/Applications/Docker.app';

  if (!fs.existsSync(dockerApp)) {
    return {
      installed: false,
      running: false,
      error: 'Docker Desktop not found'
    };
  }

  // Check if running
  try {
    await execAsync('docker version');
    return {
      installed: true,
      running: true,
      version: await getDockerVersion()
    };
  } catch (error) {
    return {
      installed: true,
      running: false,
      error: 'Docker Desktop is installed but not running'
    };
  }
}
```

**Linux:**
```javascript
async function checkDockerLinux() {
  // Check if docker command exists
  try {
    await execAsync('which docker');
  } catch {
    return {
      installed: false,
      running: false,
      error: 'Docker not found'
    };
  }

  // Check if docker daemon is running
  try {
    await execAsync('docker version');
    return {
      installed: true,
      running: true,
      version: await getDockerVersion()
    };
  } catch (error) {
    return {
      installed: true,
      running: false,
      error: 'Docker is installed but not running'
    };
  }
}
```

### 2. Git Detection

**All Platforms:**
```javascript
async function checkGit() {
  try {
    const { stdout } = await execAsync('git --version');
    return {
      installed: true,
      version: stdout.trim()
    };
  } catch {
    return {
      installed: false,
      error: 'Git not found'
    };
  }
}
```

### 3. WSL Check (Windows Only)

```javascript
async function checkWSL() {
  if (process.platform !== 'win32') {
    return { required: false };
  }

  try {
    const { stdout } = await execAsync('wsl --status');
    return {
      installed: true,
      enabled: true,
      version: stdout
    };
  } catch (error) {
    return {
      installed: false,
      enabled: false,
      error: 'WSL not installed or not enabled'
    };
  }
}
```

## User Guidance UI

### Docker Desktop Not Installed

**Show Dialog:**
```javascript
{
  type: 'info',
  title: 'Docker Desktop Required',
  message: 'Docker Desktop is required to run the MCP Writing System.',
  detail: 'We\'ll guide you through the installation process.',
  buttons: ['Download Docker Desktop', 'I Already Have It', 'Cancel']
}
```

**If user clicks "Download Docker Desktop":**

```javascript
async function guideDockerInstallation() {
  const platform = process.platform;

  const instructions = {
    win32: {
      url: 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe',
      steps: [
        'Download Docker Desktop for Windows',
        'Run the installer (requires admin privileges)',
        'Enable WSL 2 when prompted',
        'Create a Docker Hub account (free)',
        'Sign in to Docker Desktop',
        'Wait for Docker to start (may take a few minutes)',
        'Return to this app and click "Check Again"'
      ],
      wslSteps: [
        'Open PowerShell as Administrator',
        'Run: wsl --install',
        'Restart your computer',
        'After restart, install Docker Desktop'
      ]
    },
    darwin: {
      url: 'https://desktop.docker.com/mac/main/amd64/Docker.dmg',
      steps: [
        'Download Docker Desktop for Mac',
        'Open the .dmg file',
        'Drag Docker to Applications folder',
        'Open Docker from Applications',
        'Create a Docker Hub account (free)',
        'Sign in to Docker Desktop',
        'Wait for Docker to start',
        'Return to this app and click "Check Again"'
      ]
    },
    linux: {
      url: 'https://docs.docker.com/engine/install/',
      steps: [
        'Visit Docker installation docs for your Linux distribution',
        'Follow the official installation guide',
        'Add your user to the docker group: sudo usermod -aG docker $USER',
        'Log out and back in',
        'Start Docker: sudo systemctl start docker',
        'Return to this app and click "Check Again"'
      ]
    }
  };

  const platformInstructions = instructions[platform];

  // Show step-by-step wizard
  const wizard = new BrowserWindow({
    width: 700,
    height: 600,
    title: 'Docker Desktop Installation Guide',
    modal: true
  });

  wizard.loadURL(`data:text/html,${createInstallationWizardHTML(platformInstructions)}`);
}
```

### WSL Setup (Windows Only)

```javascript
async function guideWSLSetup() {
  const dialog = await showDialog({
    type: 'info',
    title: 'WSL Setup Required',
    message: 'Docker Desktop requires WSL 2 on Windows.',
    detail: 'Would you like us to help set this up?',
    buttons: ['Yes, Help Me', 'I\'ll Do It Myself', 'Cancel']
  });

  if (dialog.response === 0) {
    // Show detailed WSL setup wizard
    const wizard = new BrowserWindow({
      width: 700,
      height: 500,
      title: 'WSL Setup Wizard',
      modal: true
    });

    const steps = [
      {
        title: 'Open PowerShell as Administrator',
        instruction: 'Right-click Start menu → PowerShell (Admin)',
        image: 'assets/powershell-admin.png'
      },
      {
        title: 'Run WSL Install Command',
        instruction: 'Copy and paste this command:',
        command: 'wsl --install',
        copyButton: true
      },
      {
        title: 'Restart Your Computer',
        instruction: 'After the command completes, restart Windows'
      },
      {
        title: 'Complete Setup',
        instruction: 'After restart, Windows will finish WSL setup automatically'
      },
      {
        title: 'Return Here',
        instruction: 'Once WSL is ready, return to this app and continue'
      }
    ];

    wizard.loadURL(`data:text/html,${createWSLWizardHTML(steps)}`);
  }
}
```

### Docker Not Running

```javascript
async function handleDockerNotRunning() {
  const dialog = await showDialog({
    type: 'warning',
    title: 'Docker Desktop Not Running',
    message: 'Docker Desktop is installed but not currently running.',
    detail: 'Would you like us to start it for you?',
    buttons: ['Start Docker Desktop', 'I\'ll Start It', 'Cancel']
  });

  if (dialog.response === 0) {
    await startDockerDesktop();

    // Show progress dialog
    const progress = new BrowserWindow({
      width: 400,
      height: 200,
      title: 'Starting Docker...',
      modal: true,
      frame: false
    });

    await waitForDockerReady(progress);
    progress.close();
  }
}

async function startDockerDesktop() {
  const platform = process.platform;

  if (platform === 'win32') {
    exec('start "" "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"');
  } else if (platform === 'darwin') {
    exec('open -a Docker');
  } else {
    exec('sudo systemctl start docker');
  }
}

async function waitForDockerReady(progressWindow, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await execAsync('docker version');
      return true;
    } catch {
      // Update progress
      progressWindow.webContents.send('progress', {
        message: `Waiting for Docker to start... (${i + 1}/${maxAttempts})`,
        percent: (i / maxAttempts) * 100
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  throw new Error('Docker failed to start within timeout');
}
```

## Git Installation Guide

```javascript
async function guideGitInstallation() {
  const platform = process.platform;

  const gitUrls = {
    win32: 'https://git-scm.com/download/win',
    darwin: 'https://git-scm.com/download/mac',
    linux: 'https://git-scm.com/download/linux'
  };

  const dialog = await showDialog({
    type: 'info',
    title: 'Git Required',
    message: 'Git is required to download Typing Mind files.',
    detail: 'Click "Download Git" to get the installer for your system.',
    buttons: ['Download Git', 'I Already Have It', 'Cancel']
  });

  if (dialog.response === 0) {
    shell.openExternal(gitUrls[platform]);

    // Show wait dialog
    await showDialog({
      type: 'info',
      title: 'Install Git',
      message: 'Please install Git and return to this app.',
      detail: 'Click "Check Again" when Git installation is complete.',
      buttons: ['Check Again']
    });

    // Re-check
    return await checkGit();
  }
}
```

## Complete Prerequisites Check Flow

```javascript
async function checkAllPrerequisites() {
  const results = {
    docker: null,
    git: null,
    wsl: null,
    ready: false
  };

  // 1. Check Docker
  results.docker = await checkDocker();

  if (!results.docker.installed) {
    await guideDockerInstallation();
    results.docker = await checkDocker();
  }

  if (results.docker.installed && !results.docker.running) {
    await handleDockerNotRunning();
    results.docker = await checkDocker();
  }

  // 2. Check WSL (Windows only)
  if (process.platform === 'win32') {
    results.wsl = await checkWSL();

    if (!results.wsl.installed) {
      await guideWSLSetup();
      results.wsl = await checkWSL();
    }
  }

  // 3. Check Git
  results.git = await checkGit();

  if (!results.git.installed) {
    await guideGitInstallation();
    results.git = await checkGit();
  }

  // All checks passed?
  results.ready =
    results.docker.installed &&
    results.docker.running &&
    results.git.installed &&
    (process.platform !== 'win32' || results.wsl.installed);

  return results;
}
```

## Main App Flow

```javascript
async function main() {
  // Show splash screen
  const splash = showSplashScreen();

  // Check prerequisites
  const prereqs = await checkAllPrerequisites();

  splash.close();

  if (!prereqs.ready) {
    showDialog({
      type: 'error',
      title: 'Setup Incomplete',
      message: 'Required software is not installed.',
      detail: 'Please complete the installation steps and try again.'
    });
    app.quit();
    return;
  }

  // Show main window
  const mainWindow = createMainWindow();

  // Check if first-time setup
  const isFirstRun = !hasExistingInstallation();

  if (isFirstRun) {
    showSetupWizard(mainWindow);
  } else {
    showMainInterface(mainWindow);
  }
}
```

## Environment Configuration UI

```javascript
function showEnvironmentConfig() {
  const config = loadOrGenerateConfig();

  const configWindow = new BrowserWindow({
    width: 600,
    height: 700,
    title: 'MCP System Configuration',
    modal: true
  });

  // Show form with environment variables
  const form = {
    database: {
      name: config.POSTGRES_DB || 'mcp_writing_db',
      user: config.POSTGRES_USER || 'writer',
      password: config.POSTGRES_PASSWORD || generatePassword(),
      port: config.POSTGRES_PORT || 5432
    },
    mcpConnector: {
      port: config.MCP_CONNECTOR_PORT || 50880,
      authToken: config.MCP_AUTH_TOKEN || generateToken()
    },
    typingMind: {
      port: config.TYPING_MIND_PORT || 3000
    }
  };

  // Render form in window
  configWindow.loadURL(`data:text/html,${createConfigFormHTML(form)}`);

  return new Promise((resolve) => {
    ipcMain.once('config-saved', (event, updatedConfig) => {
      saveConfig(updatedConfig);
      configWindow.close();
      resolve(updatedConfig);
    });
  });
}
```

## Client Selection UI

```javascript
async function showClientSelection() {
  const dialog = await showDialog({
    type: 'question',
    title: 'Choose Your Client',
    message: 'How would you like to access the MCP Writing System?',
    detail: 'You can add more clients later from the app menu.',
    buttons: [
      'Typing Mind (Web-based)',
      'Claude Desktop (Native)',
      'Both',
      'Configure Later'
    ],
    defaultId: 0,
    cancelId: 3
  });

  const choices = {
    0: ['typing-mind'],
    1: ['claude-desktop'],
    2: ['typing-mind', 'claude-desktop'],
    3: []
  };

  return choices[dialog.response] || [];
}

async function installSelectedClients(clients) {
  const progressWindow = new BrowserWindow({
    width: 500,
    height: 300,
    title: 'Installing Clients...',
    modal: true,
    frame: false
  });

  for (const client of clients) {
    if (client === 'typing-mind') {
      await installTypingMindClient(progressWindow);
    } else if (client === 'claude-desktop') {
      await showClaudeDesktopInstructions();
    }
  }

  progressWindow.close();
}
```

## Update Check System

```javascript
async function checkForUpdates() {
  const updates = {
    mcpServers: await checkMCPServersUpdate(),
    typingMind: await checkTypingMindUpdate(),
    clients: []
  };

  return updates;
}

async function checkMCPServersUpdate() {
  // Check GitHub repo for new commits
  try {
    const response = await fetch(
      'https://api.github.com/repos/YourRepo/MCP-Tutorial-New/commits/main'
    );
    const data = await response.json();

    const localCommit = getLocalCommit();

    return {
      available: data.sha !== localCommit,
      currentVersion: localCommit,
      latestVersion: data.sha,
      date: data.commit.author.date
    };
  } catch (error) {
    return { available: false, error: error.message };
  }
}

async function checkTypingMindUpdate() {
  if (!isTypingMindInstalled()) {
    return { available: false };
  }

  try {
    const response = await fetch(
      'https://api.github.com/repos/TypingMind/typingmind/commits/HEAD'
    );
    const data = await response.json();

    const localDate = getTypingMindInstallDate();
    const remoteDate = new Date(data.commit.author.date);

    return {
      available: remoteDate > localDate,
      installedDate: localDate,
      latestDate: remoteDate
    };
  } catch (error) {
    return { available: false, error: error.message };
  }
}

async function showUpdateDialog(updates) {
  const hasUpdates =
    updates.mcpServers.available ||
    updates.typingMind.available;

  if (!hasUpdates) {
    showDialog({
      type: 'info',
      title: 'No Updates Available',
      message: 'Your MCP Writing System is up to date!'
    });
    return;
  }

  const message = [];
  if (updates.mcpServers.available) {
    message.push('• MCP Servers update available');
  }
  if (updates.typingMind.available) {
    message.push('• Typing Mind update available');
  }

  const dialog = await showDialog({
    type: 'info',
    title: 'Updates Available',
    message: 'Updates are available for your system:',
    detail: message.join('\n'),
    buttons: ['Update Now', 'Later'],
    defaultId: 0
  });

  if (dialog.response === 0) {
    await performUpdates(updates);
  }
}
```

---

This provides a complete framework for handling prerequisites, installation, and updates across all platforms. Would you like me to expand on any particular section?
