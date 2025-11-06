# MCP Writing System - Distribution Package

Complete standalone Docker-based setup for the MCP Writing System with Typing Mind integration.

## 🎯 For Electron App Integration

This distribution is designed to be **completely automated** and run by an Electron desktop application. Users **never run scripts manually** - the Electron app handles everything.

**See `ELECTRON-INTEGRATION.md` for complete integration guide.**

### First-Time Setup (Run Once)

```powershell
cd distribution
.\setup-all.ps1
```

**What this does:**
1. Downloads Typing Mind static files from GitHub (730 files, ~63MB)
2. Generates secure `.env` configuration with random passwords (persists between runs)
3. Builds Docker images
4. Starts Docker containers (PostgreSQL, MCP Connector, Typing Mind)
5. Waits for services to be healthy
6. Runs health checks
7. Displays connection information

**Total time:** ~2-3 minutes on first run

### Every Time the App Runs

```powershell
cd distribution
.\run.ps1
```

**What this does:**
1. Checks if Docker is running
2. Uses existing `.env` file (does NOT regenerate)
3. Starts Docker containers (if not already running)
4. Waits for services to be healthy
5. Returns connection info for the app

**Total time:** ~10-30 seconds

### Available Scripts (Called by Electron App)

| Script | Platform | Purpose | Exit Codes |
|--------|----------|---------|------------|
| `setup-all.ps1` | Windows | First-time setup | 0=success, 2=no Docker, 3=Docker won't start |
| `setup-all.sh` | Mac/Linux | First-time setup | 0=success, 2=no Docker, 3/4=Docker won't start |
| `run.ps1` | Windows | Every launch | 0=success, 2=no Docker, 3=Docker won't start |
| `run.sh` | Mac/Linux | Every launch | 0=success, 2=no Docker, 3/4=Docker won't start |
| `download-typingmind.ps1` | Windows | Update Typing Mind | 0=success, 1=error |
| `download-typingmind.sh` | Mac/Linux | Update Typing Mind | 0=success, 1=error |
| `test-docker-stack.ps1` | Windows | Diagnostics | 0=success, 1=error |

**Exit Code Handling:**
- `0`: Success - Continue normally
- `1`: General error - Show error message
- `2`: Docker not installed - Show download link
- `3` or `4`: Docker won't start - Show manual start message

---

## 🐳 What Gets Installed

### Container 1: PostgreSQL Database
- **Name:** `mcp-writing-db`
- **Port:** 5432
- **Database:** `mcp_writing_db`
- **User:** `writer`
- **Migrations:** 21 SQL migrations applied automatically

### Container 2: MCP Connector
- **Name:** `mcp-connector`
- **Port:** 50880
- **Servers:** 9 MCP writing servers
- **Auth:** Bearer token (auto-generated)

### Container 3: Typing Mind Web Server
- **Name:** `typing-mind-web`
- **Port:** 3000
- **Source:** Official TypingMind static files
- **Nginx:** Optimized configuration included

---

## 📦 Available MCP Servers

Once setup is complete, you'll have access to:

1. **author-server** - Author information management
2. **book-planning-server** - Plan and structure books
3. **chapter-planning-server** - Chapter organization
4. **character-planning-server** - Character development
5. **core-continuity-server** - Series continuity management
6. **reporting-server** - Analytics and reports
7. **review-server** - Review and revision tools
8. **scene-server** - Scene management
9. **series-planning-server** - Multi-book series planning

---

## 🔌 Connecting Typing Mind

After setup completes:

1. **Open:** http://localhost:3000
2. **Go to:** Settings → Advanced → Model Context Protocol
3. **Add MCP Connector:**
   - URL: `http://localhost:50880`
   - Auth Token: (shown in setup output, or check `.env`)
4. **Click Connect**

Your MCP auth token is in `.env`:
```powershell
# View token
Get-Content .env | Select-String "MCP_AUTH_TOKEN"
```

---

## 🛠️ Automation Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup-all.ps1` | First-time setup | `.\setup-all.ps1` |
| `run.ps1` | Start services (every time) | `.\run.ps1` |
| `test-docker-stack.ps1` | Verify/diagnose | `.\test-docker-stack.ps1 -Verbose` |
| `download-typingmind.ps1` | Update Typing Mind | `.\download-typingmind.ps1 -Force` |

### View Logs
```powershell
cd docker
docker-compose --env-file ../.env logs -f mcp-connector
```

### Stop Services
```powershell
cd docker
docker-compose --env-file ../.env down
```

---

## 🔍 Troubleshooting

All troubleshooting starts with the diagnostic script:

```powershell
.\test-docker-stack.ps1 -Verbose
```

This will automatically check:
- Docker is running
- .env file exists
- All containers are healthy
- Database is accessible
- MCP Connector is responding

### If Issues Found

**Docker Not Running:**
- Start Docker Desktop and run `.\run.ps1` again

**Services Not Healthy:**
```powershell
# View logs
cd docker
docker-compose --env-file ../.env logs mcp-connector

# Restart services
docker-compose --env-file ../.env restart
```

**First-Time Setup Failed:**
```powershell
# Re-run complete setup
.\setup-all.ps1 -Force
```

---

## 📚 Documentation Files

- **README.md** - This file (quick reference)
- **QUICK-START.md** - Concise setup instructions
- **README-distribution.md** - Comprehensive documentation
- **TYPING-MIND-SETUP.md** - Typing Mind specific setup
- **TYPING-MIND-ACCESS.md** - Connection options
- **SETUP-COMPLETE.md** - Post-setup checklist

---

## 🔐 Security Notes

1. ✅ `.env` contains auto-generated secure passwords
2. ✅ Auth token is 48+ random characters
3. ⚠️ **Never commit `.env` to git** (already in .gitignore)
4. ⚠️ **Delete `credentials-backup.txt`** after saving elsewhere
5. ⚠️ **Don't expose ports** to the internet (use localhost only)

---

## 🔄 Updating

Your Electron app should check for updates on startup. Use these scripts:

### Check for Typing Mind Updates
```powershell
.\download-typingmind.ps1 -Force
cd docker
docker-compose --env-file ../.env restart typing-mind-web
```

### Update MCP Connector (when new version released)
```powershell
.\setup-all.ps1 -Force
```

---

## 🎯 Next Steps

After setup is complete:

1. ✅ Open Typing Mind at http://localhost:3000
2. ✅ Add your AI provider API keys
3. ✅ Configure MCP Connector connection
4. ✅ Test all 9 MCP servers
5. ✅ Create sample data (books, characters, scenes)
6. ✅ Verify database persistence
7. ✅ Ready to build Electron wrapper!

---

## 💡 For Electron App Developers

### Automated Docker Handling

**The scripts automatically:**
1. Detect if Docker Desktop is installed
2. Start Docker Desktop if not running
3. Wait up to 60 seconds for Docker to be ready
4. Exit with specific error codes if Docker is missing or won't start

**Your Electron app should:**
1. Catch exit code 2 (Docker not installed) → Show download dialog
2. Catch exit code 3/4 (Docker won't start) → Show manual start message
3. Handle all script output for progress display

### Recommended Workflow

1. **On First Launch:** Call `setup-all.ps1` (Win) or `setup-all.sh` (Mac)
   - Show setup wizard to collect environment variables
   - Generate `.env` file with user input
   - Execute script and display progress
   - ~2-3 minutes

2. **Every Launch:** Call `run.ps1` (Win) or `run.sh` (Mac)
   - No user interaction needed
   - Display "Starting services..." message
   - ~10-30 seconds

3. **Check for Updates:** Periodically call `download-typingmind.ps1 -Force`
   - Run in background (weekly check)
   - Notify user if update available

4. **Diagnostics:** Call `test-docker-stack.ps1 -Verbose`
   - On error or user request
   - Display detailed status in UI

### Important Persistence

**Persists between runs:**
- `.env` file (user credentials, never regenerated)
- Docker images (no rebuild unless `-Force`)
- Docker volumes (database data)
- Typing Mind static files

**Only user interaction:**
- Fill out environment variable form (first time only)
- Everything else is automated

**See `ELECTRON-INTEGRATION.md` for complete code examples.**

---

## 🤝 Support

- **Issues:** Check troubleshooting section above
- **Logs:** Always start with `docker-compose logs`
- **Health Check:** Run `.\test-docker-stack.ps1 -Verbose`
- **GitHub:** Report issues in main repository

---

## 📄 License

See main repository LICENSE file. Typing Mind is proprietary - see their license at https://github.com/TypingMind/typingmind
