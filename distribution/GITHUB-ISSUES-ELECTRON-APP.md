# GitHub Issues for MCP Electron App

Copy these issues to your new Electron app repository.

---

## Issue #1: Project Setup and Structure

**Title:** Initial Electron app project setup

**Labels:** `setup`, `infrastructure`

**Description:**

Set up the basic Electron app project structure for the MCP Writing System installer.

### Requirements

- [ ] Create new repository: `MCP-Electron-App`
- [ ] Initialize with Electron boilerplate
- [ ] Set up TypeScript (optional but recommended)
- [ ] Configure electron-builder for Windows/Mac/Linux builds
- [ ] Create basic directory structure:
  ```
  ├── main.js (or src/main/)
  ├── renderer/ (UI code)
  ├── resources/ (bundled files)
  ├── package.json
  └── README.md
  ```
- [ ] Add dependencies:
  - `electron`
  - `electron-builder`
  - Cross-platform utilities

### Reference

See: [ELECTRON-BUNDLE-CHECKLIST.md](https://github.com/RLRyals/MCP-Tutorial-New/blob/main/distribution/ELECTRON-BUNDLE-CHECKLIST.md)

---

## Issue #2: Prerequisites Detection System

**Title:** Implement cross-platform prerequisites detection

**Labels:** `feature`, `prerequisites`, `windows`, `mac`, `linux`

**Description:**

Implement system to detect and validate prerequisites on Windows, Mac, and Linux.

### Requirements

**Detection Functions:**
- [ ] `checkDockerInstalled()` - Detect Docker Desktop installation
- [ ] `checkDockerRunning()` - Check if Docker daemon is running
- [ ] `checkGit()` - Verify git is installed
- [ ] `checkWSL()` - Windows only: Check WSL2 status
- [ ] `getDockerVersion()` - Get installed Docker version

**Platform Support:**
- [ ] Windows (including WSL detection)
- [ ] macOS (Intel and Apple Silicon)
- [ ] Linux (Ubuntu, Debian, Fedora, Arch)

**Return Format:**
```javascript
{
  installed: boolean,
  running: boolean,
  version: string,
  error?: string
}
```

### Reference

See: [ELECTRON-APP-REQUIREMENTS.md](https://github.com/RLRyals/MCP-Tutorial-New/blob/main/distribution/ELECTRON-APP-REQUIREMENTS.md#1-docker-desktop-detection)

---

## Issue #3: Docker Desktop Installation Wizard

**Title:** Create guided Docker Desktop installation wizard

**Labels:** `feature`, `ui`, `onboarding`

**Description:**

Create step-by-step wizard to guide users through Docker Desktop installation.

### Requirements

**Windows Wizard:**
- [ ] Download link for Docker Desktop
- [ ] WSL setup instructions with copy-paste commands
- [ ] Admin privileges guidance
- [ ] Account creation help
- [ ] "Check Again" button

**Mac Wizard:**
- [ ] Download link for correct architecture (Intel/Apple Silicon)
- [ ] Installation steps with screenshots
- [ ] First-run setup guidance

**Linux Wizard:**
- [ ] Distribution-specific instructions
- [ ] docker group setup
- [ ] systemd service start

**UI Components:**
- [ ] Step-by-step progress indicator
- [ ] Copy-to-clipboard buttons for commands
- [ ] Screenshot/diagram support
- [ ] "Start Docker" button
- [ ] Real-time status checking

### Reference

See: [ELECTRON-APP-REQUIREMENTS.md](https://github.com/RLRyals/MCP-Tutorial-New/blob/main/distribution/ELECTRON-APP-REQUIREMENTS.md#docker-desktop-not-installed)

---

## Issue #4: Docker Startup Handler

**Title:** Implement Docker startup and health check system

**Labels:** `feature`, `docker`

**Description:**

Implement system to start Docker Desktop and wait for it to be ready.

### Requirements

- [ ] `startDockerDesktop()` - Start Docker Desktop programmatically
  - Windows: Execute Docker Desktop.exe
  - Mac: `open -a Docker`
  - Linux: `systemctl start docker`
- [ ] `waitForDockerReady()` - Poll docker daemon until ready
  - Max timeout: 60 seconds
  - Check interval: 2 seconds
  - Progress feedback to UI
- [ ] Show progress dialog with status updates
- [ ] Handle timeout gracefully with user-friendly message
- [ ] Retry mechanism

### Reference

See: [ELECTRON-APP-REQUIREMENTS.md](https://github.com/RLRyals/MCP-Tutorial-New/blob/main/distribution/ELECTRON-APP-REQUIREMENTS.md#docker-not-running)

---

## Issue #5: Environment Configuration UI

**Title:** Create environment variables configuration form

**Labels:** `feature`, `ui`, `configuration`

**Description:**

Create UI for users to review and modify environment configuration.

### Requirements

**Configuration Options:**
- [ ] Database settings (name, user, port)
- [ ] MCP Connector port
- [ ] Typing Mind port
- [ ] Auto-generated secure passwords (show/hide)
- [ ] Auto-generated auth tokens

**UI Features:**
- [ ] Form validation
- [ ] Password strength indicator
- [ ] "Regenerate" buttons for passwords/tokens
- [ ] "Use Defaults" option
- [ ] Port conflict detection
- [ ] Save configuration to `.env` file

**Default Values:**
```javascript
{
  POSTGRES_DB: 'mcp_writing_db',
  POSTGRES_USER: 'writer',
  POSTGRES_PASSWORD: '<generated>',
  POSTGRES_PORT: 5432,
  MCP_CONNECTOR_PORT: 50880,
  MCP_AUTH_TOKEN: '<generated>',
  TYPING_MIND_PORT: 3000
}
```

### Reference

See: [ELECTRON-APP-REQUIREMENTS.md](https://github.com/RLRyals/MCP-Tutorial-New/blob/main/distribution/ELECTRON-APP-REQUIREMENTS.md#environment-configuration-ui)

---

## Issue #6: Client Selection Interface

**Title:** Implement client selection and installation UI

**Labels:** `feature`, `ui`, `clients`

**Description:**

Create interface for users to choose which MCP clients to install.

### Requirements

**Client Options:**
- [ ] Typing Mind (web-based)
  - Description of features
  - Download size (~63MB)
  - Requires MCP Connector
- [ ] Claude Desktop (native)
  - Description of features
  - Configuration instructions
  - Manual setup required
- [ ] Both
- [ ] Configure Later

**Installation Flow:**
- [ ] Show client descriptions with screenshots
- [ ] Display download size and requirements
- [ ] Track installation progress
- [ ] Handle installation errors with retry
- [ ] Save client selection to metadata

**UI Design:**
- [ ] Card-based layout for each client
- [ ] Visual comparison table
- [ ] "Learn More" links
- [ ] Installation progress dialog

### Reference

See: [ARCHITECTURE.md](https://github.com/RLRyals/MCP-Tutorial-New/blob/main/distribution/ARCHITECTURE.md#client-options)

---

## Issue #7: Typing Mind Download Integration

**Title:** Integrate Typing Mind download script

**Labels:** `feature`, `typing-mind`, `download`

**Description:**

Integrate the Typing Mind download scripts into the Electron app.

### Requirements

**Script Execution:**
- [ ] Bundle `download-typingmind.ps1` and `.sh` in app resources
- [ ] Execute appropriate script based on platform
- [ ] Capture stdout/stderr for progress feedback
- [ ] Parse script output for UI updates
- [ ] Handle errors with user-friendly messages

**Progress Feedback:**
- [ ] Show download progress dialog
- [ ] Display status messages from script
- [ ] Show file count and size
- [ ] Cancel button (with cleanup)

**Error Handling:**
- [ ] Git not installed → Guide to install git
- [ ] Network failure → Retry option
- [ ] Repository structure changed → Fallback or error
- [ ] Insufficient disk space → Warning

**Post-Download:**
- [ ] Verify files downloaded correctly
- [ ] Update metadata with version/date
- [ ] Configure docker-compose with correct paths

### Scripts Location

- Windows: `resources/scripts/download-typingmind.ps1`
- Mac/Linux: `resources/scripts/download-typingmind.sh`

### Reference

- [download-typingmind.ps1](https://github.com/RLRyals/MCP-Tutorial-New/blob/main/distribution/download-typingmind.ps1)
- [download-typingmind.sh](https://github.com/RLRyals/MCP-Tutorial-New/blob/main/distribution/download-typingmind.sh)

---

## Issue #8: Docker Image Loading System

**Title:** Implement Docker image pre-loading

**Labels:** `feature`, `docker`, `performance`

**Description:**

Load pre-built Docker images to avoid building on user's machine.

### Requirements

**Image Preparation (Build Time):**
- [ ] Build MCP servers image during app packaging
- [ ] Export images to tar.gz:
  - `postgres-15.tar.gz` (~150MB)
  - `mcp-servers.tar.gz` (~200MB)
- [ ] Bundle in app resources

**Image Loading (Install Time):**
- [ ] Extract bundled images from app resources
- [ ] Load images using `docker load`
- [ ] Show progress dialog with:
  - Current image being loaded
  - Progress percentage
  - Estimated time remaining
- [ ] Verify images loaded successfully
- [ ] Handle errors (Docker not running, insufficient space)

**Optimization:**
- [ ] Stream decompression if possible
- [ ] Parallel loading of independent images
- [ ] Clean up temporary files

### Build Script

```bash
# Create during app build
docker-compose -f docker-compose.core.yml build
docker save postgres:15 | gzip > postgres-15.tar.gz
docker save mcp-writing-servers:latest | gzip > mcp-servers.tar.gz
```

### Reference

See: [ELECTRON-BUNDLE-CHECKLIST.md](https://github.com/RLRyals/MCP-Tutorial-New/blob/main/distribution/ELECTRON-BUNDLE-CHECKLIST.md#pre-built-docker-images-optional-but-recommended)

---

## Issue #9: Core System Startup

**Title:** Implement MCP core system startup and health checks

**Labels:** `feature`, `docker`, `startup`

**Description:**

Start Docker containers for core MCP system and wait for health checks.

### Requirements

**Startup Sequence:**
- [ ] Start core system: `docker-compose -f docker-compose.core.yml up -d`
- [ ] Optionally start MCP Connector: `docker-compose -f docker-compose.mcp-connector.yml up -d`
- [ ] Optionally start Typing Mind: `docker-compose -f docker-compose.typing-mind.yml up -d`
- [ ] Wait for all containers to be healthy

**Health Check Monitoring:**
- [ ] Poll `docker-compose ps` for service status
- [ ] Check health status for each service
- [ ] Timeout after 2 minutes
- [ ] Show progress in UI:
  - PostgreSQL starting...
  - MCP Servers starting...
  - Services ready!

**Error Handling:**
- [ ] Port conflicts → Suggest changing ports in .env
- [ ] Container failed to start → Show logs
- [ ] Timeout → Offer retry or view logs
- [ ] Network issues → Check Docker network

**Success:**
- [ ] Save startup timestamp to metadata
- [ ] Show "System Ready" message
- [ ] Display access URLs:
  - Typing Mind: http://localhost:3000
  - MCP Connector: http://localhost:50880

### Reference

See: [ELECTRON-BUNDLE-CHECKLIST.md](https://github.com/RLRyals/MCP-Tutorial-New/blob/main/distribution/ELECTRON-BUNDLE-CHECKLIST.md#6-start-core-system)

---

## Issue #10: Update Check System

**Title:** Implement update detection for MCP servers and clients

**Labels:** `feature`, `updates`

**Description:**

Check for updates to MCP servers and Typing Mind, prompt user to update.

### Requirements

**Update Detection:**
- [ ] Check MCP servers updates via GitHub API
  - Compare current commit SHA with latest
  - Show commit date and message
- [ ] Check Typing Mind updates via GitHub API
  - Compare installation date with latest commit
  - Only if Typing Mind is installed

**Update UI:**
- [ ] "Check for Updates" menu item
- [ ] Show update dialog with:
  - What updates are available
  - Version/date information
  - "Update Now" and "Later" buttons
- [ ] Progress dialog during update
- [ ] Success confirmation

**Update Execution:**
- [ ] For Typing Mind: Run `update-typingmind-for-electron.ps1/.sh`
- [ ] For MCP servers:
  - Pull latest code from GitHub
  - Rebuild Docker image
  - Restart containers
- [ ] Handle errors with rollback

**Auto-Check:**
- [ ] Check for updates on app startup (optional, user preference)
- [ ] Check interval: Once per day max
- [ ] Silent check, only notify if updates available

### Reference

See: [ELECTRON-APP-REQUIREMENTS.md](https://github.com/RLRyals/MCP-Tutorial-New/blob/main/distribution/ELECTRON-APP-REQUIREMENTS.md#update-check-system)

---

## Issue #11: Main Application Interface

**Title:** Create main application control interface

**Labels:** `feature`, `ui`, `main-window`

**Description:**

Create the main window users see after setup is complete.

### Requirements

**UI Components:**
- [ ] System status dashboard
  - Docker status (running/stopped)
  - Services status (healthy/unhealthy)
  - Database status
- [ ] Quick actions:
  - Open Typing Mind
  - Open Claude Desktop config
  - Start/Stop system
  - Restart services
- [ ] Menu bar:
  - Preferences
  - Check for Updates
  - Add/Remove Clients
  - View Logs
  - Help & Documentation

**System Status Indicators:**
- [ ] Green: All systems operational
- [ ] Yellow: Some services degraded
- [ ] Red: System offline or errors
- [ ] Real-time updates (poll every 5 seconds)

**Service Cards:**
- [ ] PostgreSQL (status, port, data size)
- [ ] MCP Servers (status, version)
- [ ] MCP Connector (status, port, auth token copy button)
- [ ] Typing Mind (status, port, "Open" button)

### Reference

See: [ELECTRON-APP-REQUIREMENTS.md](https://github.com/RLRyals/MCP-Tutorial-New/blob/main/distribution/ELECTRON-APP-REQUIREMENTS.md#main-app-flow)

---

## Issue #12: First-Run Setup Wizard

**Title:** Create comprehensive first-run setup wizard

**Labels:** `feature`, `ui`, `onboarding`

**Description:**

Create multi-step wizard for first-time setup that guides users through entire process.

### Requirements

**Wizard Steps:**
1. Welcome screen
2. Prerequisites check (Docker, Git, WSL)
3. Environment configuration
4. Docker image loading
5. Client selection
6. Installation progress
7. Setup complete

**Navigation:**
- [ ] Next/Previous buttons
- [ ] Progress indicator (step X of Y)
- [ ] "Cancel" with confirmation
- [ ] "Help" on each step

**Features:**
- [ ] Save progress (resume if app closes)
- [ ] Skip completed steps on resume
- [ ] Validation before proceeding
- [ ] Clear error messages
- [ ] "Start Over" option

**Completion:**
- [ ] Summary of what was installed
- [ ] Quick start guide
- [ ] Links to documentation
- [ ] "Launch System" button

### Reference

See: [ELECTRON-APP-REQUIREMENTS.md](https://github.com/RLRyals/MCP-Tutorial-New/blob/main/distribution/ELECTRON-APP-REQUIREMENTS.md#main-app-flow)

---

## Issue #13: Cross-Platform Build Pipeline

**Title:** Set up CI/CD for multi-platform builds

**Labels:** `infrastructure`, `ci-cd`, `build`

**Description:**

Create GitHub Actions workflow to build Electron app for Windows, Mac, and Linux.

### Requirements

**Build Targets:**
- [ ] Windows: NSIS installer (.exe)
- [ ] macOS: DMG (Intel and Apple Silicon)
- [ ] Linux: AppImage and .deb

**Build Process:**
- [ ] Clone MCP-Tutorial repo to get latest files
- [ ] Build Docker images
- [ ] Export Docker images to tar.gz
- [ ] Bundle everything with electron-builder
- [ ] Sign executables (Windows and Mac)
- [ ] Create checksums

**Artifacts:**
- [ ] Upload to GitHub Releases
- [ ] Include checksums
- [ ] Generate release notes from commits
- [ ] Tag with semantic versioning

**Workflow Triggers:**
- [ ] On git tag: `v*.*.*`
- [ ] Manual workflow dispatch for testing

### Example Workflow

```yaml
name: Build Electron App
on:
  push:
    tags:
      - 'v*'
jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
      - name: Install dependencies
      - name: Build Docker images
      - name: Build Electron app
      - name: Upload artifacts
```

---

## Issue #14: Logging and Diagnostics

**Title:** Implement comprehensive logging and diagnostic tools

**Labels:** `feature`, `diagnostics`, `debugging`

**Description:**

Add logging system to help debug issues users encounter.

### Requirements

**Logging:**
- [ ] Log file location: app data directory
- [ ] Log levels: debug, info, warn, error
- [ ] Rotate logs (max 10MB, keep 5 files)
- [ ] Log format: timestamp, level, message, context

**Log Categories:**
- [ ] Prerequisite checks
- [ ] Docker operations
- [ ] Script executions
- [ ] Network requests
- [ ] Error stack traces

**Diagnostic Tools:**
- [ ] "View Logs" in menu → opens log file
- [ ] "Export Diagnostic Report" → zip of:
  - App logs
  - Docker logs (`docker-compose logs`)
  - System info (OS, Docker version, etc.)
  - .env file (sanitized, no passwords)
- [ ] "Test System" → runs comprehensive checks

**Error Reporting:**
- [ ] User-friendly error dialogs
- [ ] "Copy Error Details" button
- [ ] Link to GitHub issues with pre-filled template

### Log Example

```
2025-01-06 12:00:00 [INFO] App started, version 1.0.0
2025-01-06 12:00:01 [INFO] Checking prerequisites...
2025-01-06 12:00:02 [INFO] Docker found: version 24.0.5
2025-01-06 12:00:02 [WARN] Docker not running
2025-01-06 12:00:03 [INFO] Starting Docker Desktop...
```

---

## Issue #15: Documentation and Help System

**Title:** Create user documentation and in-app help

**Labels:** `documentation`, `help`

**Description:**

Create comprehensive documentation for end users.

### Requirements

**User Guide:**
- [ ] Installation guide with screenshots
- [ ] Getting started tutorial
- [ ] Troubleshooting guide
- [ ] FAQ
- [ ] Video tutorial script

**In-App Help:**
- [ ] Help menu with links to docs
- [ ] Tooltips on UI elements
- [ ] "?" buttons for complex features
- [ ] Context-sensitive help

**Developer Docs:**
- [ ] Architecture overview
- [ ] Build instructions
- [ ] Contributing guide
- [ ] Release process

**Support:**
- [ ] GitHub Issues template
- [ ] Discord/community link (if applicable)
- [ ] Email support contact

---

These issues provide a complete roadmap for building the Electron app!
