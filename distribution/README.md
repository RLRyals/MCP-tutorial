# MCP Writing System - Distribution Package

Complete standalone Docker-based setup for the MCP Writing System with Typing Mind integration.

## 🎯 For Electron App Integration

This distribution is designed to be completely automated for Electron app integration.

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

### Available Scripts

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `setup-all.ps1` | First-time setup | First launch of Electron app |
| `run.ps1` | Start services | Every time Electron app opens |
| `test-docker-stack.ps1` | Verify/diagnose | Troubleshooting |
| `download-typingmind.ps1` | Update Typing Mind | Check for updates |

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

### Recommended Workflow

1. **On First Launch:** Run `.\setup-all.ps1`
   - Downloads everything
   - Creates `.env` (user can edit if needed)
   - Builds images
   - ~2-3 minutes

2. **Every Launch:** Run `.\run.ps1`
   - Uses existing `.env`
   - Starts containers (if not running)
   - ~10-30 seconds

3. **Check for Updates:** Periodically run `.\download-typingmind.ps1 -Force`
   - Downloads latest Typing Mind
   - Restarts web container

4. **Diagnostics:** Run `.\test-docker-stack.ps1 -Verbose`
   - Checks all services
   - Shows detailed status

### Important Notes

- `.env` file persists between runs (user credentials saved)
- Docker images persist (no rebuild needed)
- Only Typing Mind static files update frequently
- Database data stored in Docker volume (persists)

---

## 🤝 Support

- **Issues:** Check troubleshooting section above
- **Logs:** Always start with `docker-compose logs`
- **Health Check:** Run `.\test-docker-stack.ps1 -Verbose`
- **GitHub:** Report issues in main repository

---

## 📄 License

See main repository LICENSE file. Typing Mind is proprietary - see their license at https://github.com/TypingMind/typingmind
